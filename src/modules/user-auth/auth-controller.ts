import Router from '@koa/router';
import {TokenSet} from 'openid-client';

import {DbClient} from '../../lib/db-client';

import {GoogleOpenId} from './google-open-id';
import {GoogleUserService} from './google-user-service';

import {
    clearAuthStateCookie,
    deserializeAuthState,
    getAuthStateCookie,
    serializeAuthState,
    setAuthStateCookie,
} from './auth-state';
import {getSessionCookie, setSessionCookie} from './auth-session';

import {AppError} from '../../lib/app-error';
import {getDeviceInfo} from '../../utils/device';
import {UserSessionService} from '../user-session';

interface AuthOptions {
	whitelist?: string[];
}

export class LoginController {
	private readonly router = new Router();
	private readonly whitelist: string[];

	private readonly googleOpenId = new GoogleOpenId();
	private readonly googleUserService;

	private readonly userSessionService;

	private readonly namespace = 'auth';

	constructor(
		private readonly db: DbClient,
		options?: AuthOptions
	) {
		this.googleUserService = new GoogleUserService(db);
		this.userSessionService = new UserSessionService(db);

		this.whitelist = options?.whitelist ?? [];

		this.router.use(this.mountNamespace);

		this.router.get('/login', this.login);
		this.router.get('/logout', this.logout);
		this.router.get('/callback', this.callback);
		this.router.get('/silent-callback', this.silentCallback);
	}

	routes = () => {
		return this.router.routes();
	};

	authenticateUser = async (ctx: App.Context, next: () => Promise<void>) => {
		if (this.whitelist.includes(ctx.path)) {
			return next();
		}

		const session = await this.validateSession(ctx);
		const tokenSet = new TokenSet(session.tokenSet);

		if (tokenSet.expired()) {
			throw new AppError(401, 'Session has expired', this.namespace);
		}

		const googleUser = tokenSet.claims();

		ctx.state.session = {
			userId: session.userId,
			googleId: googleUser.sub,
			sessionId: session.sessionId,
			tokenSet,
		};

		return next();
	};

	private login = async (ctx: App.Context) => {
		const backToPath = (ctx.query.backTo as string) || '/';
		const silent = ctx.query.silent === 'true';

		const {redirectUrl, codeVerifier} = await this.googleOpenId.createAuthUrl(silent);

		const state = serializeAuthState({backToPath, codeVerifier});

		setAuthStateCookie(ctx, state);
		ctx.redirect(redirectUrl);
	};

	private callback = async (ctx: App.Context) => {
		const state = getAuthStateCookie(ctx);

		const {backToPath, codeVerifier} = deserializeAuthState(state);

		const client = await this.googleOpenId.getClient();
		const params = client.callbackParams(ctx.req);

		const tokenSet = await this.googleOpenId.callback(params, codeVerifier);
		const userInfo = await client.userinfo(tokenSet);
		const user = await this.googleUserService.findUserOrCreate(userInfo, tokenSet);

		const device = getDeviceInfo(ctx.get('user-agent'));
		const sessionToken = await this.userSessionService.createSession(user.id, tokenSet, device);

		setSessionCookie(ctx, sessionToken);
		clearAuthStateCookie(ctx);

		ctx.redirect(backToPath);
	};

	private silentCallback = async (ctx: App.Context) => {
		let status = 200;

		try {
			const session = await this.validateSession(ctx);
			const state = getAuthStateCookie(ctx);

			const {codeVerifier} = deserializeAuthState(state);

			const client = await this.googleOpenId.getClient();
			const params = client.callbackParams(ctx.req);

			const tokenSet = await this.googleOpenId.silentCallback(params, codeVerifier);

			const sessionToken = await this.userSessionService.reuseSession(session.sessionId, tokenSet);

			if (!sessionToken) {
				throw new AppError(401, 'Session has expired', this.namespace);
			}

			// @ts-ignore
			setSessionCookie(ctx, sessionToken);
			clearAuthStateCookie(ctx);
		} catch (e) {
			status = e.status || 401;
		}

		ctx.body = `
            <html>
            <head>
                <script>parent.postMessage({type: 'SILENT_REFRESH', ok: ${status === 200}}, '${ctx.headers['referer']}')</script>
            </head>
            <body></body>
            </html> 
        `;
		ctx.status = status;
	};

	private logout = async (ctx: App.Context) => {

	};

	private validateSession = async (ctx: App.Context) => {
		const sessionToken = getSessionCookie(ctx);

		if (!sessionToken) {
			throw new AppError(401, 'Unauthorized', this.namespace);
		}

		let session;

		try {
			session = await this.userSessionService.decodeSessionToken(sessionToken);
		} catch (e) {
			throw new AppError(401, 'Session is tampered', this.namespace);
		}

		return session;
	};

	private mountNamespace = (ctx: App.Context, next: () => Promise<void>) => {
		ctx.state.namespace = 'auth';
		return next();
	};
}