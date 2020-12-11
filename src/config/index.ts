import cors from '@koa/cors';

import {createDbConfig} from './db';
import {createRedisConfig} from './redis';

import {checkIfEnvExist} from './utils';

checkIfEnvExist([
    'PORT',
    'NODE_ENV',

    'DB',
    'REDIS',
    'SESSION_STORAGE',

    'JWT_SECRET',

    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CLIENT_REDIRECT',
    'GOOGLE_CLIENT_SILENT_REDIRECT',
]);

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
    isProduction,
    node: {
        port: process.env.PORT || 8081,
    },
    cors: {
        credentials: true,
        origin: ctx => ctx.request.header.origin,
    } as cors.Options,
    databases: {
        sql: {
            ...createDbConfig(process.env.DB!, 'default', isProduction),
        },
        redis: {
            ...createRedisConfig(process.env.REDIS!, 'redis'),
        },
        sessionStorage: {
            ...createRedisConfig(process.env.SESSION_STORAGE!, 'session storage'),
        },
    },
    session: {
        ttl: 60 * 60 * 1000, // 1 hour
        secret: process.env.JWT_SECRET!,
    },
    google: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect: process.env.GOOGLE_CLIENT_REDIRECT!,
        silentRedirect: process.env.GOOGLE_CLIENT_SILENT_REDIRECT!,
    },
};