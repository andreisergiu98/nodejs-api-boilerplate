/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import {Issuer, Client, CallbackParamsType} from 'openid-client';
import {config} from '../../config';

const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/user.birthday.read',
    'https://www.googleapis.com/auth/user.phonenumbers.read',
];

export class GoogleOpenId {
    private authClient?: Client;

    async discoverIssuer() {
        return Issuer.discover('https://accounts.google.com');
    }

    async getAuthUrl(state: string) {
        const client = await this.getClient();
        return client.authorizationUrl({
            state,
            scope: scopes.join(' '),
        });
    }

    async getClient() {
        if (this.authClient) {
            return this.authClient;
        }
        return this.loadClient();
    }

    async getTokens(params: CallbackParamsType, state: string) {
        const client = await this.getClient();
        return client.callback(config.google.redirect, params, {state});
    }

    private async loadClient() {
        const googleIssuer = await this.discoverIssuer();
        this.authClient = new googleIssuer.Client({
            client_id: config.google.id,
            client_secret: config.google.secret,
            redirect_uris: [config.google.redirect],
            response_types: ['code'],
        });
        return this.authClient;
    }
}