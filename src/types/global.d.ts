import {ParameterizedContext} from 'koa';
import {RouterParamContext} from '@koa/router';
import {parseResourceQuery} from '../lib/resource-query';
import {SessionTokens, SessionUserData} from '../modules/user-auth/auth-session';

declare global {
    export namespace App {
        export interface State {
            session: SessionTokens & SessionUserData;
            namespace: string;
            dbQuery: ReturnType<typeof parseResourceQuery>;
        }

        type Context = ParameterizedContext<State, RouterParamContext<State>>;
    }
}
