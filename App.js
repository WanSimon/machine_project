/**
 * @format
 */

import g from './src/js/global';
import Start from './src/pages/start';
import Code from './src/pages/code';
import CodeOrder from './src/pages/codeOrder';
import CodeWait from './src/pages/codeWait';
import Home from './src/pages/home';
import List from './src/pages/list';
import Order from './src/pages/order';
import Wait from './src/pages/wait';
import End from './src/pages/end';
import CustomerOrder from './src/pages/customerOrder';
import Fail from './src/pages/fail';
import Setting from './src/pages/setting';
// import Profile from './src/pages/profile';

import {createStackNavigator} from 'react-navigation-stack';

import {createAppContainer} from 'react-navigation';

const AppNavigator = createStackNavigator(
  {
    //这里注册了每个独立的页面。
    home: {screen: Home, navigationOptions: {headerShown: false}},
    code: {screen: Code, navigationOptions: {headerShown: false}},
    codeOrder: {screen: CodeOrder, navigationOptions: {headerShown: false}},
    codeWait: {screen: CodeWait, navigationOptions: {headerShown: false}},
    list: {screen: List, navigationOptions: {headerShown: false}},
    order: {screen: Order, navigationOptions: {headerShown: false}},
    start: {screen: Start, navigationOptions: {headerShown: false}},
    wait: {screen: Wait, navigationOptions: {headerShown: false}},
    end: {screen: End, navigationOptions: {headerShown: false}},
    fail: {screen: Fail, navigationOptions: {headerShown: false}},
    customerOrder: {
      screen: CustomerOrder,
      navigationOptions: {headerShown: false},
    },
    setting: {screen: Setting, navigationOptions: {headerShown: false}},
    // profile: {screen: Profile, navigationOptions: {headerShown: false}},
  },
  {
    initialRouteName: 'start',
    headerMode: 'none',
  },
);

const App = createAppContainer(AppNavigator);

export default App;
