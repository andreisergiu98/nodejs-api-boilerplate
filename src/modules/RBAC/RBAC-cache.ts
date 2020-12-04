import {RedisClient} from '../../lib/redis-client';
import {AccessRolePermissions} from '../access-role-permissions';

export class RBACCache {
    constructor(private readonly redis: RedisClient) {
    }

    async getRolePermission(roleId: number, accessTag: string) {
        const key = RBACCache.getPermissionCacheKey(accessTag, roleId);
        const res = await this.redis.hmget(key, 'read', 'create', 'update', 'delete');

        if (res[0] == null) return;
        if (res[1] == null) return;
        if (res[2] == null) return;
        if (res[3] == null) return;

        return {
            read: Number(res[0]) === 1,
            create: Number(res[1]) === 1,
            update: Number(res[2]) === 1,
            delete: Number(res[3]) === 1,
        };
    }

    async cacheRolePermission(roleId: number, accessTag: string, permission: AccessRolePermissions) {
        const key = RBACCache.getPermissionCacheKey(accessTag, roleId);

        return this.redis.hmset(key, {
            read: permission.read ? '1' : '0',
            create: permission.create ? '1' : '0',
            update: permission.update ? '1' : '0',
            delete: permission.delete ? '1' : '0',
        });
    }

    async clearCacheByRole(roleId: number) {
        const keys = await this.redis.scanStreamAsync({
            match: RBACCache.getPermissionCacheKey('*', roleId),
        });
        if (keys.length === 0) return;
        await this.redis.del(...keys);
    }

    async clearCacheByAccessGroup(groupTag: string) {
        const keys = await this.redis.scanStreamAsync({
            match: RBACCache.getPermissionCacheKey(groupTag, '*'),
        });
        if (keys.length === 0) return;
        await this.redis.del(...keys);
    }

    static getPermissionCacheKey(groupTag: string, roleId: number | string) {
        return `rbac:role#${roleId}:group#${groupTag}`;
    }
}