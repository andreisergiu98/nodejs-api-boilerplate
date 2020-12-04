import {google} from 'googleapis';
import {TokenSet, UserinfoResponse} from 'openid-client';

import {config} from '../../config';

import {User} from '../user';
import {DbClient} from '../../lib/db-client';

export class GoogleUserService {
    private readonly googleOptions = config.google;

    constructor(
        private readonly db: DbClient
    ) {
    }

    async findUserOrCreate(userInfo: UserinfoResponse, tokens: TokenSet) {
        let user = await this.findUser(userInfo);
        if (user) return user;

        await this.createUser(userInfo, tokens);
        user = await this.findUser(userInfo);
        return user!;
    }

    private async findUser(userData: UserinfoResponse) {
        return this.db.manager.findOne(User, {
            where: {
                googleId: userData.sub,
            },
        });
    }

    private async createUser(userData: UserinfoResponse, tokens: TokenSet) {
        const [
            birthday,
            phoneNumber,
        ] = await Promise.all([
            this.getUserBirthday(tokens),
            this.getUserPhoneNumber(tokens),
        ]);

        const user = this.db.manager.create(User, {
            email: userData.email,
            googleId: userData.sub,
            picture: userData.picture,
            givenName: userData.given_name,
            familyName: userData.family_name,

            birthday,
            phoneNumber,
        });
        await this.db.manager.insert(User, user);
    }

    private async getUserPhoneNumber(tokens: TokenSet) {
        try {
            const authClient = this.createOAuth2Client(tokens);

            const peopleService = google.people({
                version: 'v1',
                auth: authClient,
            });
            const request = await peopleService.people.get({
                resourceName: 'people/me',
                personFields: 'phoneNumbers',
            });

            return request.data.phoneNumbers?.[0].value;
        } catch (e) {
            console.log(e);
        }
    }

    private async getUserBirthday(tokens: TokenSet) {
        try {
            const authClient = this.createOAuth2Client(tokens);

            const peopleService = google.people({
                version: 'v1',
                auth: authClient,
            });
            const request = await peopleService.people.get({
                resourceName: 'people/me',
                personFields: 'birthdays',
            });
            const birthday = request.data.birthdays?.[1].date;
            if (!birthday) return;

            const {year, month, day} = birthday;

            if (year && month && day) {
                return new Date(year, month, day);
            }
        } catch (e) {
            console.log(e);
        }
    }

    private createOAuth2Client(tokens: TokenSet) {
        const authClient = new google.auth.OAuth2(
            this.googleOptions.id,
            this.googleOptions.secret,
            this.googleOptions.redirect
        );
        authClient.setCredentials(tokens);
        return authClient;
    }
}