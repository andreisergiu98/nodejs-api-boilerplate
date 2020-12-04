import pino, {LoggerOptions} from 'pino';
import pinoLogger from 'koa-pino-logger';

function createOptions(options?: LoggerOptions) {
    return {
        prettyPrint: {
            colorize: true,
            translateTime: true,
        },
        level: 'info',
        ...options,
    } as LoggerOptions;
}

export function createLogger(options?: LoggerOptions) {
    return pino(createOptions(options));
}

export function createKoaLogger(options?: LoggerOptions) {
    return pinoLogger(createOptions({
        level: 'warn',
        ...options,
    }));
}

export type Logger = pino.BaseLogger;