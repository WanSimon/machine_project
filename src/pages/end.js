import React, { Component } from 'react';
import { Text, View, Image, ScrollView,TouchableOpacity,ImageBackground,NativeModules  } from 'react-native';
import {p2dHeight, p2dWidth, parseCent} from "../js/utils";
import {clearCart} from '../action';
import {store} from '../store/store';

class end extends Component {
  constructor() {
    super();

    this.state = {
      count:15
    };

  }

  goHome(){
    //清空购物车
    const action = clearCart();
    store.dispatch(action);

    this.props.navigation.navigate('home');
  }

  async componentDidMount(){
    console.debug('go to page 【end】');
    this.timer = setInterval(()=>{
      console.debug('timer tita');
      if(this.state.count > 0)
        this.setState({count:this.state.count-1});
      else {
        this.goHome();
      }
    },1000);
  }

  componentWillUnmount(){
    console.debug('destroy page 【end】');
    if(this.timer) clearInterval(this.timer);
  }
  render() {
    return (
      <ImageBackground
        style={{width:'100%', height:'100%'}}
        imageStyle={{ width:'100%', height:'100%'}}
        source={require('../assets/end.png')}>
        <TouchableOpacity onPress={()=>this.goHome()}
          style={{
            position:'absolute',
            right:p2dWidth(12),
            top:p2dWidth(0),
            height:p2dWidth(140),
            display: 'flex',
            flexDirection:'row',
            justifyContent:'flex-end',
            alignItems:'center',
            width:p2dWidth(800)
          }}>
          <Image
            style={{
              width:p2dWidth(40),
              height:p2dWidth(40)
            }}
            source={require('../assets/home.png')}
          />
          <Text
            style={{
              fontSize:p2dWidth(32),
              fontWeight:'bold',
              color:"#fff",
              marginLeft:p2dWidth(10)
            }}>
            返回首页（{this.state.count}s）
          </Text>
        </TouchableOpacity>
        <View style={{
          position:'absolute',
          width:'100%',
          height:p2dHeight(73),
          top:p2dHeight(278),
          display: 'flex',
          justifyContent:'center',
          alignItems:'center',
        }}>
          <Text style={{
            fontWeight:'500',
            fontSize:p2dWidth(52),
            color:'#fff'
          }}>取药完成，感谢您的使用</Text>
        </View>
        <Image
          style={{
            position:'absolute',
            left:p2dWidth(64),
            top:p2dHeight(352),
            width:p2dWidth(964),
            height:p2dHeight(882)
          }}
          source={require('../assets/end2.png')}
        />
        <Image
          style={{
            position:'absolute',
            left:p2dWidth(60),
            bottom:p2dHeight(238),
            width:p2dWidth(960),
            height:p2dHeight(270)
          }}
          source={require('../assets/shape.png')}
        />
        <View style={{
          position:'absolute',
          left:p2dWidth(103),
          right:p2dWidth(103),
          height:p2dHeight(100),
          bottom:p2dHeight(288),
          display: 'flex',
          justifyContent:'center',
          alignItems:'center',
        }}>
          <Text style={{
            fontWeight:'500',
            fontSize:p2dWidth(28),
            color:'#fff'
          }}>请严格按照说明书或者在药师指导下使用药品；除药品质量原因外，药品一经出售，不得退换；未成年人应在监护人帮助指导下使用药品。</Text>
        </View>
        <View style={{
          position:'absolute',
          width:'100%',
          height:p2dHeight(73),
          bottom:p2dHeight(430),
          display: 'flex',
          justifyContent:'center',
          alignItems:'center',
        }}>
          <Text style={{
            fontWeight:'800',
            fontSize:p2dWidth(36),
            color:'#fff'
          }}>温馨提醒</Text>
        </View>
      </ImageBackground>
    );
  }
}

export default end;
