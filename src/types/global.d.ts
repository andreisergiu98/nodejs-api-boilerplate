import {ParameterizedContext} from 'koa';
import {RouterParamContext} from '@koa/router';
import {TokenSet} from 'openid-client';
import {parseResourceQuery} from '../lib/resource-query';

declare global {
	export namespace App {
		export interface State {
			session: {
				userId: number;
				googleId: string;
				sessionId: number;
				tokenSet: TokenSet;
			};
			namespace: string;
			dbQuery: ReturnType<typeof parseResourceQuery>;
		}

		type Context = ParameterizedContext<State, RouterParamContext<State>>;
	}
}
