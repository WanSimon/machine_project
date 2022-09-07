import React, { Component } from 'react';
import { store } from '../store/store';
import {upgradeCodeOrder, upgradeStatusFlag} from '../action';
import {Animated, Easing, ImageBackground, TouchableOpacity, View, Image, Text, NativeModules, BackHandler,Modal,StyleSheet,Alert,Button,TextInput} from 'react-native';
import api from '../js/cloudApi'
import {loadSound, p2dHeight, p2dWidth, parseTime} from '../js/utils';
import {OrderStatus,LockTag} from '../js/common'
import OperateModal from '../components/operator';
import TopBar from '../components/topbar';

class code extends Component {
  constructor() {
    super();

    this.state = {
      equipmentInfo:{},
      no:'',
      code:''
    };
  }

  async componentDidMount(){
    console.debug('go to page 【code】');
    let info = store.getState().equipmentInfo;
    let no = info.no||'';
    this.setState({no});
    loadSound(require('../assets/mp3/pickupcode.mp3'));
  }

  componentWillUnmount(){
    console.debug('destroy page 【code】');
  }

  inputCode(number){
    if(number === 'c') {
      if(this.state.code.length>0) this.setState({code:''});
    }else if(number === 'b'){
      if(this.state.code.length>0) {
        let code = this.state.code.slice(0,this.state.code.length-1);
        this.setState({code});
      }
    }else {
      if(this.state.code.length<6) this.setState({code:this.state.code+number});
    }
  }

  async confirm(){
    if(this.state.code.length<6) return;
    NativeModules.RaioApi.debug({msg: 'code page confirm start', method: 'code.confirm'}, null);
    try{
      let equipmentInfo = store.getState().equipmentInfo;
      let allDrag = equipmentInfo.product_list;
      // 取药码查询设备药品
      let orderInfo = await api.getEquipmentProductByCode(equipmentInfo.id,this.state.code);

      let cartList = {};
      let productNum = 0;

      if(orderInfo && orderInfo.pick_up_product_list_info && orderInfo.pick_up_product_list_info.length>0){
        let orderStatus = orderInfo.order_status;
        // 锁定标识
        let lock_product = orderInfo.lock_product;
        // 未支付不能取药
        if(orderStatus!=OrderStatus.OS_Paied){
          console.error('code page confirm err, order unpaied');
          NativeModules.RaioApi.debug({msg: 'code page confirm err, order unpaied', method: 'code.confirm'}, null);
          loadSound(require('../assets/mp3/orderNoPaid.mp3'));
          return ;
        }

        for(let i=0;i<orderInfo.pick_up_product_list_info.length;i++){
          let merchant_product_id = orderInfo.pick_up_product_list_info[i].merchant_product_id;
          let product_count = orderInfo.pick_up_product_list_info[i].product_count - (orderInfo.pick_up_product_list_info[i].finished_count||0);
          if(product_count ===0) continue;
          productNum += product_count;
          let dragIndex = allDrag.findIndex(item=>item.merchant_product_info.merchant_product_id === merchant_product_id);
          if(dragIndex === -1){
            console.error('code page confirm err, merchant_product_id:%s not found', merchant_product_id);
            NativeModules.RaioApi.debug({msg: `code page confirm err, merchant_product_id:${merchant_product_id} not found`, method: 'code.confirm'}, null);
            loadSound(require('../assets/mp3/noProdcutInEquipment.mp3'));
            return ;
          }
          let product = allDrag[dragIndex];

          // 锁库存
          if(lock_product == LockTag.LT_Lock){
            if(product.real_stock < product_count){
              console.error('code page confirm err, merchant_product_id:%s lack',merchant_product_id);
              NativeModules.RaioApi.debug({msg: `code page confirm err, merchant_product_id:${merchant_product_id} lack`, method: 'code.confirm'}, null);
              loadSound(require('../assets/mp3/notEnough.mp3'));
              return ;
            }
          }
          // 不锁库存
          else {
            let stock = product.real_stock - product.lock_stock;
            if(stock < product_count){
              console.error('merchant_product_id:%s not enough',merchant_product_id);
              NativeModules.RaioApi.debug({msg: `code page confirm err, merchant_product_id:${merchant_product_id} not enough`, method: 'code.confirm'}, null);
              loadSound(require('../assets/mp3/notEnough.mp3'));
              return ;
            }
          }
          cartList[merchant_product_id]={
            num:product_count,
            name:product.merchant_product_info.product_info.name,
            home_thumb:product.merchant_product_info.product_info.home_thumb,
            price:product.merchant_product_info.price,
            customer_price:product.merchant_product_info.customer_price,
            specification:product.merchant_product_info.product_info.specification,
            product_id:product.merchant_product_info.product_info.id,
            electronic_monitoring_code:product.merchant_product_info.electronic_monitoring_code,
            batch_number:product.merchant_product_info.batch_number,
            expiration_date:product.merchant_product_info.product_info.expiration_date,
            manufacturer:product.merchant_product_info.product_info.manufacturer,
            batch:product.merchant_product_info.batch,
            real_stock:product.real_stock,
            lock_stock:product.lock_stock
          };
        }
      }else{
        loadSound(require('../assets/mp3/codeNotExist.mp3'));
        console.error('code page confirm err, no product found.');
        NativeModules.RaioApi.debug({msg: 'code page confirm err, no product found', method: 'code.confirm'}, null);
        return ; 
      }
      let codeOrder = {
        cartList,
        orderInfo,
        productNum,
      };
      const action = upgradeCodeOrder(codeOrder);
      store.dispatch(action);
      this.setState({code:''});
      this.props.navigation.navigate('codeOrder');
    }catch(e){
      console.error('code page confirm err, no product found.');
      NativeModules.RaioApi.debug({msg: 'code page confirm err, no product found', method: 'code.confirm'}, null); 
    }
    NativeModules.RaioApi.debug({msg: 'home page check app version end', method: 'code.confirm'}, null);
  }

  render() {
    const Style = {
      inputStyle: {
        width: p2dWidth(90),
        height: p2dWidth(90),
        borderRadius: p2dWidth(8),
        borderWidth: p2dWidth(3),
        marginLeft:p2dWidth(10),
        marginRight:p2dWidth(10),
        display: 'flex',
        justifyContent:'center',
        alignItems:'center'
      },
      codeStyle:{
        fontSize:p2dWidth(52),
        fontWeight:'bold',
        color:'#333'
      },
      btnStyle:{
        width: p2dWidth(196),
        height: p2dHeight(196),
        backgroundColor:'#FCFDFE',
        display: 'flex',
        justifyContent:'center',
        alignItems:'center'
      },
      numberStyle:{
        fontSize:p2dWidth(42),
        fontWeight:'500',
        color:'#333'
      }
    };
    return (
      <ImageBackground
        style={{width:'100%', height:'100%'}}
        imageStyle={{ width:'100%', height:'100%'}}
        source={require('../assets/home2.png')}>
        <TopBar
          count={160}
          pageName='取药码取药'
          navigation={this.props.navigation}
        />
        <View style={{
          backgroundColor:'#fff',
          height:p2dHeight(600),
          width:p2dWidth(800),
          position:'absolute',
          left:p2dWidth(140),
          top:p2dHeight(320),
          borderTopLeftRadius:p2dWidth(40),
          borderTopRightRadius:p2dWidth(40),
          borderBottomLeftRadius:p2dWidth(8),
          borderBottomRightRadius:p2dWidth(8)
        }}>
          <View style={{
            width:'100%',
            position:'absolute',
            top:p2dHeight(140),
            display: 'flex',
            justifyContent:'center',
            flexDirection:'row'
          }}>
            <View style={{...Style.inputStyle,borderColor: (this.state.code.length>0?'#00BFCE':'#BEBEBE')}}>
              <Text style={Style.codeStyle}>{this.state.code.length>0?this.state.code[0]:''}</Text>
            </View>
            <View style={{...Style.inputStyle,borderColor: (this.state.code.length>1?'#00BFCE':'#BEBEBE')}}>
              <Text style={Style.codeStyle}>{this.state.code.length>1?this.state.code[1]:''}</Text>
            </View>
            <View style={{...Style.inputStyle,borderColor: (this.state.code.length>2?'#00BFCE':'#BEBEBE')}}>
              <Text style={Style.codeStyle}>{this.state.code.length>2?this.state.code[2]:''}</Text>
            </View>
            <View style={{...Style.inputStyle,borderColor: (this.state.code.length>3?'#00BFCE':'#BEBEBE')}}>
              <Text style={Style.codeStyle}>{this.state.code.length>3?this.state.code[3]:''}</Text>
            </View>
            <View style={{...Style.inputStyle,borderColor: (this.state.code.length>4?'#00BFCE':'#BEBEBE')}}>
              <Text style={Style.codeStyle}>{this.state.code.length>4?this.state.code[4]:''}</Text>
            </View>
            <View style={{...Style.inputStyle,borderColor: (this.state.code.length>5?'#00BFCE':'#BEBEBE')}}>
              <Text style={Style.codeStyle}>{this.state.code.length>5?this.state.code[5]:''}</Text>
            </View>
          </View>
          <Text style={{
            position:'absolute',
            width: '100%',
            top:p2dHeight(260),
            fontSize:p2dWidth(32),
            fontWeight:'bold',
            color:'#999',
            textAlign:'center'
          }}>
            请输入六位数<Text style={{color:'#00BFCE'}}>取药码</Text>进行取药
          </Text>
          <TouchableOpacity style={{
            position:'absolute',
            top:p2dHeight(440),
            left:p2dWidth(260),
            width: p2dWidth(280),
            height: p2dHeight(80),
            borderRadius: p2dWidth(50),
            backgroundColor:this.state.code.length===6?'#00BFCE':'#ccc',
            display: 'flex',
            justifyContent:'center',
            alignItems:'center'
          }} onPress={()=>this.confirm()}>
            <Text style={{
              color:'#fff',
              fontSize:p2dWidth(36),
              fontWeight:'bold'
            }}>确认</Text>
          </TouchableOpacity>
        </View>
        <View style={{
          opacity:1,
          height:p2dHeight(600),
          width:p2dWidth(800),
          position:'absolute',
          left:p2dWidth(140),
          top:p2dHeight(925),
          borderTopLeftRadius:p2dWidth(8),
          borderTopRightRadius:p2dWidth(8),
          borderBottomLeftRadius:p2dWidth(40),
          borderBottomRightRadius:p2dWidth(40),
          display: 'flex',
          justifyContent:'space-between',
          flexDirection:'row',
          flexWrap:'wrap',
          alignContent:'space-between'
        }}>
          <TouchableOpacity onPress={()=>this.inputCode(1)} style={{...Style.btnStyle,borderTopLeftRadius:p2dWidth(8)}} >
            <Text style={Style.numberStyle}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode(2)} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode(3)} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('b')} style={{...Style.btnStyle,borderTopRightRadius:p2dWidth(8),backgroundColor: '#E1E1E1'}}>
            <Image
              style={{
                width:p2dWidth(42),
                height:p2dHeight(32)
              }}
              source={require('../assets/backspace.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('4')} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('5')} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('6')} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('0')} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('7')} style={{...Style.btnStyle,borderBottomLeftRadius:p2dWidth(40)}}>
            <Text style={Style.numberStyle}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('8')} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('9')} style={Style.btnStyle}>
            <Text style={Style.numberStyle}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.inputCode('c')} style={{...Style.btnStyle,borderBottomRightRadius:p2dWidth(40),backgroundColor: '#E1E1E1'}}>
            <Text style={Style.numberStyle}>清除</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            position:'absolute',
            width:'100%',
            left:p2dWidth(20),
            bottom:p2dHeight(25),
            height:p2dHeight(33),
            lineHeight:p2dHeight(33),
            fontSize:p2dWidth(24),
            fontWeight:'500',
            color:'#fff'
          }}
        >设备编码：{this.state.no}</Text>
      </ImageBackground>

    );
  }
}

export default code;
