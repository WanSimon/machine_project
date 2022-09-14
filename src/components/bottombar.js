/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity} from 'react-native';

import {p2dHeight, p2dWidth, parseCent} from '../js/utils';
import store from '../store/store';

import api from '../js/cloudApi';
class BottomBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  componentWillUnmount() {}

  async submitOrder() {
    if (this.props.productNum > 0) {
      let sceneStr = store.getState().sceneStr;
      if (sceneStr.length <= 0) {
        //跳转至登录页面
        this.props.navigation.navigate('login');
      } else {
        let res = await api.getUserInfo(sceneStr);
        if (res.status === 200) {
          this.props.goOrder();
        } else {
          this.props.navigation.navigate('login');
        }
        //sceneStr进行校验
      }
    }
  }

  render() {
    return (
      <View
        style={{
          position: 'relative',
          height: p2dHeight(160),
          width: '100%',
          borderTopWidth: p2dWidth(1),
          borderTopColor: '#DCDCDC',
          backgroundColor: '#fff',
        }}>
        <TouchableOpacity
          onPress={this.props.setCartVisible}
          style={{
            position: 'absolute',
            left: p2dWidth(70),
            top: 0,
            width: p2dWidth(160),
            height: p2dHeight(160),
          }}>
          <Image
            style={{
              width: '100%',
              height: '100%',
            }}
            source={require('../assets/cart.png')}
          />
        </TouchableOpacity>
        {this.props.productNum > 0 ? (
          <View
            style={{
              position: 'absolute',
              left: p2dWidth(172),
              top: p2dHeight(16),
              width: p2dWidth(60),
              height: p2dWidth(60),
              borderRadius: p2dWidth(30),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#ff5c2a',
            }}>
            <Text
              style={{
                fontSize: p2dWidth(38),
                fontWeight: 'bold',
                color: '#fff',
              }}>
              {this.props.productNum}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            position: 'absolute',
            left: p2dWidth(320),
            top: 0,
            height: p2dHeight(160),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: p2dWidth(72),
              fontWeight: '500',
              color: '#333333',
            }}>
            ¥ {parseCent(this.props.totalPrice)}
          </Text>
        </View>

        <View
          style={{
            position: 'absolute',
            right: p2dWidth(20),
            top: p2dHeight(30),
            width: p2dWidth(280),
            height: p2dHeight(100),
            backgroundColor:
              this.props.productNum > 0 ? $conf.theme : '#BEBEBE',
            borderRadius: p2dWidth(65),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontWeight: '500',
              color: '#FFFFFF',
              fontSize: p2dWidth(36),
            }}
            onPress={() => this.submitOrder()}>
            提交订单
          </Text>
        </View>
      </View>
    );
  }
}

export default BottomBar;
