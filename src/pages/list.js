import React, {Component} from 'react';
import {View, NativeModules} from 'react-native';
import TopBar from '../components/topbar';
import Search from '../components/search';
import Content from '../components/content';
import BottomBar from '../components/bottombar';
import Cart from '../components/cart';
import {store} from '../store/store';
import {upgradeCart, upgradeOrder} from '../action';
import uuid from 'react-native-uuid';
import {
  BuyWay,
  OrderSource,
  OrderStatus,
  PayStatus,
  PayType,
  PickUpType,
} from '../js/common';
import {connect} from 'react-redux';
import {loadSound} from '../js/utils';

class list extends Component {
  constructor() {
    super();

    this.state = {
      cartVisible: false,
      cartList: {},
      productNum: 0,
      totalPrice: 0,
      searchText: '',
      allDrag: [],
      dragArr: [],
      type: 1,
      count: 160,
    };
  }

  async componentDidMount() {
    console.debug('go to page 【list】');

    let cart = this.props.cart;
    // let equipmentInfo = this.props.equipmentInfo;
    let formattedEquipmentInfo = store.getState().equipmentInfo.productList;

    // let allDrag = formattedEquipmentInfo;
    let allDrag = formattedEquipmentInfo.sort((a, b) => {
      return (
        b.realStock - (b.lockStock || 0) - (a.realStock - (a.lockStock || 0))
      );
    });

    this.setState({
      cartList: cart.cartList,
      productNum: cart.productNum,
      totalPrice: cart.totalPrice,
      allDrag,
      dragArr: allDrag,
    });
    // alert(store.getState().sceneStr);
    loadSound(require('../assets/mp3/chooseProduct.mp3'));
  }

  componentWillUnmount() {
    console.debug('destroy page 【list】');
  }
  //点击购物车图标
  setCartList(cartList) {
    let productNum = 0,
      totalPrice = 0;
    for (let key in cartList) {
      productNum += cartList[key].num;
      totalPrice += cartList[key].num * cartList[key].price;
    }
    this.setState({
      cartList: cartList,
      productNum,
      totalPrice,
    });
    let action = upgradeCart({
      cartList: cartList,
      productNum,
      totalPrice,
    });
    store.dispatch(action);
  }

  //隐藏购物篮
  setCartVisible() {
    this.setState({cartVisible: !this.state.cartVisible});
  }

  //搜索
  search(searchText) {
    this.setState({type: '1'});
    searchText = searchText.trim();
    if (searchText !== this.state.searchText) {
      this.setState({searchText});
      if (searchText === '') {
        this.setState({dragArr: this.state.allDrag});
      } else {
        let dragArr = this.state.allDrag
          .filter(
            (drag) =>
              drag.orgProductInfo.productInfo.name.indexOf(searchText) !== -1,
          )
          .sort((a, b) => {
            return (
              b.realStock -
              (b.lockStock || 0) -
              (a.realStock - (a.lockStock || 0))
            );
          });
        this.setState({dragArr});
      }
    }
  }

  goOrder() {
    //生成订单

    this.generateOrder();
    this.props.navigation.navigate('login');
  }

  //生成订单
  generateOrder() {
    // let equipmentInfo = store.getState().equipmentInfo;

    let cart = store.getState().cart;
    this.setState({
      totalPrice: cart.totalPrice,
    });

    console.info('cartList-------------', cart.cartList);
    let orderDetailInfoList = [];
    for (let key in cart.cartList) {
      let p = cart.cartList[key];
      if (p.num === 0) {
        continue;
      }
      let obj = {
        orgProductId: key,
        amount: p.price * p.num,
        unitPrice: p.price,
        productCount: p.num,
      };
      orderDetailInfoList.push(obj);
    }

    let orderId = uuid.v4();
    let tradeNo = uuid.v4().replace(/-/g, '');
    this.setState({orderId, tradeNo});
    console.info(
      `list page first generate orderId=${orderId}, tradeNo=${tradeNo}`,
    );
    NativeModules.RaioApi.debug(
      {
        msg: `list page first generate orderId=${orderId}, tradeNo=${tradeNo}`,
        method: 'list.generateOrder',
      },
      null,
    );

    let orderInfo = {};
    orderInfo.orderId = orderId;
    orderInfo.innerOrderNo = tradeNo;
    orderInfo.orderStatus = OrderStatus.OS_NoPay; //
    orderInfo.payStatus = PayStatus.PS_NoPay; ///
    orderInfo.buyWay = BuyWay.BW_Buy; //
    orderInfo.orderSource = OrderSource.OSRC_Equipment; //
    orderInfo.payType = PayType.PT_Wechat;
    orderInfo.pickUpType = PickUpType.PUP_Scan_QRCode;
    orderInfo.idCard = '';
    orderInfo.medicalInsuranceCard = '';
    orderInfo.orgId = store.getState().equipmentInfo.equipmentGroupInfo.orgId;
    orderInfo.equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    orderInfo.orderDetailInfoList = orderDetailInfoList;
    orderInfo.amount = orderDetailInfoList.reduce((pre, cur) => {
      return pre + cur.amount;
    }, 0);
    orderInfo.payAmount = orderInfo.amount;
    orderInfo.lockProduct = 0; //暂时不用
    orderInfo.lockExpireDate = ''; //暂时不用
    console.info('list page upgrade reducex orderInfo = %o', orderInfo);
    NativeModules.RaioApi.debug(
      {
        msg: `list page upgrade reducex orderInfo = ${JSON.stringify(
          orderInfo,
        )}`,
        method: 'list.generateOrder',
      },
      null,
    );

    let action = upgradeOrder(orderInfo);
    store.dispatch(action);
  }

  render() {
    return (
      <View
        store={store}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
        <TopBar
          count={this.state.count}
          pageName="商品列表"
          hideBack={true}
          navigation={this.props.navigation}
        />
        <Search search={this.search.bind(this)} />
        <Content
          typeArr={$conf.typeArr}
          searchText={this.state.searchText}
          dragArr={this.state.dragArr}
          type={this.state.type}
          // setType={this.setType.bind(this)}
          setCartList={this.setCartList.bind(this)}
        />
        <BottomBar
          navigate={this.props.navigation.navigate}
          productNum={this.state.productNum}
          totalPrice={this.state.totalPrice}
          goOrder={() => this.goOrder()}
          setCartVisible={this.setCartVisible.bind(this)}
        />
        {this.state.cartVisible ? (
          <Cart
            cartList={this.state.cartList}
            setCartList={this.setCartList.bind(this)}
            setCartVisible={this.setCartVisible.bind(this)}
          />
        ) : null}
      </View>
    );
  }
}

export default connect((state) => ({
  cart: state.cart,
  equipmentInfo: state.equipmentInfo,
}))(list);
