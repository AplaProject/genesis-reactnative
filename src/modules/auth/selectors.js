export const getKeyPair = state => state.auth.keyPair;

export const getToken = state => state.auth.token;

export const getRefresh = state => state.auth.refresh;

export const getRefreshToken = state => state.auth.refresh;

export const getPublicKey = state => state.auth.publicKey;

export const getPrivateKey = state => state.auth.privateKey;

export const hasValidToken = state =>
  !!getToken(state) && Date.now() < state.auth.tokenExpiry;

export const getTokenExpiry = state => state.auth.tokenExpiry;

export const getCurrentAccountId = state => state.auth.currentAccountId;

export const getCurrentEcosystemId = state => state.auth.currentEcosystemId;

export const getLastLoggedAccount = state => state.auth.lastLoggedAccount || null;

export const getSocketConnectionStatus = state => state.auth.socketConnectionStatus;