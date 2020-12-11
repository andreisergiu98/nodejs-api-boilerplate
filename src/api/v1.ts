import Router from '@koa/router';
import {LoginController} from '../modules/user-auth';

import {dbClient} from '../loader/connections';

const authController = new LoginController(dbClient, {
    whitelist: ['/v1/auth/login', '/v1/auth/callback', '/v1/auth/silent-callback'],
});

const router = new Router();

router.use(authController.authenticateUser);

router.use('/auth', authController.routes());

router.get('/test', (ctx) => {
    ctx.body = 123;
    ctx.status = 200;
});

export const routesV1 = router.routes();