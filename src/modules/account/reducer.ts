import * as actions from './actions';
import { Action } from 'redux';
import { mergeDeepWith, union, omit } from 'ramda';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { createAccount, removeAccount, attachEcosystem, saveTokenToAccount } from './actions';
import { getTokenExpiry } from 'modules/auth/selectors';

export interface IAccout {
  id: string;
  address: string;
  state: string;
  ecosystems: string[];
  encKey: string;
  publicKey: string;
  token?: string,
  tokenExpiry?: number,
  refresh?: string;
}

export interface IState {
  [id: string]: IAccout;
}

const initialState: IState = {};

const mergeAccount = mergeDeepWith<IAccout, Partial<IAccout>>(union);

export default reducerWithInitialState(initialState)
  .case(createAccount.done, (state, payload) => ({
    ...state,
    [payload.result.id]: {
      ...state[payload.result.id],
      ...payload.result
    }
  }))
  .case(removeAccount.done, (state, payload) => omit([payload.params.accountId])(state))
  .case(saveTokenToAccount, (state, payload: any) => ({
    ...state,
    [payload.currentAccountId]: {
      ...state[payload.currentAccountId],
      token: payload.token,
      tokenExpiry: payload.tokenExpiry,
      refresh: payload.refresh,
    }
  }))
  .case(attachEcosystem, (state, payload) => ({
    ...state,
    [payload.accountId]: mergeAccount(state[payload.accountId], {
      ecosystems: [payload.ecosystemId]
    })
  }));
