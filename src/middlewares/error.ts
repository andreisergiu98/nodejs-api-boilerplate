import {AppError} from '../lib/app-error';

export async function catchError(ctx: App.Context, next: () => Promise<void>) {
    try {
        await next();
    } catch (e) {
        ctx.body = e.message;
        ctx.status = e.status || 500;

        if (ctx.status === 500) {
            logError(ctx, e);
            ctx.body = 'Internal Server Error';
            ctx.app.emit('error', e, ctx);
        }
    }
}

export function logError(ctx: App.Context, e: Error | AppError) {
    const namespace = (e as AppError).namespace || ctx.state.namespace;
    const logger = ctx.log.child({
        name: namespace,
    });
    logger.error(e);
}