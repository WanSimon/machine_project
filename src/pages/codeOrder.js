import React, { Component } from 'react';
import { store } from '../store/store';
import {clearCart, upgradeEquipmentInfo, upgradeStatusFlag} from '../action'
import {TouchableOpacity, View, Text, Image, ScrollView, NativeModules} from 'react-native';
import api from '../js/cloudApi'
import {p2dHeight, p2dWidth, parseTime} from "../js/utils";

import TopBar from '../components/topbar';

class codeOrder extends Component {
  constructor() {
    super();

    this.state = {
      productNum:0,
      productArr:[],
      btnDisabled: false,
    };
  }

  async componentDidMount(){
    console.debug('go to page 【codeOrder】');
    let codeOrder = store.getState().codeOrder;
    let cartList = codeOrder.cartList;
    let productArr = [];
    for(let key in cartList){
      productArr.push({
        merchant_product_id:key,
        ...cartList[key]
      });
    }
    let productNum = codeOrder.productNum;
    this.setState({productNum,productArr});
  }

  componentWillUnmount(){
    console.debug('destroy page 【codeOrder】');
    this.setState({ btnDisabled: false });
  }

  confirm(){
    if(this.state.btnDisabled) return;
    this.setState({ btnDisabled: true });
    this.props.navigation.navigate('codeWait');
    this.setState({ btnDisabled: false });
  }

  render() {
    const Style = {
      headerStyle:{
        fontSize:p2dWidth(36),
        fontWeight:'600',
        color:'#333',
        letterSpacing:p2dWidth(1),
        width:p2dWidth(180),
        height:'100%',
        textAlign:'center'
      },
      bodyStyle:{
        fontWeight:'400',
        color:'#333',
        width:p2dWidth(180),
        fontSize: p2dWidth(28),
        textAlign:'center'
      }
    };
    return (
      <View style={{
        height:'100%'
      }}>
        <TopBar
          count={160}
          pageName='订单详情'
          navigation={this.props.navigation}
        />
        <View style={{
          width:'100%',
          display: 'flex',
          flexDirection:'row',
          padding:p2dWidth(40)
        }}>
          <Text style={{
            height:'100%',
            flexGrow:1,
            ...Style.headerStyle,
            textAlign: 'left',
          }}>药品名称</Text>
          <Text style={Style.headerStyle}>单价</Text>
          <Text style={Style.headerStyle}>数量</Text>
          <Text style={{...Style.headerStyle,textAlign:'right'}}>金额</Text>
        </View>
        <View style={{
          height: p2dHeight(2),
          backgroundColor:'#DCDCDC',
          marginLeft:p2dWidth(40),
          marginRight:p2dWidth(40)
        }}/>
        <ScrollView style={{
          flexGrow: 1,
          width:'100%',
          display:'flex',
          flexDirection:'column'
        }}>
          {
            this.state.productArr.map(item=><View style={{
              width:'100%',
              display: 'flex',
              flexDirection:'row',
              padding:p2dWidth(40)
            }}>
              <View style={{
                height:'100%',
                flexGrow:1,
                ...Style.headerStyle,
                textAlign: 'left',
              }}>
                <Image
                  style={{
                    position:'absolute',
                    top:p2dHeight(0),
                    width:p2dWidth(100),
                    height:p2dHeight(100)
                  }}
                  source={{uri:$conf.resource_oss+item.home_thumb}}
                />
                <Text style={{
                  position:'absolute',
                  left:p2dWidth(100),
                  top:p2dHeight(0),
                  ...Style.bodyStyle
                }}>{item.name}</Text>
              </View>

              <Text style={Style.bodyStyle}>¥{item.price/100}</Text>
              <Text style={Style.bodyStyle}>{item.num}</Text>
              <Text style={{...Style.bodyStyle,textAlign:'right'}}>¥{item.price*item.num/100}</Text>
            </View>)
          }
        </ScrollView>

        <View style={{
          width:'100%',
          position:'absolute',
          bottom:0,
          height:p2dHeight(160),
          display: 'flex',
          alignItems:'center',
          flexDirection:'row',
          justifyContent:'space-between',
          backgroundColor:'#ccc'
        }}>
          <Text style={{
            fontWeight:'600',
            fontSize:p2dWidth(32),
            color:'#333',
            marginLeft:p2dWidth(40)
          }}>
            本次您共取 <Text style={{color:'#FF5D2B'}}>{this.state.productArr.length}</Text> 种，<Text style={{color:'#FF5D2B'}}>{this.state.productNum}</Text> 盒药品
          </Text>
          <TouchableOpacity style={{
            width: p2dWidth(280),
            height: p2dHeight(100),
            borderRadius: p2dWidth(65),
            backgroundColor:'#00BFCE',
            marginRight:p2dWidth(40),
            display: 'flex',
            justifyContent:'center',
            alignItems:'center'
          }} onPress={()=>this.confirm()}>
            <Text style={{
              color:'#fff',
              fontSize:p2dWidth(36),
              fontWeight:'bold'
            }}>确认取药</Text>
          </TouchableOpacity>
        </View>
      </View>

    );
  }
}

export default codeOrder;
