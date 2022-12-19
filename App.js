/**
 * @format
 */

import g from './src/js/global';
import Start from './src/pages/start';
import Home from './src/pages/home';
import List from './src/pages/list';
import Order from './src/pages/order';
import Wait from './src/pages/wait';
import End from './src/pages/end';
import Fail from './src/pages/fail';
import Setting from './src/pages/setting';
import Login from './src/pages/login';
import Pay from './src/pages/pay';
import Repertory from './src/pages/repertory';
import {createStackNavigator} from 'react-navigation-stack';

import {createAppContainer} from 'react-navigation';
import Unshelve from './src/pages/unshelve';
import Replenishment from './src/pages/replenishment';
import Channel from './src/pages/channel';
import Admin from './src/pages/admin';
import Maintain from './src/pages/maintain';
import DrugDetail from './src/pages/drugDetail';

const AppNavigator = createStackNavigator(
  {
    //这里注册了每个独立的页面。
    home: {screen: Home, navigationOptions: {headerShown: false}},
    list: {screen: List, navigationOptions: {headerShown: false}},
    order: {screen: Order, navigationOptions: {headerShown: false}},
    start: {screen: Start, navigationOptions: {headerShown: false}},
    wait: {screen: Wait, navigationOptions: {headerShown: false}},
    end: {screen: End, navigationOptions: {headerShown: false}},
    fail: {screen: Fail, navigationOptions: {headerShown: false}},
    login: {screen: Login, navigationOptions: {headerShown: false}},
    setting: {screen: Setting, navigationOptions: {headerShown: false}},
    pay: {screen: Pay, navigationOptions: {headerShown: false}},
    repertory: {screen: Repertory, navigationOptions: {headerShown: false}},
    unshelve: {screen: Unshelve, navigationOptions: {headerShown: false}},
    replenishment: {
      screen: Replenishment,
      navigationOptions: {headerShown: false},
    },
    channel: {screen: Channel, navigationOptions: {headerShown: false}},
    admin: {screen: Admin, navigationOptions: {headerShown: false}},
    maintain: {screen: Maintain, navigationOptions: {headerShown: false}},
    drugDetail: {screen: DrugDetail, navigationOptions: {headerShown: false}},
  },
  {
    initialRouteName: 'start',
    headerMode: 'none',
  },
);

const App = createAppContainer(AppNavigator);

export default App;
