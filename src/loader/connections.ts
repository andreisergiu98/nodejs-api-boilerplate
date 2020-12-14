import {config} from '../config';
import {DbClient} from '../lib/db-client';
import {RedisClient} from '../lib/redis-client';

export const dbClient = new DbClient(config.databases.sql);
export const redisClient = new RedisClient(config.databases.redis);

export async function initConnections() {
	return Promise.all([
		dbClient.connect(),
		redisClient.connect(),
	]);
}

