export const AUTH_SESSION_COOKIE = 'session';

export function getSessionCookie(ctx: App.Context) {
	return ctx.cookies.get(AUTH_SESSION_COOKIE);
}

export function setSessionCookie(ctx: App.Context, session: string): void {
	ctx.cookies.set(AUTH_SESSION_COOKIE, session, {
		httpOnly: true,
		expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
	});
}