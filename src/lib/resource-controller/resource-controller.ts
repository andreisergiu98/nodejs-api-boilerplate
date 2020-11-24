import Router from '@koa/router';
import {EntityTarget} from 'typeorm';

import {DbClient} from '../db-client';
import {ResourceService} from '../resource-service';

import {
    getFindManyOptions,
    getFindOneOptions,
    validateArrayPayload,
    validatePayload
} from './resource-controller-utils';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

export class ResourceController<T> {
    private readonly router = new Router();
    private readonly service: ResourceService<T>;

    constructor(
        private readonly db: DbClient,
        private readonly targetEntity: EntityTarget<T>
    ) {
        this.service = new ResourceService<T>(this.db, this.targetEntity);

        this.router.use(this.secure);

        this.router.get('/', this.getAll);
        this.router.get('/:id([0-9]+)', this.getById);

        this.router.post('/', this.create);

        this.router.put('/', this.updateMany);
        this.router.put('/:id([0-9]+)', this.updateOne);

        this.router.patch('/:id([0-9]+)', this.patch);

        this.router.del('/:id([0-9]+)', this.delete);
    }

    routes = () => {
        return this.router.routes();
    };

    protected getAll = async (ctx: App.Context) => {
        ctx.body = await this.service.getMany(this.getFindManyOptions(ctx));
        ctx.status = 200;
    };

    protected getById = async (ctx: App.Context) => {
        const id = Number(ctx.params.id);
        const res = await this.service.getById(id, this.getFindOneOptions(ctx));
        if (!res) {
            ctx.throw(404);
        }
        ctx.body = res;
        ctx.status = 200;
    };

    protected create = async (ctx: App.Context) => {
        const payload = await this.validatePayload(ctx);
        ctx.body = await this.service.create(payload);
        ctx.status = 201;
    };

    protected updateOne = async (ctx: App.Context) => {
        const id = Number(ctx.params.id);
        const payload = await this.validatePayload(ctx);
        ctx.body = await this.service.update(id, payload);
        ctx.status = 200;
    };

    protected updateMany = async (ctx: App.Context) => {
        const payload = await this.validateArrayPayload(ctx);
        ctx.body = await this.service.updateMany(payload);
        ctx.status = 200;
    };

    protected patch = async (ctx: App.Context) => {
        const id = Number(ctx.params.id);
        const body = ctx.request.body as QueryDeepPartialEntity<T>;
        ctx.body = await this.service.patch(id, body);
        ctx.status = 200;
    };

    protected delete = async (ctx: App.Context) => {
        const id = Number(ctx.params.id);
        await this.service.delete(id);
        ctx.status = 204;
    };

    protected secure = (ctx: App.Context, next: () => Promise<void>) => {

    };

    protected getFindOneOptions = (ctx: App.Context) => {
        const rawQuery = ctx.query.q;
        if (!rawQuery) return {};

        return getFindOneOptions(rawQuery, this.db, this.targetEntity);
    };

    protected getFindManyOptions = (ctx: App.Context) => {
        const rawQuery = ctx.query.q;
        if (!rawQuery) return {};

        return getFindManyOptions(rawQuery, this.db, this.targetEntity);
    };

    private validatePayload = async (ctx: App.Context) => {
        return validatePayload(this.db, this.targetEntity, ctx.request.body);
    };

    private validateArrayPayload = async (ctx: App.Context) => {
        return validateArrayPayload(this.db, this.targetEntity, ctx.request.body);
    };
}