import Router from '@koa/router';
import {LoginController} from '../modules/user-auth';

import {dbClient} from '../loader/connections';

const authController = new LoginController(dbClient, {
    whitelist: ['/v1/auth/login', '/v1/auth/callback'],
});

const router = new Router();

router.use(authController.verifySession);

router.use('/auth', authController.routes());

export const routesV1 = router.routes();