import React, {Component} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import TopBar from '../components/topbar';
import {p2dHeight, p2dWidth, parseCent} from '../js/utils';
import QRCode from 'react-native-qrcode-svg';
import {store} from '../store/store';
import api from '../js/cloudApi';
import {PayStatus, TradeType} from '../js/common';
import Conf from '../js/conf';

import {OrderStatus} from '../js/common';
class pay extends Component {
  constructor() {
    super();

    this.state = {
      totalPrice: 0,
      //订单内部编码
      tradeNo: '',
      orderId: '',
      payUrl: '',
    };
    this.unload = false;
  }

  async componentDidMount() {
    console.debug('go to page 【pay】');

    let cart = store.getState().cart;
    let orderInfo = store.getState().orderInfo;

    let userId = store.getState().logged.userId;
    let payUrl =
      Conf.payUrl + '?userId=' + userId + '&orderId=' + orderInfo.orderId;
    this.setState({
      tradeNo: orderInfo.innerOrderNo,
      totalPrice: cart.totalPrice,
      orderId: orderInfo.orderId,
      userId: userId,
      payUrl,
    }); //准备删除

    await this.getOrderPayStatus(orderInfo.innerOrderNo);
  }

  async getOrderPayStatus(tradeNo) {
    let res = await api.getOrderPayStatus(tradeNo);
    //支付成功
    if (res.status === PayStatus.PS_SUCCESS) {
      //取药
      try {
        await api.updateOrderStatus(this.state.orderId, OrderStatus.OS_Paied);
        console.debug('开始取药.');
        //todo 取药
        this.props.navigation.replace('wait');
      } catch (e) {
        return false;
      }
    }
    //支付失败
    else if (res.status === PayStatus.PS_Failed) {
      //todo
      console.info('支付失败.');
    } else if (res.status === PayStatus.PS_NoPay) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (!this.unload) {
        // 加个index 防止定时器取消不掉
        this.timerIndex = 0;
        this.timer = setTimeout(async () => {
          this.timerIndex++;
          if (this.timerIndex < 170) {
            await this.getOrderPayStatus(tradeNo);
          }
        }, 5000);
      }
    }
  }

  componentWillUnmount() {
    console.debug('destroy page 【pay】');
    this.unload = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render() {
    const {totalPrice} = this.state;
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
        }}>
        <TopBar
          count={106}
          pageName="支付订单"
          navigation={this.props.navigation}></TopBar>
        <View
          style={{
            flexDirection: 'column',
            display: 'flex',
            height: p2dHeight(400),
            marginTop: p2dHeight(30),
            justifyContent: 'space-around',
            marginLeft: p2dWidth(20),
            marginRight: p2dWidth(60),
          }}>
          <View>
            <Text
              style={{
                fontSize: p2dWidth(40),
                fontWeight: 'bold',
              }}>
              | 支付信息
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',

              marginLeft: p2dWidth(20),
              marginRight: p2dWidth(20),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(35)}}>商品总价</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(35)}}>
                ￥{parseCent(totalPrice)}
              </Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: p2dWidth(20),
              marginRight: p2dWidth(20),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(35)}}>优惠</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(35)}}>￥0</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: p2dWidth(20),
              marginRight: p2dWidth(20),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(35)}}>实际支付</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(35)}}>
                ￥{parseCent(totalPrice)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: p2dHeight(20),
            backgroundColor: '#fff',
            flexGrow: 1,
          }}>
          <View>
            <Text
              style={{
                height: p2dHeight(147),
                lineHeight: p2dHeight(147),
                fontSize: p2dWidth(40),
                fontWeight: 'bold',
                color: '#333333',
                marginLeft: p2dWidth(40),
              }}>
              | 扫码支付
            </Text>
          </View>

          <Text
            style={{
              position: 'absolute',
              top: p2dHeight(170),
              width: '100%',
              textAlign: 'center',
              color: '#333333',
              fontWeight: '500',
              fontSize: p2dWidth(38),
            }}>
            请扫码支付
          </Text>
          <View
            style={{
              position: 'absolute',
              right: p2dWidth(360),
              top: p2dHeight(300),
              width: p2dWidth(360),
              height: p2dHeight(360),
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {this.state.payUrl ? (
              <QRCode size={p2dWidth(360)} value={this.state.payUrl} />
            ) : null}
          </View>
          <Text
            style={{
              position: 'absolute',
              top: p2dHeight(700),
              width: '100%',
              textAlign: 'center',
              color: '#BEBEBE',
              fontWeight: '500',
              fontSize: p2dWidth(25),
            }}>
            支持微信、支付宝等扫码支付
          </Text>
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: p2dWidth(40),
              bottom: p2dHeight(40),
              width: p2dWidth(280),
              height: p2dHeight(100),
              borderWidth: p2dWidth(2),
              borderColor: '#BEBEBE',
              borderRadius: p2dWidth(65),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#BEBEBE',
                fontWeight: '500',
                fontSize: p2dWidth(36),
              }}
              onPress={() => this.props.navigation.replace('home')}>
              取消支付
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default pay;
