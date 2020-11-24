import Koa from 'koa';
import {parse} from 'qs';

export function patchQs(server: Koa) {
    Object.defineProperty(server.request, 'query', {
        get(this: Koa.Request & { _querycache: { [p: string]: {} } }) {
            const str = this.querystring;
            if (!str) return {};
            // eslint-disable-next-line no-underscore-dangle
            const cache = this._querycache = this._querycache || {};
            return cache[str] || (cache[str] = parse(str));
        },
    });
}