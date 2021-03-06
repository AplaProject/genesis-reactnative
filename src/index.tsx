import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as CodePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { AppRegistry, AppState } from 'react-native';

import * as Push from 'appcenter-push';

import store from 'modules/store';
import NavigatorContainer from 'containers/NavigationContainer';
import AlertContainer from 'containers/AlertContainer';
import StatusBarContainer from 'containers/StatusBarContainer';
import MainBackgroundImageContainer from 'containers/MainBackgroundImageContainer';
import AnimatedDrawerContainer from 'containers/AnimatedDrawerContainer';
import ModalsContainer from 'containers/ModalsContainer';
import IntlProviderContainer from 'containers/IntlProviderContainer';

import Text from 'components/ui/Text';

import { URL_PREFIX } from './constants';

export default class App extends React.Component<{},{}> {

  public render() {
    return (
      <Provider store={store}>
        <MainBackgroundImageContainer>
          <StatusBarContainer />
          <AlertContainer />
          <IntlProviderContainer>
            <AnimatedDrawerContainer>
              <ModalsContainer />
              <NavigatorContainer uriPrefix={URL_PREFIX} />
            </AnimatedDrawerContainer>
          </IntlProviderContainer>
        </MainBackgroundImageContainer>
      </Provider>
    );
  }
}

AppRegistry.registerComponent('Apla', () =>
  CodePush({
    checkFrequency: CodePush.CheckFrequency.MANUAL
  })(App)
);
