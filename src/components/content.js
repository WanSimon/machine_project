import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

import {p2dHeight, p2dWidth, parseCent} from '../js/utils';
import {store} from '../store/store';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartList: {},
    };
  }

  componentDidMount() {
    let cartList = store.getState().cart.cartList;
    this.setState({cartList});
  }

  updateCart(type, product) {
    let merchant_product_id = product.merchant_product_info.merchant_product_id;
    if (type === -1) {
      let obj = this.state.cartList[merchant_product_id];
      if (obj && obj.num > 0) {
        obj.num--;
        this.setState({cartList: {...this.state.cartList}});
      }
    }
    if (type === 1) {
      let obj = this.state.cartList[merchant_product_id];
      if (obj) {
        if (obj.available_stock > obj.num) {
          obj.num++;
        }
      } else {
        //无可用库存
        if (product.real_stock <= product.lock_stock) {
          return;
        }
        this.state.cartList[merchant_product_id] = {
          num: 1,
          name: product.merchant_product_info.product_info.name,
          home_thumb: product.merchant_product_info.product_info.home_thumb,
          price: product.merchant_product_info.price,
          // customer_price: product.merchant_product_info.customer_price,
          specification:
            product.merchant_product_info.product_info.specification,
          product_id: product.merchant_product_info.product_info.id,
          electronic_monitoring_code:
            product.merchant_product_info.electronic_monitoring_code,
          batch_number: product.merchant_product_info.batch_number,
          expiration_date:
            product.merchant_product_info.product_info.expiration_date,
          manufacturer: product.merchant_product_info.product_info.manufacturer,
          batch: product.merchant_product_info.batch,
          real_stock: product.real_stock,
          lock_stock: product.lock_stock,
          //可用库存
          available_stock: product.real_stock - product.lock_stock,
        };
      }
      this.setState({cartList: {...this.state.cartList}});
    }
    this.props.setCartList({...this.state.cartList});
  }

  render() {
    return (
      <View
        style={{
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
        }}>
        {/* <View
          style={{
            width: p2dWidth(232),
            marginRight: p2dWidth(30),
            display: 'flex',
            flexDirection: 'column',
          }}>
          <View
            style={{
              width: '100%',
              height: p2dHeight(80),
              lineHeight: p2dHeight(80),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#B1EAEF',
            }}>
            <Image
              style={{
                width: p2dWidth(40),
                height: p2dWidth(40),
              }}
              source={require('../assets/up.png')}
            />
          </View>

          <View
            style={{
              flexGrow: 1,
              width: '100%',
              position: 'relative',
            }}>
            <ScrollView
              style={{
                width: '100%',
                position: 'absolute',
                height: '100%',
                backgroundColor: '#E1E1E1',
              }}>
              {this.props.typeArr.map((item) => (
                <Text
                  style={{
                    width: '100%',
                    height: p2dHeight(120),
                    textAlign: 'center',
                    lineHeight: p2dHeight(140),
                    fontSize: p2dWidth(36),
                    fontWeight: item.id === this.props.type ? '600' : '500',
                    color: item.id === this.props.type ? '#333333' : '#999999',
                    backgroundColor: item.id == this.props.type ? '#fff' : null,
                  }}
                  onPress={() => this.props.setType(item.id)}
                  key={item.id}>
                  {item.name}
                </Text>
              ))}
            </ScrollView>
          </View>

          <View
            style={{
              width: '100%',
              height: p2dHeight(80),
              backgroundColor: '#B1EAEF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              style={{
                width: p2dWidth(40),
                height: p2dWidth(40),
              }}
              source={require('../assets/down.png')}
            />
          </View>
        </View> */}

        {/* <View
          style={{
            flexGrow: 1,
            position: 'relative',
          }}> */}
        <ScrollView
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            // marginLeft: '5%',
            // width: '95%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'yellow',
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-evenly',
              marginRight: p2dWidth(30),
              backgroundColor: 'grey',
              // borderWidth: '2',
              // borderStyle: 'solid',
              // borderColor: 'green',
            }}>
            {this.props.dragArr.map((item) => (
              <View
                style={{
                  width: '44%',
                  height: p2dHeight(230),
                  marginBottom: p2dHeight(20),
                  float: 'left',
                  borderBottomWidth: p2dWidth(1),
                  borderBottomColor: '#DCDCDC',
                  position: 'relative',
                }}
                key={item.merchant_product_info.merchant_product_id}>
                <Image
                  style={{
                    width: p2dWidth(160),
                    height: p2dWidth(160),
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  source={{
                    uri:
                      $conf.resource_oss +
                      item.merchant_product_info.product_info.home_thumb,
                  }}
                />
                <Text
                  style={{
                    position: 'absolute',
                    left: p2dWidth(170),
                    top: p2dHeight(20),
                    height: p2dHeight(33),
                    lineHeight: p2dHeight(33),
                    color: '#333333',
                    fontWeight: '500',
                    fontSize: p2dWidth(24),
                  }}>
                  {item.merchant_product_info.product_info.name}
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    left: p2dWidth(170),
                    top: p2dHeight(63),
                    height: p2dHeight(25),
                    lineHeight: p2dWidth(25),
                    color: '#999999',
                    fontWeight: '500',
                    fontSize: p2dWidth(18),
                  }}>
                  {item.merchant_product_info.product_info.specification}
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    left: p2dWidth(10),
                    top: p2dHeight(180),
                    height: p2dHeight(40),
                    lineHeight: p2dHeight(40),
                    color: '#FF5C2A',
                    fontWeight: '500',
                    fontSize: p2dWidth(28),
                  }}>
                  ¥{parseCent(item.merchant_product_info.price)}
                </Text>
                <TouchableOpacity
                  onPress={() => this.updateCart(1, item)}
                  style={{
                    position: 'absolute',
                    right: p2dWidth(10),
                    top: p2dHeight(185),
                    width: p2dWidth(30),
                    height: p2dWidth(30),
                  }}>
                  <Image
                    style={{width: '100%', height: '100%'}}
                    source={require('../assets/plus.png')}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    position: 'absolute',
                    right: p2dWidth(40),
                    top: p2dHeight(185),
                    width: p2dWidth(84),
                    height: p2dHeight(30),
                    lineHeight: p2dHeight(30),
                    textAlign: 'center',
                    color: '#333333',
                    fontWeight: '500',
                    fontSize: p2dWidth(28),
                  }}>
                  {this.state.cartList[
                    item.merchant_product_info.merchant_product_id
                  ] &&
                  this.state.cartList[
                    item.merchant_product_info.merchant_product_id
                  ].num > 0
                    ? this.state.cartList[
                        item.merchant_product_info.merchant_product_id
                      ].num
                    : ''}
                </Text>
                {this.state.cartList[
                  item.merchant_product_info.merchant_product_id
                ] &&
                this.state.cartList[
                  item.merchant_product_info.merchant_product_id
                ].num > 0 ? (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: p2dWidth(124),
                      top: p2dHeight(185),
                      width: p2dWidth(30),
                      height: p2dWidth(30),
                    }}
                    onPress={() => this.updateCart(-1, item)}>
                    <Image
                      style={{width: '100%', height: '100%'}}
                      source={require('../assets/reduce.png')}
                    />
                  </TouchableOpacity>
                ) : null}
                {item.real_stock - item.lock_stock < 1 ? (
                  <ImageBackground
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    source={require('../assets/sold.png')}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
        {/* </View> */}
      </View>
    );
  }
}

export default Content;
