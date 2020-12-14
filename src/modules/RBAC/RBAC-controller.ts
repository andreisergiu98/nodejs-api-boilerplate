import {EntityTarget} from 'typeorm';

import {AppError} from '../../lib/app-error';
import {DbClient} from '../../lib/db-client';
import {RedisClient} from '../../lib/redis-client';

import {User} from '../user';
import {getTablesFromRelations} from './RBAC-utils';
import {Permission, RBACService} from './RBAC-service';

type MethodType = keyof Permission;

export class RBACController<T> {
	private readonly service: RBACService;
	private readonly namespace = 'RBAC';

	constructor(
		private readonly db: DbClient,
		private readonly redis: RedisClient,
		private readonly targetEntity: EntityTarget<T>
	) {
		this.service = new RBACService(db, redis);
	}

	protected static getMethodType(ctx: App.Context): MethodType | undefined {
		const method = ctx.method;

		if (method === 'GET') return 'read';
		if (method === 'POST') return 'create';
		if (method === 'PUT') return 'update';
		if (method === 'PATCH') return 'update';
		if (method === 'DELETE') return 'delete';
	}

	createMiddleware<T>(methodName?: MethodType) {
		return async (ctx: App.Context, next: () => Promise<void>) => {
			const method = methodName || RBACController.getMethodType(ctx);

			let relations = [];
			if (method === 'read') {
				relations = ctx.state.dbQuery.relations ?? [];
			}

			if (!method) {
				throw new AppError(500, `Invalid method name: '${methodName}'`, this.namespace);
			}

			const roleIds = await this.getRoles(ctx);
			const resources = this.getResources(relations);

			const permissionChecks = resources.map(
				resource => this.verifyPermission(roleIds, resource, method)
			);

			await Promise.all(permissionChecks);

			return next();
		};
	}

	protected async getRoles(ctx: App.Context) {
		const user = await this.db.manager.findOne(User, {
			where: {id: ctx.state.session.userId},
			relations: ['roles'],
		});
		const roleIds = user?.roles?.map(el => el.id) ?? [];

		if (!roleIds || roleIds.length === 0) {
			throw new AppError(403, 'User has no role. Cannot access resource!', this.namespace);
		}

		return roleIds;
	}

	protected async verifyPermission(roleIds: number[], resource: string, method: MethodType) {
		const permission = await this.service.getUserPermissions(roleIds, resource);
		if (!permission[method]) {
			throw new AppError(403, `You don't have permission to ${method} resource: '${resource}'`, this.namespace);
		}
	}

	protected getResources<T = unknown>(relations: string[] = []) {
		const metadata = this.db.connection.getMetadata(this.targetEntity);
		const resourceName = metadata.tableName;

		const relationsTables = getTablesFromRelations(relations, this.db, this.targetEntity);
		return [resourceName, ...relationsTables];
	}
}