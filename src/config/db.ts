import {ConnectionOptions} from 'typeorm';

import {parseUrl} from './utils';
import {snakeCaseNamingStrategy} from '../utils/db';

import {AccessRole} from '../modules/access-role';
import {AccessGroup} from '../modules/access-group';
import {AccessRolePermissions} from '../modules/access-role-permissions';

import {User} from '../modules/user';
import {UserSession} from '../modules/user-session';

const models = [
    AccessRole,
    AccessGroup,
    AccessRolePermissions,

    User,
    UserSession,
];

export function createDbConfig(connection: string, name: string, isProduction: boolean) {
    const dbUrl = parseUrl(connection);

    return {
        name,
        charset: 'utf8mb4',
        logging: !isProduction,
        synchronize: !isProduction,
        entities: models,
        namingStrategy: snakeCaseNamingStrategy,
        type: dbUrl.type,
        host: dbUrl.hostname,
        port: dbUrl.port,
        database: dbUrl.database,
        username: dbUrl.username,
        password: dbUrl.password,
    } as ConnectionOptions;
}
