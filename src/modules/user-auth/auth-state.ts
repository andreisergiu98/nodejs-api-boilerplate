import {generators} from 'openid-client';
import {fromBase64, toBase64} from './auth-utils';

export const AUTH_STATE_COOKIE = 'auth-state';

export interface AuthState {
    backToPath: string;
    bytes: string;
}

export function serializeAuthState(state: Partial<AuthState>): string {
    return toBase64({
        ...state,
        bytes: generators.state(),
    });
}

export function deserializeAuthState(value: string): AuthState {
    return fromBase64(value);
}

export function getAuthStateCookie(ctx: App.Context): string {
    return ctx.cookies.get(AUTH_STATE_COOKIE) as string;
}

export function setAuthStateCookie(ctx: App.Context, state: string): void {
    ctx.cookies.set(AUTH_STATE_COOKIE, state, {
        maxAge: 15 * 60 * 1000,
        // no access from javascript
        httpOnly: true,
        // only access from our site
        // Unfortunately the cookie behavior has recently changed
        // and so we need to do this in order for the redirects to carry on our state cookie
        sameSite: false,
        // recommended when not running in localhost
        //secure: true
    });
}
