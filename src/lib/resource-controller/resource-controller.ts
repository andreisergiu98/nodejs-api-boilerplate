import Router from '@koa/router';
import {EntityTarget} from 'typeorm';

import {DbClient} from '../db-client';
import {RedisClient} from '../redis-client';
import {ResourceService} from '../resource-service';

import {parseResourceQuery} from '../resource-query';
import {
	getFindManyOptions,
	getFindOneOptions,
	validateArrayPayload,
	validatePayload
} from './resource-controller-utils';

import {RBACController} from '../../modules/RBAC';

export interface ControllerOptions {
	read?: boolean;
	create?: boolean;
	update?: boolean;
	updateMany?: boolean;
	delete?: boolean;

	secure?: boolean;
}

export class BaseController<T> {
	protected readonly router = new Router();

	constructor(
		protected readonly db: DbClient,
		protected readonly targetEntity: EntityTarget<T>,
	) {
	}

	protected mountDbQuery = async (ctx: App.Context, next: () => Promise<void>) => {
		if (ctx.method === 'GET' && ctx.query.q) {
			ctx.state.dbQuery = parseResourceQuery(ctx.query.q, this.db, this.targetEntity);
		}
		return next();
	};

	protected mountNamespace = async (ctx: App.Context, next: () => Promise<void>) => {
		ctx.state.namespace = this.db.connection.getMetadata(this.targetEntity).name;
		return next();
	};

	protected getRequestPayload = async (ctx: App.Context) => {
		return validatePayload(this.db, this.targetEntity, ctx.request.body);
	};

	protected getRequestArrayPayload = async (ctx: App.Context) => {
		return validateArrayPayload(this.db, this.targetEntity, ctx.request.body);
	};

	protected getRequestPartialPayload = async (ctx: App.Context) => {
		return validatePayload(this.db, this.targetEntity, ctx.request.body, true);
	};
}

export class ResourceController<T> extends BaseController<T> {
	protected readonly rbac: RBACController<T>;
	protected readonly service: ResourceService<T>;

	constructor(
		protected readonly db: DbClient,
		protected readonly redis: RedisClient,
		protected readonly targetEntity: EntityTarget<T>,
		protected readonly options: ControllerOptions = {},
	) {
		super(db, targetEntity);

		this.rbac = new RBACController(this.db, this.redis, this.targetEntity);
		this.service = new ResourceService<T>(this.db, this.targetEntity);

		this.router.use(this.mountDbQuery);
		this.router.use(this.mountNamespace);

		if (options.secure === false) {
			this.router.use(this.secure());
		}

		if (this.options.read !== false) {
			this.router.get('/', this.getAll);
			this.router.get('/:id([0-9]+)', this.getById);
		}
		if (this.options.create !== false) {
			this.router.post('/', this.create);
		}
		if (this.options.updateMany !== false) {
			this.router.put('/', this.updateMany);
		}
		if (this.options.update !== false) {
			this.router.put('/:id([0-9]+)', this.updateOne);
			this.router.patch('/:id([0-9]+)', this.patch);
		}
		if (this.options.delete !== false) {
			this.router.del('/:id([0-9]+)', this.delete);
		}
	}

	routes = () => {
		return this.router.routes();
	};

	protected secure = () => {
		return this.rbac.createMiddleware();
	};

	protected getAll = async (ctx: App.Context) => {
		ctx.body = await this.service.getMany(getFindManyOptions(ctx.state.dbQuery));
		ctx.status = 200;
	};

	protected getById = async (ctx: App.Context) => {
		const id = Number(ctx.params.id);
		ctx.body = await this.service.getById(id, getFindOneOptions(ctx.state.dbQuery));
		ctx.status = 200;
	};

	protected create = async (ctx: App.Context) => {
		let payload;

		if (Array.isArray(ctx.request.body)) {
			payload = await this.getRequestArrayPayload(ctx);
		} else {
			payload = await this.getRequestPayload(ctx);
		}

		ctx.body = await this.service.create(payload);
		ctx.status = 201;
	};

	protected updateOne = async (ctx: App.Context) => {
		const id = Number(ctx.params.id);
		const payload = await this.getRequestPayload(ctx);
		ctx.body = await this.service.update(id, payload);
		ctx.status = 200;
	};

	protected updateMany = async (ctx: App.Context) => {
		const payload = await this.getRequestArrayPayload(ctx);
		ctx.body = await this.service.updateMany(payload);
		ctx.status = 200;
	};

	protected patch = async (ctx: App.Context) => {
		const id = Number(ctx.params.id);
		const payload = await this.getRequestPartialPayload(ctx);
		ctx.body = await this.service.patch(id, payload);
		ctx.status = 200;
	};

	protected delete = async (ctx: App.Context) => {
		const id = Number(ctx.params.id);
		await this.service.delete(id);
		ctx.status = 204;
	};
}