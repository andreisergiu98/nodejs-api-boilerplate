import Koa from 'koa';
import cors from '@koa/cors';
import logger from 'koa-pino-logger';
import bodyparser from 'koa-bodyparser';

import {patchQs} from './utils/qs';

import {config} from './config';
import {catchError} from './middlewares/error';
import {initConnections} from './loader/connections';

class Server {
    app: Koa;

    constructor() {
        this.app = new Koa();
        patchQs(this.app);
    }

    private async initAsync() {
        await initConnections();

        this.app.use(logger({
            prettyPrint: {
                colorize: true,
                translateTime: true,
            },
        }));

        this.app.use(catchError);

        this.app.use(bodyparser());

        this.app.use(cors(config.cors));

        this.app.listen(config.node.port);
    }

    init() {
        this.initAsync().then(() => {
            console.log(`Server is running on port ${config.node.port}\n`);
        }).catch((e) => {
            console.log(e.message);
        });
    }
}

export const server = new Server();
server.init();
