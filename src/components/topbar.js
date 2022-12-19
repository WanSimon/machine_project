import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity} from 'react-native';

import {p2dHeight, p2dWidth} from '../js/utils';
import {
  clearCart,
  updateLoginStatus,
  updateSceneStr,
  updateAdminData,
} from '../action';
import {store} from '../store/store';

class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: props.count || 150,
      pageName: props.pageName || '',
    };
  }
  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        if (!this.props.disableCount) {
          this.timer = setInterval(() => {
            if (this.state.count > 0) {
              this.setState({count: this.state.count - 1});
            } else {
              this.goHome();
            }
          }, 1000);
        }
        console.debug('【topbar】focus.');
      },
    );
    this.didBlurListener = this.props.navigation.addListener('didBlur', () => {
      if (this.timer) {
        console.debug('timer stop.');
        clearInterval(this.timer);
        this.setState({count: this.props.count});
      }
      console.debug('【topbar】blur.');
    });
  }

  componentWillUnmount() {
    if (this.timer) {
      console.debug('timer stop.');
      clearInterval(this.timer);
    }
    this.didFocusListener.remove();
    this.didBlurListener.remove();
  }

  goHome() {
    //清空购物车
    let action = clearCart();
    store.dispatch(action);
    action = updateSceneStr('');
    store.dispatch(action);
    action = updateLoginStatus(false);
    store.dispatch(action);
    this.props.navigation.navigate('home');
  }

  goAdminHome() {
    let action = updateAdminData({});
    store.dispatch(action);
    this.props.navigation.navigate('home');
  }

  goBack() {
    this.props.navigation.goBack();
  }
  render() {
    return (
      <View
        style={{
          position: 'relative',
          backgroundColor: $conf.theme,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: p2dWidth(140),
        }}>
        <Text
          style={{
            color: '#fff',
            fontSize: p2dWidth(48),
            fontWeight: 'bold',
          }}>
          {this.state.pageName}
        </Text>

        {this.props.disableCount ? null : (
          <TouchableOpacity
            onPress={() => this.goHome()}
            style={{
              position: 'absolute',
              right: p2dWidth(12),
              top: p2dWidth(0),
              height: p2dWidth(140),
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: p2dWidth(800),
            }}>
            <Image
              style={{
                width: p2dWidth(40),
                height: p2dWidth(40),
              }}
              source={require('../assets/home.png')}
            />
            <Text
              style={{
                fontSize: p2dWidth(32),
                fontWeight: 'bold',
                color: '#fff',
                marginLeft: p2dWidth(10),
              }}>
              返回首页（{this.state.count}s）
            </Text>
          </TouchableOpacity>
        )}

        {this.props.disableAdminExit === undefined ? null : (
          <TouchableOpacity
            onPress={() => this.goAdminHome()}
            style={{
              position: 'absolute',
              right: p2dWidth(26),
              top: p2dWidth(0),
              height: p2dWidth(140),
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: p2dWidth(800),
            }}>
            <Image
              style={{
                width: p2dWidth(40),
                height: p2dWidth(40),
              }}
              source={require('../assets/home.png')}
            />
            <Text
              style={{
                fontSize: p2dWidth(32),
                fontWeight: 'bold',
                color: '#fff',
                marginLeft: p2dWidth(10),
              }}>
              退出登录
            </Text>
          </TouchableOpacity>
        )}

        {this.props.hideBack ? null : (
          <TouchableOpacity
            onPress={() => this.goBack()}
            style={{
              position: 'absolute',
              left: p2dWidth(40),
              top: p2dWidth(50),
              width: p2dWidth(40),
              height: p2dWidth(40),
            }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
              }}
              source={require('../assets/back.png')}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

export default TopBar;
