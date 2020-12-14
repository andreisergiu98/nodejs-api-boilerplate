/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import {CallbackParamsType, Client, generators, Issuer} from 'openid-client';
import {config} from '../../config';

const scopes = [
	'openid',
	'email',
	'profile',
	'https://www.googleapis.com/auth/user.gender.read',
	'https://www.googleapis.com/auth/user.birthday.read',
	'https://www.googleapis.com/auth/user.phonenumbers.read',
];

export class GoogleOpenId {
	private authClient?: Client;

	async discoverIssuer() {
		return Issuer.discover('https://accounts.google.com');
	}

	async getClient() {
		if (this.authClient) {
			return this.authClient;
		}
		return this.loadClient();
	}

	async createAuthUrl(silent = false) {
		const client = await this.getClient();
		const codeVerifier = generators.codeVerifier();
		const codeChallenge = generators.codeChallenge(codeVerifier);

		let prompt = undefined;
		let redirectUri = config.google.redirect;

		if (silent) {
			prompt = 'none';
			redirectUri = config.google.silentRedirect;
		}

		const redirectUrl = await client.authorizationUrl({
			prompt,
			redirect_uri: redirectUri,
			scope: scopes.join(' '),
			code_challenge: codeChallenge,
			code_challenge_method: 'S256',
		});

		return {
			redirectUrl,
			codeVerifier,
		};
	}

	async callback(params: CallbackParamsType, codeVerifier: string) {
		const client = await this.getClient();
		return client.callback(config.google.redirect, params, {
			code_verifier: codeVerifier,
		});
	}

	async silentCallback(params: CallbackParamsType, codeVerifier: string) {
		const client = await this.getClient();
		return client.callback(config.google.silentRedirect, params, {
			code_verifier: codeVerifier,
		});
	}

	private async loadClient() {
		const googleIssuer = await this.discoverIssuer();
		this.authClient = new googleIssuer.Client({
			client_id: config.google.id,
			client_secret: config.google.secret,
			redirect_uris: [config.google.redirect, config.google.silentRedirect],
			response_types: ['code'],
		});
		return this.authClient;
	}
}