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
    console.info('content');
    this.props.dragArr.forEach((item) => {
      console.info(
        '----------content------------',
        item.orgProductInfo.productInfo.homeThumbUrl,
      );
    });
  }

  updateCart(type, product) {
    let orgProductId = product.orgProductInfo.orgProductId;
    if (type === -1) {
      let obj = this.state.cartList[orgProductId];
      if (obj && obj.num > 0) {
        obj.num--;
        this.setState({cartList: {...this.state.cartList}});
      }
    }
    if (type === 1) {
      let obj = this.state.cartList[orgProductId];
      if (obj) {
        if (obj.availableStock > obj.num) {
          obj.num++;
        }
      } else {
        //无可用库存
        if (product.realStock <= product.lockStock) {
          return;
        }
        this.state.cartList[orgProductId] = {
          num: 1,
          name: product.orgProductInfo.productInfo.name,
          homeThumbUrl: product.orgProductInfo.productInfo.homeThumbUrl,
          price: product.orgProductInfo.price,
          specification: product.orgProductInfo.productInfo.specification,
          productId: product.orgProductInfo.productInfo.productId,
          electronicMonitoringCode:
            product.orgProductInfo.electronicMonitoringCode,
          batchNumber: product.orgProductInfo.batchNumber,
          expirationDate: product.orgProductInfo.productInfo.expirationDate,
          manufacturer: product.orgProductInfo.productInfo.manufacturer,
          batch: product.orgProductInfo.batch,
          realStock: product.realStock,
          lockStock: product.lockStock,
          //可用库存
          availableStock: product.realStock - product.lockStock,
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
          backgroundColor: '#FFFFFF',
        }}>
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
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
          }}>
          <View
            style={{
              marginLeft: p2dWidth(50),
              marginRight: p2dWidth(50),
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              // marginRight: p2dWidth(30),
              // borderColor: 'green',
              backgroundColor: '#FFFFFF',
            }}>
            {this.props.dragArr.map((item) => (
              <View
                style={{
                  width: '44%',
                  height: p2dHeight(230),
                  marginBottom: p2dHeight(20),
                  float: 'left',
                  marginTop: p2dHeight(40),
                  // borderBottomWidth: p2dWidth(3),
                  // borderBottomColor: '#D1D1D1',
                  position: 'relative',

                  backgroundColor: '#E6E6E6',
                  borderRadius: p2dWidth(6),
                }}
                key={item.orgProductInfo.productInfo.productId}>
                <Image
                  style={{
                    width: p2dWidth(160),
                    height: p2dWidth(160),
                    position: 'absolute',
                    top: p2dHeight(8),
                    left: p2dWidth(8),
                  }}
                  source={{
                    uri:
                      $conf.resource_oss +
                      item.orgProductInfo.productInfo.homeThumbUrl,
                  }}
                />
                <Text
                  style={{
                    position: 'absolute',
                    left: p2dWidth(170),
                    top: p2dHeight(20),
                    height: p2dHeight(35),
                    lineHeight: p2dHeight(37),
                    // borderWidth: 1
                    // borderColor: 'black',
                    color: '#333333',
                    fontWeight: '500',
                    fontSize: p2dWidth(28),
                  }}>
                  {item.orgProductInfo.productInfo.name}
                </Text>

                <Text
                  style={{
                    position: 'absolute',
                    height: p2dHeight(33),
                    lineHeight: p2dHeight(33),
                    color: '#333333',
                    fontWeight: '500',
                    fontSize: p2dWidth(27),
                  }}>
                  {item.orgProductInfo.productInfo.orgProductId}
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    left: p2dWidth(170),
                    top: p2dHeight(70),
                    height: p2dHeight(39),
                    lineHeight: p2dWidth(37),
                    color: '#999999',
                    fontWeight: '500',
                    fontSize: p2dWidth(28),
                    // borderWidth: 1,
                    // borderColor: 'green',
                  }}>
                  {item.orgProductInfo.productInfo.specification}
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    left: p2dWidth(20),
                    top: p2dHeight(180),
                    height: p2dHeight(40),
                    lineHeight: p2dHeight(40),
                    color: '#FF5C2A',
                    fontWeight: '500',
                    fontSize: p2dWidth(30),
                  }}>
                  ¥{parseCent(item.orgProductInfo.price)}
                </Text>
                <TouchableOpacity
                  onPress={() => this.updateCart(1, item)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: p2dHeight(165),
                    width: p2dWidth(60),
                    height: p2dWidth(60),
                    // borderWidth: 1,
                    // borderColor: 'green',
                    // position: 'relative',
                  }}>
                  <Image
                    style={{
                      position: 'absolute',
                      bottom: p2dWidth(8),
                      right: p2dWidth(8),
                      width: p2dWidth(40),
                      height: p2dWidth(40),
                      // borderWidth: 1,
                      // borderColor: 'black',
                    }}
                    source={require('../assets/bigPlus.png')}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    position: 'absolute',
                    right: p2dWidth(43),
                    top: p2dHeight(185),
                    width: p2dWidth(84),
                    height: p2dHeight(30),
                    lineHeight: p2dHeight(30),
                    textAlign: 'center',
                    color: '#333333',
                    fontWeight: '500',
                    fontSize: p2dWidth(30),
                  }}>
                  {this.state.cartList[item.orgProductInfo.orgProductId] &&
                  this.state.cartList[item.orgProductInfo.orgProductId].num > 0
                    ? this.state.cartList[item.orgProductInfo.orgProductId].num
                    : ''}
                </Text>
                {this.state.cartList[item.orgProductInfo.orgProductId] &&
                this.state.cartList[item.orgProductInfo.orgProductId].num >
                  0 ? (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: p2dWidth(110),
                      top: p2dHeight(165),
                      width: p2dWidth(60),
                      height: p2dWidth(60),
                      // borderWidth: 1,
                      // borderColor: 'green',
                    }}
                    onPress={() => this.updateCart(-1, item)}>
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        width: p2dWidth(40),
                        height: p2dWidth(40),
                        // borderColor: 'black',
                        // borderWidth: 1,
                        position: 'absolute',
                        bottom: p2dWidth(8),
                        right: p2dWidth(8),
                      }}
                      source={require('../assets/bigReduce.png')}
                    />
                  </TouchableOpacity>
                ) : null}
                {item.realStock - item.lockStock < 1 ? (
                  <View style={{}}>
                    <View
                      style={{
                        backgroundColor: 'rgba(97,97,97,0.7)',
                        width: p2dWidth(431),
                        height: p2dHeight(229),
                        borderWidth: p2dWidth(2),
                        borderRadius: p2dWidth(6),
                        borderColor: 'yellow',
                      }}></View>
                    <ImageBackground
                      style={{
                        // width: '100%',
                        // height: '100%',
                        width: p2dWidth(126),
                        height: p2dWidth(108),
                        // backgroundColor: 'transparent',
                        // color: 'yellow',
                        // opacity: 1,
                        position: 'absolute',
                        left: p2dWidth(150),
                        top: p2dHeight(60),
                      }}
                      source={require('../assets/sold.png')}
                    />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default Content;
