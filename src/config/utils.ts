import {URL} from 'url';

export function checkIfEnvExist(env: string[]) {
    const missing = [];
    for (const el of env) {
        if (!process.env[el]) {
            missing.push(el);
        }
    }
    if (missing.length > 1) {
        throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
    if (missing.length > 0) {
        throw new Error(`Missing env var: ${missing[0]}`);
    }
}

export function parseUrl(url: string) {
    const parsedUrl = new URL(url);
    return {
        type: parsedUrl.protocol.slice(0, parsedUrl.protocol.length - 1),
        database: parsedUrl.pathname.slice(1),
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || undefined,
        username: parsedUrl.username || undefined,
        password: parsedUrl.password || undefined,
    };
}