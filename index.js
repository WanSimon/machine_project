/**
 * @format
 */
import {name as appName} from './app.json';
import {AppRegistry, StatusBar, UIManager} from 'react-native';
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import App from './App';

export default class Root extends Component {
  render() {
    return (
      //包裹app
      <Provider store={store}>
        {/*<StatusBar hidden={true} />*/}
        <App />
      </Provider>
    );
  }
}

AppRegistry.registerComponent(appName, () => Root);
