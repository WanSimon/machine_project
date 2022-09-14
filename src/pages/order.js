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
import Login from './login';
import api from '../js/cloudApi';
import {
  OrderStatus,
  PayType,
  PayStatus,
  BuyWay,
  OrderSource,
  PickUpType,
  TradeType,
} from '../js/common';
import uuid from 'react-native-uuid';
import {addCustomer, upgradeOrder, upgradePickupStatus} from '../action';

class order extends Component {
  constructor() {
    super();

    this.state = {
      qrcode: '',
      ali_pay_url: '',
      wechat_pay_url: '',
      payMode: 'wechat',
      totalPrice: 0,
      // totalCustomerPrice: 0,
      loginVisible: false,
      //订单内部编码
      trade_no: '',
      order_id: '',
      merchantId: '',
    };
    this.switchEnd = true;
    //this.checkCustomerTimerArr=[];
    this.unload = false;
  }

  async componentDidMount() {
    console.debug('go to page 【order】');

    let equipmentInfo = store.getState().equipmentInfo;
    this.setState({
      merchantId: equipmentInfo.equipment_group_info.merchant_id,
    });

    let cart = store.getState().cart;
    this.setState({
      totalPrice: cart.totalPrice,
      // totalCustomerPrice: cart.totalCustomerPrice,
    });

    let orderInfo = store.getState().orderInfo;
    console.info('order page get reducex orderInfo = %o', orderInfo);
    NativeModules.RaioApi.debug(
      {
        msg: `order page get reducex orderInfo = ${JSON.stringify(orderInfo)}`,
        method: 'order.componentDidMount',
      },
      null,
    );

    //seven: 重新生成redux中orderInfo
    orderInfo.id = uuid.v4();
    orderInfo.inner_order_no = uuid.v4().replace(/-/g, '');
    console.info('order page rebuild orderInfo = %o', orderInfo);
    NativeModules.RaioApi.debug(
      {
        msg: `order page rebuild orderInfo = ${JSON.stringify(orderInfo)}`,
        method: 'order.componentDidMount',
      },
      null,
    );

    let action = upgradeOrder(orderInfo);
    store.dispatch(action);
    this.setState({trade_no: orderInfo.inner_order_no, order_id: orderInfo.id});

    this.didBlurListener = this.props.navigation.addListener('didBlur', () => {
      if (this.checkCustomerTimer) {
        clearTimeout(this.checkCustomerTimer);
      }
    });

    //生成订单
    await this.submitOrder(orderInfo);
    //检测是否注册成会员
    // this.checkCustomer(orderInfo.id);
    //生成支付信息
    await this.switchPay(orderInfo.inner_order_no);
    //获取订单状态
    await this.getPayStatus(orderInfo.inner_order_no);
  }

  async submitOrder(orderInfo) {
    NativeModules.RaioApi.debug(
      {msg: 'order page submitOrder start', method: 'order.submitOrder'},
      null,
    );
    try {
      let res = await api.submitOrder(orderInfo);
      NativeModules.RaioApi.debug(
        {
          msg: `order page submitOrder success, ${JSON.stringify(res)}`,
          method: 'order.submitOrder',
        },
        null,
      );
    } catch (e) {
      console.error(e);
      NativeModules.RaioApi.debug(
        {
          msg: `order page submitOrder fail, ${e.message}`,
          method: 'order.submitOrder',
        },
        null,
      );
    }
    NativeModules.RaioApi.debug(
      {msg: 'order page submitOrder end', method: 'order.submitOrder'},
      null,
    );
  }

  async checkCustomer(order_id) {
    let orderInfo;
    NativeModules.RaioApi.debug(
      {msg: 'order page checkCustomer start', method: 'order.checkCustomer'},
      null,
    );
    try {
      orderInfo = await api.getOrderInfo(order_id);
      NativeModules.RaioApi.debug(
        {
          msg: `order page checkCustomer getOrderInfo success, ${JSON.stringify(
            orderInfo,
          )}`,
          method: 'order.checkCustomer',
        },
        null,
      );
    } catch (e) {
      console.error(e);
      NativeModules.RaioApi.debug(
        {
          msg: `order page checkCustomer getOrderInfo fail, ${e.message}`,
          method: 'order.checkCustomer',
        },
        null,
      );
    }
    //更新交易流水号
    let order = store.getState().orderInfo;
    NativeModules.RaioApi.debug(
      {
        msg: `order page checkCustomer get orderInfo from reducex, ${JSON.stringify(
          order,
        )}`,
        method: 'order.checkCustomer',
      },
      null,
    );

    if (orderInfo && orderInfo.serial_no && !order.serial_no) {
      order.serial_no = orderInfo.serial_no;
      let action = upgradeOrder(order);
      store.dispatch(action);
    }

    if (orderInfo && orderInfo.customer_id) {
      //seven: 更新redux中orderInfo的customer_id
      // order.customer_id = orderInfo.customer_id;
      let action = upgradeOrder(order);
      store.dispatch(action);
      //已注册成会员
      // this.registerCustomer();
    } else {
      // 加个index 防止定时器取消不掉
      if (this.checkCustomerTimer) {
        clearTimeout(this.checkCustomerTimer);
      }

      if (!this.unload) {
        this.checkCustomerTimerIndex = 0;
        this.checkCustomerTimer = setTimeout(() => {
          this.checkCustomerTimerIndex++;
          if (this.checkCustomerTimerIndex < 170) {
            this.checkCustomer(order_id);
          }
        }, 1000);
      }
    }
    NativeModules.RaioApi.debug(
      {msg: 'home page checkCustomer end', method: 'order.checkCustomer'},
      null,
    );
  }

  async switchPay(trade_no) {
    if (this.state.payMode === 'ali') {
      if (this.state.ali_pay_url === '') {
        let res = await this.pay(trade_no);
        let pay_url = res.pay_url;
        this.setState({qrcode: pay_url, ali_pay_url: pay_url});
      } else {
        this.setState({qrcode: this.state.ali_pay_url});
      }
    }

    if (this.state.payMode === 'wechat') {
      if (this.state.wechat_pay_url === '') {
        let res = await this.pay(trade_no);
        let pay_url = res.pay_url;
        this.setState({qrcode: pay_url, wechat_pay_url: pay_url});
      } else {
        this.setState({qrcode: this.state.wechat_pay_url});
      }
    }
  }

  async pay(trade_no) {
    let equipmentInfo = store.getState().equipmentInfo;
    let cart = store.getState().cart;
    let payInfo = {};
    payInfo.merchant_id = equipmentInfo.equipment_group_info.merchant_id;
    payInfo.trade_no = trade_no;
    payInfo.total_fee = cart.totalPrice;
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
  showLogin() {
    this.setState({loginVisible: true});
    //this.registerCustomer();
  }

  // registerCustomer() {
  //   const action = addCustomer();
  //   store.dispatch(action);
  //   this.props.navigation.replace('customerOrder');
  // }

  hideLogin() {
    this.setState({loginVisible: false});
  }

  componentWillUnmount() {
    console.debug('destroy page 【order】');
    this.unload = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }

    /*this.checkCustomerTimerArr.forEach(function(item){
      if(item) clearTimeout(item);
    })*/
    if (this.checkCustomerTimer) {
      clearTimeout(this.checkCustomerTimer);
    }

    this.didBlurListener.remove();
  }

  render() {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: '#E1E1E1',
        }}>
        <View style={{backgroundColor: '#fff'}}>
          <TopBar
            count={160}
            pageName="支付订单"
            navigation={this.props.navigation}
          />
          <View
            style={{
              backgroundColor: '#FAF0D7',
              height: p2dHeight(100),
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}>
            <Image
              style={{
                position: 'absolute',
                left: p2dWidth(40),
                top: p2dHeight(34),
                width: p2dWidth(42),
                height: p2dHeight(32),
              }}
              source={require('../assets/huiyuan.png')}
            />
            {/* <Text
              style={{
                fontWeight: '400',
                color: '#BB7D4E',
                marginLeft: p2dWidth(92),
                letterSpacing: p2dWidth(1),
                fontSize: p2dWidth(32),
              }}>
              免费开通会员享受专属优惠
            </Text> */}

            <TouchableOpacity
              style={{
                position: 'absolute',
                right: p2dWidth(30),
                top: p2dHeight(20),
                fontWeight: '500',
                backgroundColor: '#D0A281',
                width: p2dWidth(200),
                height: p2dHeight(60),
                borderRadius: p2dWidth(30),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => this.showLogin()}>
              <Text
                style={{
                  fontWeight: '500',
                  color: '#fff',
                  fontSize: p2dWidth(24),
                }}>
                注册/登录
              </Text>
            </TouchableOpacity>
          </View>
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
              height: p2dHeight(150),
            }}>
            <Text
              style={{
                position: 'absolute',
                left: p2dWidth(40),
                top: p2dHeight(34),
                fontSize: p2dWidth(32),
                fontWeight: '500',
                color: '#333333',
              }}>
              应 付
            </Text>
            <Text
              style={{
                position: 'absolute',
                right: p2dWidth(40),
                fontSize: p2dWidth(48),
                fontWeight: '500',
                color: '#333333',
                letterSpacing: p2dWidth(1),
              }}>
              ¥{parseCent(this.state.totalPrice)}
            </Text>
            <Image
              style={{
                position: 'absolute',
                top: p2dHeight(85),
                right: p2dWidth(265),
                width: p2dWidth(42),
                height: p2dHeight(32),
              }}
              source={require('../assets/huiyuan.png')}
            />
            {/* <Text
              style={{
                position: 'absolute',
                top: p2dHeight(77),
                right: p2dWidth(40),
                fontSize: p2dWidth(32),
                fontWeight: '400',
                color: '#BB7D4E',
                letterSpacing: p2dWidth(1),
              }}>
              会员价：¥{parseCent(this.state.totalCustomerPrice)}
            </Text> */}
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
              onPress={() => this.props.navigation.replace('home')}>
              取消支付
            </Text>
          </TouchableOpacity>
        </View>
        {this.state.loginVisible ? (
          <Login
            qrcode={`http://c.cinyou.com/?o=${this.state.order_id}`}
            hideLogin={this.hideLogin.bind(this)}
          />
        ) : null}
      </View>
    );
  }
}

export default order;
