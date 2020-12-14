/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import jwt from 'jsonwebtoken';
import {TokenSet} from 'openid-client';

import {UserSession} from './user-session';

import {config} from '../../config';
import {DbClient} from '../../lib/db-client';
import {Device} from '../../utils/device';

interface Session {
	userId: number;
	sessionId: number;
	tokenSet: TokenSet;
}

interface SessionRaw {
	userId: number;
	sessionId: number;
	tokenSet: {
		scope: string;
		access_token: string;
		token_type: string;
		id_token: string;
		expires_at: number;
	};
}

export class UserSessionService {
	constructor(
		private readonly db: DbClient,
		private readonly jwtSecret = config.session.secret
	) {
	}

	async createSession(userId: number, tokenSet: TokenSet, device: Device) {
		const session = await this.db.manager.create(UserSession, {
			userId,
			enabled: true,
			deviceOS: device.os,
			browser: device.browser,
		});
		const res = await this.db.manager.insert(UserSession, session);

		return this.createSessionToken({
			userId,
			tokenSet,
			sessionId: res.raw[0].id,
		});
	}

	async reuseSession(sessionId: number, tokenSet: TokenSet) {
		const session = await this.db.manager.findOne(UserSession, {
			where: {id: sessionId, enabled: true},
		});
		if (!session) {
			return;
		}
		return this.createSessionToken({
			sessionId,
			userId: session.userId,
			tokenSet,
		});
	}

	async decodeSessionToken(token: string) {
		return new Promise((resolve, reject) => {
			jwt.verify(token, this.jwtSecret, (err, payload) => {
				if (err) return reject(err);
				resolve(payload as SessionRaw);
			});
		}) as Promise<SessionRaw>;
	}

	private async createSessionToken(payload: Session) {
		delete payload.tokenSet.refresh_token;

		return new Promise((resolve, reject) => {
			jwt.sign(payload, this.jwtSecret, (err, token) => {
				if (err) return reject(err);
				resolve(token as string);
			});
		}) as Promise<string>;
	}
}