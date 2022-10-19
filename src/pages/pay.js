import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  NativeModules,
} from 'react-native';
import TopBar from '../components/topbar';
import {p2dHeight, p2dWidth, parseCent} from '../js/utils';
import QRCode from 'react-native-qrcode-svg';
import {store} from '../store/store';
import api from '../js/cloudApi';
import {PayStatus, TradeType} from '../js/common';
class pay extends Component {
  constructor() {
    super();

    this.state = {
      qrcode: '',
      aliPayUrl: '',
      wechatPayUrl: '',
      payMode: 'ali',
      totalPrice: 0,
      //订单内部编码
      tradeNo: '',
      orderId: '',
      orgId: '',
      textInputValue: '',
      patientId: '',
      name: '',
      formattedPatientList: [],

      showPayCode: false,
    };
    this.switchEnd = true;
    this.unload = false;
  }

  async componentDidMount() {
    console.debug('go to page 【pay】');

    let cart = store.getState().cart;
    let orderInfo = store.getState().orderInfo;

    console.info('order page get redux orderInfo = %o', orderInfo);

    NativeModules.RaioApi.debug(
      {
        msg: `order page get redux orderInfo = ${JSON.stringify(orderInfo)}`,
        method: 'order.componentDidMount',
      },
      null,
    );

    this.setState({
      tradeNo: orderInfo.innerOrderNo,
      totalPrice: cart.totalPrice,
      orderId: orderInfo.orderId,
    }); //准备删除

    let res = await this.pay(orderInfo.innerOrderNo);
    let payUrl = res.payReqParam.payUrl;
    this.setState({qrcode: payUrl, aliPayUrl: payUrl});

    await this.getOrderPayStatus(orderInfo.innerOrderNo);
  }

  async switchPayUrl(payMode) {
    if (!this.switchEnd || payMode === this.state.payMode) {
      return;
    }

    const {tradeNo, aliPayUrl, wechatPayUrl, orderId} = this.state;
    this.switchEnd = false;

    if (payMode === 'ali') {
      if (aliPayUrl === '') {
        let res = await this.pay(tradeNo);
        let payUrl = res.payReqParam.payUrl;
        console.info('ali', payUrl);
        this.setState({qrcode: payUrl, aliPayUrl: payUrl, payMode: 'ali'});
      } else {
        this.setState({qrcode: this.state.aliPayUrl, payMode});
      }
      await api.updateOrderPayType({
        payType: 1,
        orderId,
      });
    }

    if (payMode === 'wechat') {
      if (wechatPayUrl === '') {
        let res = await this.pay(tradeNo);
        let payUrl = res.payReqParam.payUrl;
        console.info('wechat', payUrl);
        this.setState({
          qrcode: payUrl,
          wechatPayUrl: payUrl,
          payMode: 'wechat',
        });
      } else {
        this.setState({qrcode: this.state.wechatPayUrl, payMode});
      }

      await api.updateOrderPayType({
        payType: 0,
        orderId,
      });
    }

    this.switchEnd = true;
  }

  async pay(tradeNo) {
    let equipmentInfo = store.getState().equipmentInfo;
    let cart = store.getState().cart;
    let payInfo = {};
    payInfo.orgId = equipmentInfo.equipmentGroupInfo.orgId;
    payInfo.tradeNo = tradeNo;
    payInfo.totalFee = cart.totalPrice;
    payInfo.tradeType =
      this.state.payMode === 'ali' ? TradeType.ALI_NATIVE : TradeType.WX_NATIVE;
    payInfo.comment = '24小时自助药机-药品';

    let res = null;
    try {
      res = await api.orderPay(payInfo);

      console.log(
        '111111',
        res.payReqParam.payUrl,
        '2222222',
        payInfo.tradeType,
        '3333333',
        this.state.payMode,
      );
    } catch (e) {
      console.error(e);
    }
    return res;
  }

  async getOrderPayStatus(tradeNo) {
    let res = await api.getOrderPayStatus(tradeNo);
    //支付成功
    if (res.status === PayStatus.PS_SUCCESS) {
      //取药
      try {
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
    const {payMode, totalPrice} = this.state;
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
              | 支付方式
            </Text>
          </View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: p2dWidth(235),
              top: p2dHeight(236),
              width: p2dWidth(260),
              height: p2dHeight(110),
            }}
            onPress={() => this.switchPayUrl('ali')}>
            <ImageBackground
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
              imageStyle={{resizeMode: 'contain'}}
              source={
                payMode === 'ali'
                  ? require('../assets/aliPay.png')
                  : require('../assets/ali.png')
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              position: 'absolute',
              left: p2dWidth(235),
              top: p2dHeight(236),
              width: p2dWidth(260),
              height: p2dHeight(110),
            }}
            onPress={() => this.switchPayUrl('wechat')}>
            <ImageBackground
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
              imageStyle={{resizeMode: 'contain'}}
              source={
                payMode === 'wechat'
                  ? require('../assets/wechatPay.png')
                  : require('../assets/wechat.png')
              }
            />
          </TouchableOpacity>
          <View
            style={{
              position: 'absolute',
              right: p2dWidth(360),
              top: p2dHeight(437),
              width: p2dWidth(360),
              height: p2dHeight(360),
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {this.state.qrcode ? (
              <QRCode size={p2dWidth(360)} value={this.state.qrcode} />
            ) : null}
          </View>
          <Text
            style={{
              position: 'absolute',
              top: p2dHeight(830),
              width: '100%',
              textAlign: 'center',
              color: '#BEBEBE',
              fontWeight: '500',
              fontSize: p2dWidth(34),
            }}>
            扫码支付
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
