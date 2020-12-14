import IORedis from 'ioredis';
import {parseUrl} from './utils';

export function createRedisConfig(connection: string, name: string) {
	const url = parseUrl(connection);

	return {
		db: Number(url.database),
		host: url.hostname,
		port: url.port,
		username: url.username,
		password: url.password,
		connectionName: name,
	} as IORedis.RedisOptions;
}