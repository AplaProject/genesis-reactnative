import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistCombineReducers, PersistedState } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import createSagaMiddleware from 'redux-saga';
import { AsyncStorage } from 'react-native';

import rootReducer, { rootSaga, IRootState } from './index';

const sagaMiddleware = createSagaMiddleware();

const config = {
  key: 'apla',
  version: 1,
  storage,
  whitelist: [
    'auth',
    'accounts',
    'ecosystems',
    'nodes',
  ]
};

const composedEnhancers = composeWithDevTools(
  applyMiddleware(...[sagaMiddleware])
);
const reducer = persistCombineReducers(config, rootReducer);
const store = createStore<PersistedState>(reducer, composedEnhancers);

persistStore(store);

sagaMiddleware.run(rootSaga);

export default store;
