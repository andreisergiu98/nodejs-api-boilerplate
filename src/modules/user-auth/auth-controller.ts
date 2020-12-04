import Router from '@koa/router';
import {TokenSet} from 'openid-client';

import {DbClient} from '../../lib/db-client';

import {GoogleOpenId} from './google-open-id';
import {GoogleUserService} from './google-user-service';
import {UserSessionService} from '../user-session';

import {
    getAuthStateCookie,
    setAuthStateCookie,
    serializeAuthState,
    deserializeAuthState,
} from './auth-state';
import {
    getSessionCookie,
    setSessionCookie,
    serializeSession,
    clearSessionCookie,
    deserializeSession,
} from './auth-session';
import {AppError} from '../../lib/app-error';
import {getDeviceInfo} from '../../utils/device';

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
    }

    routes = () => {
        return this.router.routes();
    };

    verifySession = async (ctx: App.Context, next: () => Promise<void>) => {
        if (this.whitelist.includes(ctx.path)) {
            return next();
        }

        const sessionCookie = getSessionCookie(ctx);

        if (!sessionCookie) {
            throw new AppError(401, 'Unauthorized', this.namespace);
        }

        const session = deserializeSession(sessionCookie);

        let tokenSet;
        try {
            tokenSet = new TokenSet(session.tokenSet);
        } catch (e) {
            clearSessionCookie(ctx);
            throw new AppError(401, 'Session might be tampered', this.namespace);
        }

        try {
            if (tokenSet.expired()) {
                tokenSet = await this.refreshToken(ctx, tokenSet);
            }
        } catch (e) {
            clearSessionCookie(ctx);
            throw new AppError(401, 'Session is expired', this.namespace);
        }

        const user = tokenSet.claims();

        ctx.state.session = {
            user: {
                sub: user.sub,
                email: user.email!,
            },
            tokenSet,
        };

        return next();
    };

    private login = async (ctx: App.Context) => {
        const backToPath = (ctx.query.backTo as string) || '/';

        const state = serializeAuthState({
            backToPath,
        });

        const authUrl = await this.googleOpenId.getAuthUrl(state);

        setAuthStateCookie(ctx, state);
        ctx.redirect(authUrl);
    };

    private callback = async (ctx: App.Context) => {
        const existingSessionCookie = getSessionCookie(ctx);

        if (existingSessionCookie) {
            const {tokenSet} = deserializeSession(existingSessionCookie);
            await this.userSessionService.disableToken(tokenSet.access_token);
        }

        const state = getAuthStateCookie(ctx);

        const {backToPath} = deserializeAuthState(state);
        const client = await this.googleOpenId.getClient();

        const params = client.callbackParams(ctx.req);

        const tokenSet = await this.googleOpenId.getTokens(params, state);

        const userInfo = await client.userinfo(tokenSet);

        const user = await this.googleUserService.findUserOrCreate(userInfo, tokenSet);

        const deviceInfo = getDeviceInfo(ctx.get('user-agent'));
        await this.userSessionService.saveToken(user.id, tokenSet, deviceInfo);

        const session = serializeSession({tokenSet});
        setSessionCookie(ctx, session);

        ctx.redirect(backToPath);
    };

    private logout = async (ctx: App.Context) => {
        const client = await this.googleOpenId.getClient();
        const tokenSet = ctx.state.session.tokenSet;

        if (!tokenSet.access_token) {
            ctx.throw(401);
        }

        await client.revoke(tokenSet.access_token);
        await this.userSessionService.disableToken(tokenSet.access_token!);

        ctx.status = 204;
    };

    private refreshToken = async (ctx: App.Context, tokenSet: TokenSet) => {
        await this.userSessionService.disableToken(tokenSet.access_token!);

        const client = await this.googleOpenId.getClient();

        const refreshedTokenSet = await client.refresh(tokenSet);
        const user = refreshedTokenSet.claims();

        await this.userSessionService.saveTokenBySub(user.sub, refreshedTokenSet);

        const refreshedSession = serializeSession({tokenSet: refreshedTokenSet});
        setSessionCookie(ctx, refreshedSession);

        return refreshedTokenSet;
    };

    private mountNamespace = (ctx: App.Context, next: () => Promise<void>) => {
        ctx.state.namespace = 'auth';
        return next();
    };
}