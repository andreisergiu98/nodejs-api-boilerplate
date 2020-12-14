import Koa from 'koa';
import cors from '@koa/cors';

import etag from 'koa-etag';
import bodyparser from 'koa-bodyparser';

import {config} from './config';
import {createKoaLogger} from './lib/logger';

import {catchError} from './middlewares/error';
import {conditional} from './middlewares/etag';

import {initConnections} from './loader/connections';

import {routes} from './api';

class Server {
	readonly app = new Koa();
	private readonly koaLogger = createKoaLogger();

	constructor() {
	}

	private get logger() {
		return this.koaLogger.logger;
	}

	async init() {
		try {
			await initConnections();

			this.app.use(this.koaLogger);

			this.app.use(catchError());

			this.app.use(bodyparser());

			this.app.use(cors(config.cors));

			this.app.use(conditional());
			this.app.use(etag());

			this.app.use(routes);

			this.app.listen(config.node.port);

			this.logger.info(`Server is running on port ${config.node.port}\n`);
		} catch (e) {
			this.logger.error(e);
		}
	}
}

export const server = new Server();
server.init().then();
