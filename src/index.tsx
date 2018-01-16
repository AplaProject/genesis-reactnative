import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as CodePush from 'react-native-code-push';
import Drawer from 'react-native-drawer';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { addNavigationHelpers } from 'react-navigation';
import { AppRegistry, View, Text } from 'react-native';

import * as Push from 'appcenter-push';

import store from 'modules/store';
import NavigatorContainer from 'containers/NavigationContainer';
import DrawerContentContainer from 'containers/DrawerContentContainer';
import AlertContainer from 'containers/AlertContainer';
import { URL_PREFIX } from './constants';

export default class App extends React.Component<object, object> {
  public static childContextTypes = {
    drawer: PropTypes.object
  };

  private drawer: React.ReactNode;

  public render() {
    return (
      <Provider store={store}>
        <View style={{ flex: 1 }}>
          <AlertContainer />
          <IntlProvider locale="en" defaultLocale="en" textComponent={Text}>
            <Drawer
              ref={this.drawerRef}
              type="overlay"
              tapToClose
              content={<DrawerContentContainer />}
              openDrawerOffset={0.3}
              elevation={1}
              panOpenMask={3}
              captureGestures
              useInteractionManager
            >
              <NavigatorContainer uriPrefix={URL_PREFIX} />
            </Drawer>
          </IntlProvider>
        </View>
      </Provider>
    );
  }

  public getChildContext() {
    return {
      drawer: this.drawer
    };
  }

  private drawerRef = (component: React.ReactNode) => (this.drawer = component);
}

AppRegistry.registerComponent('Apla', () =>
  CodePush({
    updateDialog: true,
    checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
    installMode: CodePush.InstallMode.IMMEDIATE
  })(App)
);
