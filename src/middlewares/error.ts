import {AppError} from '../lib/app-error';

function getNamespace(ctx: App.Context, e: Error | AppError) {
	return (e as AppError).namespace || ctx.state.namespace;
}

export function catchError() {
	return async function (ctx: App.Context, next: () => Promise<void>) {
		try {
			await next();
		} catch (e) {
			let message = e.message;
			const status = e.status || 500;
			const namespace = getNamespace(ctx, e);

			if (status === 500) {
				logError(ctx, e);
				message = 'Internal Server Error';
				ctx.app.emit('error', e, ctx);
			}

			ctx.body = {
				error: true,
				status,
				message,
				namespace,
			};
			ctx.status = status;
		}
	};
}

export function logError(ctx: App.Context, e: Error | AppError) {
	const namespace = getNamespace(ctx, e);
	const logger = ctx.log.child({
		name: namespace,
	});
	logger.error(e);
}