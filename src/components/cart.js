import React, { Component } from 'react';
import {Text, View, Image, ScrollView, TouchableOpacity} from 'react-native';

import {p2dHeight, p2dWidth, parseCent} from '../js/utils';

class cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartArr:[],
      cartList:{}
    }
  }
  componentDidMount() {
    let cartList = this.props.cartList;
    this.parseCart(cartList);
  }

  parseCart(cartList){
    let cartArr = [];
    for(let key in cartList){
      if(cartList[key].num>0){
        cartArr.push({
          merchant_product_id:key,
          ...cartList[key]
        });
      }
    }
    this.setState({cartList,cartArr});
    this.props.setCartList(cartList);
  }

  updateCart(type,product){
    let merchant_product_id = product.merchant_product_id;
    if(type===-1){
      let obj = this.state.cartList[merchant_product_id];
      if(obj && obj.num>0){
        obj.num--;
        this.parseCart({...this.state.cartList});
      }
    }
    if(type===1){
      let obj = this.state.cartList[merchant_product_id];
      if(obj){
        if(obj.available_stock > obj.num) obj.num++;
      }
      this.parseCart({...this.state.cartList});
    }
  }

  clearCart(){
    for(let key in this.state.cartList){
      this.state.cartList[key].num =0 ;
    }
    this.parseCart({...this.state.cartList});
  }

  render() {
    return (
      <View
        style={{
          position:'absolute',
          width:'100%',
          top:0,
          bottom:p2dHeight(160),
      }}>
        <View style={{
          width:'100%',
          height:'100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor:'rgba(0, 0, 0, 0.6)',
        }}>
          <TouchableOpacity onPress={this.props.setCartVisible} style={{
            flexGrow: 1,
          }}/>
          <View style={{
            width:'100%',
            minHeight:p2dHeight(130),
            borderTopRightRadius:p2dWidth(40),
            borderTopLeftRadius:p2dWidth(40),
            backgroundColor:'#fff'
          }}>
            <View style={{
              position:'absolute',
              left:p2dWidth(60),
              height:p2dHeight(130),
              top:p2dHeight(0),
              display: 'flex',
              justifyContent:'center',
              alignItems:'center'
            }}>
              <Text style={{
                fontSize:p2dWidth(36),
                fontWeight:'600',
                color:'#333333'
              }}>已选商品</Text>
            </View>

            <TouchableOpacity style={{
              position:'absolute',
              right:p2dWidth(60),
              top:p2dHeight(0),
              width:p2dWidth(500),
              height:p2dHeight(130),
              display: 'flex',
              justifyContent:'flex-end',
              flexDirection:'row',
              alignItems:'center'
            }} onPress={()=>this.clearCart()}>
              <Image
                style={{
                  width:p2dWidth(32),
                  height:p2dWidth(32)
                }}
                source={require('../assets/del.png')}
              />
              <Text
                style={{
                  fontSize:p2dWidth(32),
                  fontWeight:'500',
                  color:'#333333',
                  marginLeft:p2dWidth(10)
                }}>清空</Text>
            </TouchableOpacity>

            <ScrollView style={{
              marginTop:p2dHeight(130),
              maxHeight:p2dHeight(830),
              width:'100%',
              display:'flex',
              flexDirection:'column',
            }}>
              {this.state.cartArr.map((item,index)=><View key={item.merchant_product_id}>
                <View style={{
                  height:p2dHeight(194),
                  marginBottom:p2dHeight(40),
                }} >
                  <Image
                    style={{
                      position:'absolute',
                      left:p2dWidth(60),
                      top:p2dHeight(0),
                      width:p2dWidth(200),
                      height:p2dWidth(200)
                    }}
                    source={{uri:$conf.resource_oss+item.home_thumb}}
                  />
                  <Text style={{
                    position:'absolute',
                    left:p2dWidth(300),
                    top:p2dHeight(0),
                    height:p2dHeight(50),
                    lineHeight:p2dHeight(50),
                    color: '#333333',
                    fontWeight:'500',
                    fontSize:p2dWidth(36)
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{
                    position:'absolute',
                    left:p2dWidth(300),
                    top:p2dHeight(60),
                    height:p2dHeight(40),
                    lineHeight:p2dHeight(40),
                    color: '#999999',
                    fontWeight:'500',
                    fontSize:p2dWidth(28)
                  }}>
                    {item.specification}
                  </Text>
                  <Text style={{
                    position:'absolute',
                    left:p2dWidth(300),
                    top:p2dHeight(155),
                    height:p2dHeight(45),
                    lineHeight:p2dHeight(45),
                    color: '#FF5C2A',
                    fontWeight:'500',
                    fontSize:p2dWidth(32)
                  }}>
                    ¥{parseCent(item.price)}
                  </Text>
                  <TouchableOpacity onPress={()=>this.updateCart(1,item)} style={{
                    position:'absolute',
                    right:p2dWidth(60),
                    top:p2dHeight(134),
                    width:p2dWidth(66),
                    height:p2dWidth(66)
                  }}>
                    <Image
                      style={{
                        width:'100%',
                        height:'100%'
                      }}
                      source={require('../assets/plus.png')}
                    />
                  </TouchableOpacity>
                  <Text style={{
                    position:'absolute',
                    right:p2dWidth(126),
                    top:p2dHeight(134),
                    width:p2dWidth(136),
                    height:p2dHeight(66),
                    lineHeight:p2dHeight(66),
                    textAlign:'center',
                    color: '#333333',
                    fontWeight:'500',
                    fontSize:p2dWidth(46)
                  }}>{item.num}</Text>
                  <TouchableOpacity onPress={()=>this.updateCart(-1,item)} style={{
                    position:'absolute',
                    right:p2dWidth(262),
                    top:p2dHeight(134),
                    width:p2dWidth(66),
                    height:p2dWidth(66)
                  }}>
                    <Image
                      style={{
                        width:'100%',
                        height:'100%'
                      }}
                      source={require('../assets/reduce.png')}
                    />
                  </TouchableOpacity>

                </View>
                {
                  index === this.state.cartArr.length-1?null:
                    <View style={{
                      height:p2dHeight(2),
                      backgroundColor:'#DCDCDC',
                      marginBottom:p2dHeight(40),
                      marginLeft:p2dWidth(40),
                      marginRight:p2dWidth(40)
                    }}/>
                }
              </View>)}

            </ScrollView>
          </View>
        </View>

      </View>
    );
  }
}

export default cart;
