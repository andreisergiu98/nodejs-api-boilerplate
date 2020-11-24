import cors from '@koa/cors';
import {createDbConfig} from './db';
import {createRedisConfig} from './redis';

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
            ...createRedisConfig(process.env.SESSION_STORAGE!, 'redis'),
        },
    },
};