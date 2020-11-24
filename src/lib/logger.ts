import pino, {LoggerOptions} from 'pino';

export function createLogger(options: LoggerOptions) {
    return pino({
        prettyPrint: {colorize: true, translateTime: true},
        ...options,
    });
}

export type Logger = pino.BaseLogger;