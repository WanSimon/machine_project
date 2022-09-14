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
      // totalCustomerPrice: 0,
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
    let equipmentInfo = this.props.equipmentInfo;
    let allDrag = equipmentInfo.product_list.sort((a, b) => {
      return (
        b.real_stock -
        (b.lock_stock || 0) -
        (a.real_stock - (a.lock_stock || 0))
      );
    });

    this.setState({
      cartList: cart.cartList,
      productNum: cart.productNum,
      totalPrice: cart.totalPrice,
      // totalCustomerPrice: cart.totalCustomerPrice,
      allDrag,
      dragArr: allDrag,
    });
    alert(store.getState().sceneStr);
    loadSound(require('../assets/mp3/chooseProduct.mp3'));
  }

  componentWillUnmount() {
    console.debug('destroy page 【list】');
  }
  //点击购物车图标
  setCartList(cartList) {
    let productNum = 0,
      totalPrice = 0;
    // totalCustomerPrice = 0;
    for (let key in cartList) {
      productNum += cartList[key].num;
      totalPrice += cartList[key].num * cartList[key].price;
      // totalCustomerPrice += cartList[key].num * cartList[key].customer_price;
    }
    this.setState({
      cartList: cartList,
      productNum,
      totalPrice,
      // totalCustomerPrice,
    });
    let action = upgradeCart({
      cartList: cartList,
      productNum,
      totalPrice,
      // totalCustomerPrice,
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
              drag.merchant_product_info.product_info.name.indexOf(
                searchText,
              ) !== -1,
          )
          .sort((a, b) => {
            return (
              b.real_stock -
              (b.lock_stock || 0) -
              (a.real_stock - (a.lock_stock || 0))
            );
          });
        this.setState({dragArr});
      }
    }
  }

  //药品品类查询
  setType(type) {
    this.setState({type});
    let productList = this.state.allDrag.filter((item) => {
      let r1 = true,
        r2 = true;
      if (this.state.searchText) {
        r1 =
          item.merchant_product_info.product_info.name.indexOf(
            this.state.searchText,
          ) !== -1;
      }
      //非全部
      if (type !== '1') {
        r2 = false;
        let index = $conf.typeArr.findIndex((item) => item.id === type);
        let category = $conf.typeArr[index];
        let idSet = new Set([category.id, ...category.children]);
        let category_list_info =
          item.merchant_product_info.product_info.category_list_info;
        if (category_list_info && Array.isArray(category_list_info)) {
          for (let j = 0; j < category_list_info.length; j++) {
            if (idSet.has(category_list_info[j].id)) {
              r2 = true;
              break;
            }
          }
        }
      }
      return r1 && r2;
    });
    this.setState({dragArr: productList});
  }

  goOrder() {
    //生成订单
    this.generateOrder();

    // let customerFlag = store.getState().customerFlag;
    //会员
    // if (customerFlag) {
    // this.props.navigation.navigate('customerOrder');
    // }
    //非会员
    // else {
    this.props.navigation.navigate('order');
    // }
  }

  //生成订单
  generateOrder() {
    let equipmentInfo = store.getState().equipmentInfo;
    let cart = store.getState().cart;
    this.setState({
      totalPrice: cart.totalPrice,
      // totalCustomerPrice: cart.totalCustomerPrice,
    });

    let order_detail_info_list = [];
    for (let key in cart.cartList) {
      let p = cart.cartList[key];
      if (p.num === 0) {
        continue;
      }
      let obj = {
        merchant_product_id: key,
        amount: p.price * p.num,
        // customer_amount: p.customer_price * p.num,
        unit_price: p.price,
        // customer_price: p.customer_price,
        product_count: p.num,
      };
      order_detail_info_list.push(obj);
    }

    let order_id = uuid.v4();
    //生成订单id
    let trade_no = uuid.v4().replace(/-/g, '');
    this.setState({order_id, trade_no});
    console.info(
      `list page first generate order_id=${order_id}, trade_no=${trade_no}`,
    );
    NativeModules.RaioApi.debug(
      {
        msg: `list page first generate order_id=${order_id}, trade_no=${trade_no}`,
        method: 'list.generateOrder',
      },
      null,
    );

    let orderInfo = {};
    orderInfo.id = order_id;
    orderInfo.inner_order_no = trade_no;
    orderInfo.merchant_id = equipmentInfo.equipment_group_info.merchant_id;
    orderInfo.equipment_id = equipmentInfo.id;
    orderInfo.amount = cart.totalPrice;
    // orderInfo.customer_amount = cart.totalCustomerPrice;
    orderInfo.order_status = OrderStatus.OS_NoPay;
    orderInfo.pay_status = PayStatus.PS_NoPay;
    orderInfo.buy_way = BuyWay.BW_Buy;
    orderInfo.order_source = OrderSource.OSRC_Equipment;
    // orderInfo.customer_id = '';
    orderInfo.pick_up_type = PickUpType.PUP_Scan_QRCode;
    orderInfo.id_card = '';
    orderInfo.medical_insurance_card = '';
    orderInfo.order_detail_info_list = order_detail_info_list;

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
          pageName="药品列表"
          hideBack={true}
          navigation={this.props.navigation}
        />
        <Search search={this.search.bind(this)} />
        <Content
          typeArr={$conf.typeArr}
          searchText={this.state.searchText}
          dragArr={this.state.dragArr}
          type={this.state.type}
          setType={this.setType.bind(this)}
          setCartList={this.setCartList.bind(this)}
        />
        <BottomBar
          navigate={this.props.navigation.navigate}
          productNum={this.state.productNum}
          totalPrice={this.state.totalPrice}
          // totalCustomerPrice={this.state.totalCustomerPrice}
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
