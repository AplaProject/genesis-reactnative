import { SagaIterator } from 'redux-saga';
import { Action } from 'typescript-fsa';
import { Alert } from 'react-native';
import { delay } from 'redux-saga';
import { takeEvery, put, call, select, all } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';

import api, { apiSetToken, apiDeleteToken } from 'utils/api';
import Keyring from 'utils/keyring';
import * as application from 'modules/application';
import * as applicationActions from 'modules/application/actions';
import * as authActions from './actions';
import * as authSelectors from './selectors';
import * as accountActions from 'modules/account/actions';
import * as accountSelectors from 'modules/account/selectors';
import * as navigatorActions from 'modules/navigator/actions';
import { getAccount } from 'modules/account/selectors';
import { receiveEcosystem } from 'modules/ecosystem/actions';
import { navigateWithReset } from 'modules/navigator/actions';
import { navTypes } from '../../navigatorConfig';
import { waitForActionWithParams } from '../sagas/utils';

interface IAuthPayload {
  private: string;
  public: string;
  ecosystem: string;
}

export function* auth(payload: IAuthPayload) {
  apiDeleteToken(); // Remove previous token

  const { data: uidParams } = yield call(api.getUid);
  const signature = yield call(Keyring.sign, uidParams.uid, payload.private);

  apiSetToken(uidParams.token);

  const { data: accountData } = yield call(api.login, {
    signature,
    ecosystem: payload.ecosystem,
    publicKey: payload.public
  });

  apiSetToken(accountData.token);

  yield put(
    authActions.attachSession({
      currentAccountId: accountData.address,
      currentEcosystemId: accountData.ecosystem_id,
      token: accountData.token,
      refresh: accountData.refresh,
      publicKey: payload.public,
      privateKey: payload.private
    })
  ); // Save token

  const tokenExpiry = yield select(authSelectors.getTokenExpiry);
  yield put(accountActions.saveTokenToAccount({
    currentAccountId: accountData.address,
    token: accountData.token,
    refresh: accountData.refresh,
    tokenExpiry
  }));

  return {
    id: accountData.address,
    address: accountData.address,
    publicKey: payload.public,
    ecosystems: [accountData.ecosystem_id]
  };
}

export function* refresh() {
  const refreshToken = yield select(authSelectors.getRefreshToken);

  try {
    const { data } = yield call(api.refresh, {
      token: refreshToken
    });

    apiSetToken(data.token);

    yield put(
      authActions.refreshSession({
        token: data.token,
        refresh: data.refresh
      })
    );
  } catch (error) {
    console.log(error);
  }
}

export function* loginByPrivateKeyWorker(action: Action<any>) {
  const { privateKey, password, ecosystemId } = action.payload;

  try {
    const publicKey = yield call(Keyring.genereatePublicKey, privateKey);
    const encKey = yield call(Keyring.encryptAES, privateKey, password); // Encrypt private key

    const account = yield call(auth, {
      public: publicKey,
      private: privateKey,
      ecosystem: ecosystemId
    });

    yield put(
      accountActions.createAccount.done({
        params: action.payload,
        result: {
          ...account,
          encKey
        }
      })
    );

    yield put(
      authActions.login.done({
        params: action.payload,
        result: {
          ...account
        }
      })
    );

    yield put(
      navigateWithReset([
        {
          routeName: navTypes.AUTH_SUCCESSFUL,
          params: {
            isKnownAccount: true
          }
        }
      ])
    );
  } catch (error) {
    yield put(
      authActions.login.failed({
        params: action.payload,
        error
      })
    );
  }
}

export function* loginWorker(action: Action<any>): SagaIterator {
  try {
    const savedAccount = yield select(getAccount(action.payload.accountId));
    const privateKey = yield call(
      Keyring.decryptAES,
      savedAccount.encKey,
      action.payload.password
    );

    const account = yield call(auth, {
      public: savedAccount.publicKey,
      private: privateKey,
      ecosystem: action.payload.ecosystemId
    });

    yield put(
      authActions.login.done({
        params: action.payload,
        result: {
          ...account
        }
      })
    );

    yield put(navigateWithReset([{ routeName: navTypes.HOME }])); // Navigate to home screen
  } catch (error) {
    yield put(
      authActions.login.failed({
        params: action.payload,
        error
      })
    );
  }
}

export function* createAccountWorker(action: Action<any>): SagaIterator {
  try {
    const authPayload: IAuthPayload = yield call(
      Keyring.generateKeyPair,
      action.payload.seed
    ); // Generate paif of keys
    const encKey = yield call(
      Keyring.encryptAES,
      authPayload.private,
      action.payload.password
    ); // Encrypt private key

    const account = yield call(auth, authPayload);

    yield put(
      accountActions.createAccount.done({
        params: action.payload,
        result: {
          ...account,
          encKey
        }
      })
    );
    yield put(
      applicationActions.removeSeed()
    );
    yield put(
      navigateWithReset([
        {
          routeName: navTypes.AUTH_SUCCESSFUL,
          params: {
            isKnownAccount: false
          }
        }
      ])
    );
  } catch (error) {
    yield put(
      accountActions.createAccount.failed({
        params: action.payload,
        error
      })
    );
  }
}

export function* switchAccountWorker(action: Action<any>): SagaIterator {
  try {
    const keys = yield all({
      public: select(authSelectors.getPublicKey),
      private: select(authSelectors.getPrivateKey)
    });

    const account = yield call(auth, {
      ...keys,
      ecosystem: action.payload.ecosystemId
    });

    yield put(
      authActions.switchAccount.done({
        params: action.payload,
        result: null
      })
    );
    yield put(
      authActions.login.done({
        params: action.payload,
        result: {
          ...account
        }
      })
    );

    yield put(navigateWithReset([{ routeName: navTypes.HOME }])); // Navigate to home screen
  } catch (error) {
    yield put(
      authActions.switchAccount.failed({
        params: action.payload,
        error
      })
    );
  }
}

export function* logoutWorker() {
  yield put(authActions.detachSession());
  yield put(navigateWithReset([{ routeName: navTypes.ACCOUNT_SELECT }]));
}

export function* receiveSelectedAccountWorker(action: { payload: { ecosystemId: string, id: string }, } ) {
  const accountData = yield select(accountSelectors.getAccount(action.payload.id));

  if (accountData.token && accountData.tokenExpiry > Date.now()) {
    apiSetToken(accountData.token);
    yield put(
      authActions.attachSession({
        currentAccountId: accountData.address,
        currentEcosystemId: action.payload.ecosystemId,
        token: accountData.token,
        refresh: accountData.refresh,
        publicKey: accountData.public,
        privateKey: accountData.private
      })
    );

    yield put(navigatorActions.navigate(navTypes.HOME));
  } else {
    yield put(
      navigatorActions.navigate(navTypes.SIGN_IN, { id: action.payload.id, ecosystemId: action.payload.ecosystemId })
    );
  }
}

export function* tokenWorker() {
  while (true) {
    const tokenExpiry = yield select(authSelectors.getTokenExpiry);

    if (tokenExpiry < Date.now() + 60000) {
      yield call(refresh);

      return;
    }

    yield delay(5000);
  }
}

export function* authSaga(): SagaIterator {
  yield takeEvery(accountActions.createAccount.started, createAccountWorker);
  yield takeEvery(
    waitForActionWithParams(authActions.login.started.type, ['accountId']),
    loginWorker
  );
  yield takeEvery(
    waitForActionWithParams(authActions.login.started.type, ['privateKey']),
    loginByPrivateKeyWorker
  );
  yield takeEvery(authActions.logout, logoutWorker);
  yield takeEvery(authActions.switchAccount.started, switchAccountWorker);
  yield takeEvery(
    [
      authActions.attachSession,
      authActions.refreshSession,
      application.actions.initFinish
    ],
    tokenWorker
  );

  yield takeEvery(authActions.receiveSelectedAccount, receiveSelectedAccountWorker)
}

export default authSaga;
