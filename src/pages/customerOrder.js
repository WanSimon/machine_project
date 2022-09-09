import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  NativeModules,
} from 'react-native';
import TopBar from '../components/topbar';
import {p2dHeight, p2dWidth, parseCent} from '../js/utils';
import QRCode from 'react-native-qrcode-svg';
import {store} from '../store/store';
import api from '../js/cloudApi';
import uuid from 'react-native-uuid';
import {
  OrderStatus,
  PayType,
  PayStatus,
  BuyWay,
  OrderSource,
  PickUpType,
  TradeType,
} from '../js/common';
import {upgradeOrder} from '../action';

class customerOrder extends Component {
  constructor() {
    super();

    this.state = {
      qrcode: '',
      ali_pay_url: '',
      wechat_pay_url: '',
      payMode: 'wechat',
      totalPrice: 0,
      totalCustomerPrice: 0,
      //订单内部编码
      trade_no: '',
    };
    this.switchEnd = true;
    this.unload = false;
  }

  async componentDidMount() {
    console.debug('go to page 【customerOrder】');
    let cart = store.getState().cart;
    let orderInfo = store.getState().orderInfo;
    console.info('customerOrder page get reducex orderInfo = %o', orderInfo);
    NativeModules.RaioApi.debug(
      {
        msg: `customerOrder page get reducex orderInfo = ${JSON.stringify(
          orderInfo,
        )}`,
        method: 'customerOrder.componentDidMount',
      },
      null,
    );

    //seven: 重新生成redux中orderInfo
    orderInfo.id = uuid.v4();
    orderInfo.inner_order_no = uuid.v4().replace(/-/g, '');
    orderInfo.serial_no = null;
    console.info('customerOrder page rebuild orderInfo = %o', orderInfo);
    NativeModules.RaioApi.debug(
      {
        msg: `customerOrder page rebuild orderInfo = ${JSON.stringify(
          orderInfo,
        )}`,
        method: 'customerOrder.componentDidMount',
      },
      null,
    );

    let action = upgradeOrder(orderInfo);
    store.dispatch(action);

    this.setState({
      totalPrice: cart.totalPrice,
      totalCustomerPrice: cart.totalCustomerPrice,
    });
    this.setState({trade_no: orderInfo.inner_order_no});

    //生成订单
    await this.submitOrder(orderInfo);
    //生成支付信息
    await this.switchPay(orderInfo.inner_order_no);
    //获取订单状态
    await this.getPayStatus(orderInfo.inner_order_no);
  }

  async submitOrder(orderInfo) {
    NativeModules.RaioApi.debug(
      {
        msg: 'customerOrder page submitOrder start',
        method: 'customerOrder.submitOrder',
      },
      null,
    );
    try {
      let res = await api.submitOrder(orderInfo);
      NativeModules.RaioApi.debug(
        {
          msg: `customerOrder page submitOrder success, ${JSON.stringify(res)}`,
          method: 'customerOrder.submitOrder',
        },
        null,
      );
    } catch (e) {
      console.error(e);
      NativeModules.RaioApi.debug(
        {
          msg: `customerOrder page submitOrder fail, ${e.message}`,
          method: 'customerOrder.submitOrder',
        },
        null,
      );
    }
    NativeModules.RaioApi.debug(
      {
        msg: 'customerOrder page submitOrder end',
        method: 'customerOrder.submitOrder',
      },
      null,
    );
  }

  async switchPay(trade_no) {
    try {
      if (this.state.payMode === 'ali') {
        if (this.state.ali_pay_url === '') {
          let res = await this.pay(trade_no);
          //alert(1+trade_no+JSON.stringify(res));
          let pay_url = res.pay_url;
          this.setState({qrcode: pay_url, ali_pay_url: pay_url});
        } else {
          this.setState({qrcode: this.state.ali_pay_url});
        }
      }

      if (this.state.payMode === 'wechat') {
        if (this.state.wechat_pay_url === '') {
          let res = await this.pay(trade_no);
          //alert(2+trade_no+JSON.stringify(res));
          let pay_url = res.pay_url;
          this.setState({qrcode: pay_url, wechat_pay_url: pay_url});
        } else {
          this.setState({qrcode: this.state.wechat_pay_url});
        }
      }
    } catch (e) {
      //alert(e);
    }
  }

  async pay(trade_no) {
    let equipmentInfo = store.getState().equipmentInfo;
    let cart = store.getState().cart;
    let payInfo = {};
    payInfo.merchant_id = equipmentInfo.equipment_group_info.merchant_id;
    payInfo.trade_no = trade_no;
    payInfo.total_fee = cart.totalCustomerPrice;
    //payInfo.trade_type = this.state.payMode ==='ali'?TradeType.ALI_NATIVE:TradeType.WX_NATIVE;
    payInfo.trade_typ =
      this.state.payMode === 'ali' ? TradeType.ALI_NATIVE : TradeType.WX_NATIVE;
    payInfo.comment = '24小时自助药机-药品';

    let res = null;
    try {
      res = await api.pay(payInfo);
    } catch (e) {
      console.error(e);
    }
    return res;
  }

  async getPayStatus(trade_no) {
    let res = await api.getPayStatus(trade_no);
    //支付成功
    if (res.status === PayStatus.PS_SUCCESS) {
      //取药
      try {
        //todo 取药
        console.info('开始取药.');
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
      // 加个index 防止定时器取消不掉
      if (!this.unload) {
        this.timerIndex = 0;
        this.timer = setTimeout(async () => {
          this.timerIndex++;
          if (this.timerIndex < 170) {
            await this.getPayStatus(trade_no);
          }
        }, 1000);
      }
    }
  }

  switchPayMode(payMode) {
    if (!this.switchEnd) {
      return;
    }
    if (payMode !== this.state.payMode) {
      this.switchEnd = false;
      this.setState({payMode}, async () => {
        await this.switchPay(this.state.trade_no);
        this.switchEnd = true;
      });
    }
  }

  componentWillUnmount() {
    console.debug('destroy page 【order】');
    this.unload = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  render() {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
        <View style={{backgroundColor: '#fff'}}>
          <TopBar
            count={160}
            pageName="支付订单"
            navigation={this.props.navigation}
          />
          <View>
            <Text
              style={{
                height: p2dHeight(147),
                lineHeight: p2dHeight(147),
                fontSize: p2dWidth(48),
                fontWeight: '500',
                color: '#333333',
                fontFamily: 'PingFangSC-Medium, PingFang SC',
                marginLeft: p2dWidth(40),
              }}>
              支付信息
            </Text>
          </View>
          <View
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              height: p2dHeight(45),
            }}>
            <Text
              style={{
                position: 'absolute',
                left: p2dWidth(40),
                fontSize: p2dWidth(32),
                fontWeight: '500',
                color: '#333333',
              }}>
              商品原价
            </Text>
            <Text
              style={{
                position: 'absolute',
                right: p2dWidth(40),
                fontSize: p2dWidth(32),
                fontWeight: '400',
                color: '#666666',
              }}>
              ¥{parseCent(this.state.totalPrice)}
            </Text>
          </View>
          <View
            style={{
              marginTop: p2dHeight(30),
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
              marginBottom: p2dHeight(30),
              height: p2dHeight(2),
              backgroundColor: '#DCDCDC',
            }}
          />
          <View
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              height: p2dHeight(45),
            }}>
            <Text
              style={{
                position: 'absolute',
                left: p2dWidth(40),
                fontSize: p2dWidth(32),
                fontWeight: '500',
                color: '#333333',
              }}>
              优惠金额
            </Text>
            <Text
              style={{
                position: 'absolute',
                right: p2dWidth(40),
                fontSize: p2dWidth(32),
                fontWeight: '400',
                color: '#666666',
              }}>
              ¥
              {parseCent(this.state.totalPrice - this.state.totalCustomerPrice)}
            </Text>
          </View>
          <View
            style={{
              marginTop: p2dHeight(30),
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
              marginBottom: p2dHeight(30),
              height: p2dHeight(2),
              backgroundColor: '#DCDCDC',
            }}
          />
          <View
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              height: p2dHeight(45),
              marginBottom: p2dHeight(30),
            }}>
            <Text
              style={{
                position: 'absolute',
                left: p2dWidth(40),
                fontSize: p2dWidth(32),
                fontWeight: '500',
                color: '#333333',
              }}>
              应 付
            </Text>
            <Image
              style={{
                position: 'absolute',
                top: p2dHeight(7),
                right: p2dWidth(265),
                width: p2dWidth(42),
                height: p2dHeight(32),
              }}
              source={require('../assets/huiyuan.png')}
            />
            <Text
              style={{
                position: 'absolute',
                right: p2dWidth(40),
                fontSize: p2dWidth(32),
                fontWeight: '400',
                color: '#BB7D4E',
                letterSpacing: p2dWidth(1),
              }}>
              会员价：¥{parseCent(this.state.totalCustomerPrice)}
            </Text>
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
                fontSize: p2dWidth(48),
                fontWeight: '500',
                color: '#333333',
                fontFamily: 'PingFangSC-Medium, PingFang SC',
                marginLeft: p2dWidth(40),
              }}>
              选择支付方式
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
            onPress={() => this.switchPayMode('ali')}>
            <ImageBackground
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
              imageStyle={{resizeMode: 'contain'}}
              source={
                this.state.payMode === 'ali'
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
            onPress={() => this.switchPayMode('wechat')}>
            <ImageBackground
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
              imageStyle={{resizeMode: 'contain'}}
              source={
                this.state.payMode === 'wechat'
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
              onPress={() => this.props.navigation.navigate('home')}>
              取消支付
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default customerOrder;
