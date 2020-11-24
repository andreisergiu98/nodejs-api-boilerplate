import {ConnectionOptions, createConnection, getConnection} from 'typeorm';
import {createLogger, Logger} from './logger';

export class DbClient {
    private readonly logger: Logger;
    private readonly config: ConnectionOptions;

    constructor(options: ConnectionOptions) {
        this.config = options;
        this.logger = createLogger({
            name: 'db-' + options.name,
        });
    }

    async connect() {
        this.logger.info('establishing connection...');
        await createConnection(this.config);
        this.logger.info('connection established!');
    }

    get connection() {
        return getConnection(this.config.name);
    }

    get manager() {
        return getConnection(this.config.name).manager;
    }
}