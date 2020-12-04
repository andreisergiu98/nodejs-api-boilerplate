import {LessThan} from 'typeorm';
import {TokenSet} from 'openid-client';

import {User} from '../user';
import {UserSession} from './user-session';
import {DbClient} from '../../lib/db-client';

import {Device} from '../../utils/device';

export class UserSessionService {
    constructor(
        private readonly db: DbClient
    ) {
    }

    async saveToken(userId: number, tokenSet: TokenSet, device?: Device) {
        const expireDate = new Date((tokenSet.expires_at ?? 0) * 1000);

        const userToken = this.db.manager.create(UserSession, {
            userId,
            scope: tokenSet.scope?.split(' ') ?? [],
            idToken: tokenSet.id_token,
            expiresAt: expireDate,
            tokenType: tokenSet.token_type,
            accessToken: tokenSet.access_token,

            deviceOs: device?.os,
            deviceBrowser: device?.browser,
        });
        await this.db.manager.insert(UserSession, userToken);
    }

    async saveTokenBySub(googleId: string, tokenSet: TokenSet) {
        const user = await this.db.manager.findOne(User, {
            where: {googleId},
        });
        if (!user) return;
        await this.saveToken(user.id, tokenSet);
    }

    async disableToken(accessToken: string) {
        await this.db.manager.createQueryBuilder()
            .update(UserSession)
            .where('accessToken = :accessToken', {accessToken})
            .set({enabled: false})
            .execute();
    }

    async disableExpired() {
        const expiredTokens = await this.db.manager.find(UserSession, {
            where: {
                enabled: true,
                expiresAt: LessThan(new Date()),
            },
        });
        if (expiredTokens.length === 0) return;

        const ids = expiredTokens.map(el => el.id);
        await this.db.manager.createQueryBuilder()
            .update(UserSession)
            .whereInIds(ids)
            .set({enabled: false})
            .execute();
    }
}