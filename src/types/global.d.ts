import {ParameterizedContext} from 'koa';
import {RouterParamContext} from '@koa/router';

declare global {
    export namespace App {
        export interface State {
            user: string;
        }
        type Context = ParameterizedContext<State, RouterParamContext<State>>;
    }
}
