import {DbClient} from '../../lib/db-client';
import {RedisClient} from '../../lib/redis-client';

import {RBACCache} from './RBAC-cache';

import {AccessGroup} from '../access-group';
import {AccessRolePermissions} from '../access-role-permissions';

export interface Permission {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
}

export class RBACService {
    private readonly cache;

    constructor(
        private readonly db: DbClient,
        private readonly redis: RedisClient) {

        this.cache = new RBACCache(redis);
    }

    async getUserPermissions(roleIds: number[], groupTag: string) {
        const permissions = await Promise.all(
            roleIds.map(roleId => this.getRolePermissions(roleId, groupTag))
        );
        return this.getMergedPermissions(permissions);
    }

    protected async getRolePermissions(roleId: number, accessTag: string) {
        const cached = await this.cache.getRolePermission(roleId, accessTag);
        if (cached) return cached;

        const group = await this.db.manager.findOne(AccessGroup, {
            where: {tag: accessTag},
        });

        if (!group) {
            await this.createAccessGroup(accessTag);
            return this.getDefaultPermissions();
        }

        const permission = await this.db.manager.findOne(AccessRolePermissions, {
            where: {roleId, groupId: group.id},
        });

        if (!permission) {
            return this.getDefaultPermissions();
        }

        await this.cache.cacheRolePermission(roleId, accessTag, permission);

        return {
            read: permission.read,
            create: permission.create,
            update: permission.update,
            delete: permission.delete,
        };
    }

    protected async createAccessGroup(groupTag: string) {
        return this.db.manager.insert(AccessGroup, {
            tag: groupTag,
            description: '',
        });
    }

    protected getMergedPermissions(permissions: Permission[]) {
        let read = false;
        let create = false;
        let update = false;
        let del = false;

        for (const permission of permissions) {
            if (permission?.read === true) read = true;
            if (permission?.create === true) create = true;
            if (permission?.update === true) update = true;
            if (permission?.delete === true) del = true;
        }

        return {
            read,
            create,
            update,
            delete: del,
        };
    }

    protected getDefaultPermissions() {
        return {
            read: false,
            create: false,
            update: false,
            delete: false,
        };
    }
}