/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import {TokenSet} from 'openid-client';
import {fromBase64, toBase64} from './auth-utils';

export const AUTH_SESSION_COOKIE = 'session';

export interface SessionTokens {
    tokenSet: TokenSet;
}

export interface SessionTokensRaw {
    tokenSet: {
        scope: string;
        access_token: string;
        token_type: string;
        id_token: string;
        expires_at: number;
    };
}

export interface SessionUserData {
    user: {
        sub: string;
        email: string;
    };
}

export function serializeSession(session: SessionTokens): string {
    return toBase64(session);
}

export function deserializeSession(value: string): SessionTokensRaw {
    return fromBase64<SessionTokensRaw>(value);
}

export function getSessionCookie(ctx: App.Context) {
    return ctx.cookies.get(AUTH_SESSION_COOKIE);
}

export function setSessionCookie(ctx: App.Context, session: string): void {
    ctx.cookies.set(AUTH_SESSION_COOKIE, session, {
        httpOnly: true,
        expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
    });
}

export function clearSessionCookie(ctx: App.Context): void {
    ctx.cookies.set(AUTH_SESSION_COOKIE, '');
}