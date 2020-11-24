import IORedis, {ScanStreamOption} from 'ioredis';
import {createLogger, Logger} from './logger';

export class RedisClient extends IORedis {
    private readonly logger: Logger;

    constructor(options: IORedis.RedisOptions) {
        super({
            ...options,
            lazyConnect: true,
        });

        this.logger = createLogger({
            name: this.options.connectionName,
        });

        this.on('error', e => {
            throw e;
        });
    }

    async connect() {
        this.logger.info('establishing connection...');
        await super.connect();
        this.logger.info('connection established!');
    }

    async scanStreamAsync(options: ScanStreamOption): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const keys: string[] = [];
            const stream = super.scanStream(options);
            stream.on('data', resultKeys => {
                for (let i = 0; i < resultKeys.length; i++) {
                    keys.push(resultKeys[i]);
                }
            });
            stream.on('end', () => {
                resolve(keys);
            });
            stream.on('error', err => {
                reject(err);
            });
        });
    }

    async cacheOneDay(key: string, payload: object) {
        return this.set(key, JSON.stringify(payload), 'EX', 24 * 60 * 60);
    }
}