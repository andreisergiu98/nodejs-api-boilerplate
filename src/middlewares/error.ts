import Koa from 'koa';
import {AppError} from '../lib/app-error';

export async function catchError(ctx: Koa.Context, next: () => Promise<void>) {
    try {
        await next();
    } catch (e) {
        logError(ctx, e);

        ctx.body = e.message;
        ctx.status = e.status || 500;

        if (ctx.status === 500) {
            ctx.body = 'Internal Server Error';
            ctx.app.emit('error', e, ctx);
        }
    }
}

export function logError(ctx: Koa.Context, e: Error | AppError) {
    ctx.log.error(e);
}