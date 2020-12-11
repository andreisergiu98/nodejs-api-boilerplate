export function conditional() {
    return async function (ctx: App.Context, next: () => Promise<void>) {
        await next();

        if (ctx.fresh) {
            ctx.status = 304;
            ctx.body = null;
        }
    };
}