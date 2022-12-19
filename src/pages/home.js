import React, {Component} from 'react';
import {store} from '../store/store';
import {
  Animated,
  TouchableOpacity,
  Image,
  Text,
  View,
  TextInput,
  Button,
} from 'react-native';
import {height, p2dHeight, p2dWidth, parseTime} from '../js/utils';
import OperateModal from '../components/operator';

class home extends Component {
  constructor() {
    super();

    // this.state = {
    //   // addr: '',
    //   // date: '',
    //   // no: '',
    //   // scaleValue: new Animated.Value(1),
    //   // upgradeData: {},
    // };
    this.clickTimer = null;
    this.clickIndex = 0;
    this.animationIndex = 0;
  }

  async componentDidMount() {
    console.debug('go to page 【home】');
    // let info = store.getState().equipmentInfo;
    // let addr = info.equipmentGroupInfo.addr || '';
    // let date = parseTime(new Date(), '{y}-{m}-{d}  {h}:{i}');
    // let no = info.no || '';
    // this.setState({addr, date, no});
    // this.timer = setInterval(() => {
    //   let nowDate = parseTime(new Date(), '{y}-{m}-{d}  {h}:{i}');
    //   this.setState({date: nowDate});
    // }, 60000);
  }

  changeText(val) {
    this.setState({name: val});
    console.info('---name---', val);
  }

  componentWillUnmount() {
    console.debug('destroy page 【home】');
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }
  }

  addClick() {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }
    this.clickIndex++;
    this.clickTimer = setTimeout(() => {
      this.clickIndex = 0;
    }, 5000);
    if (this.clickIndex >= 5) {
      this.clickIndex = 0;
      //退出程序
      this.backDesktop();
    }
  }

  backDesktop() {
    this.refs.opModal.showModal();
  }

  confirmCallback() {
    if (this.refs.opModal) {
      this.refs.opModal.cancel();
    }
    this.props.navigation.navigate('admin');
  }

  render() {
    const styles = {
      textStyle: {
        height: p2dHeight(45),
        lineHeight: p2dHeight(45),
        fontSize: p2dWidth(32),
        fontWeight: '500',
        color: '#fff',
      },
    };
    return (
      <View style={{height: '100%', width: '100%', position: 'relative'}}>
        <Image
          style={{height: p2dHeight(400), width: p2dWidth(1080)}}
          source={require('../assets/homeTop.png')}></Image>
        <View
          style={{
            position: 'absolute',
            left: p2dWidth(60),
            top: p2dHeight(177),
          }}>
          <Text
            style={{
              fontSize: p2dWidth(45),
              color: 'white',
              fontWeight: 'bold',
            }}>
            欢迎使用
          </Text>
          <Image
            style={{
              position: 'absolute',
              top: -p2dHeight(3),
              left: p2dWidth(230),
              width: p2dWidth(320),
              height: p2dHeight(65),
            }}
            source={require('../assets/fh.png')}></Image>
        </View>
        <Text
          style={{
            letterSpacing: p2dWidth(10),
            marginTop: p2dHeight(100),
            textAlign: 'center',
            color: 'rgba(66,66,66,0.7)',
            fontSize: p2dWidth(50),
          }}>
          点击屏幕
        </Text>
        <Text
          style={{
            marginTop: p2dHeight(20),
            letterSpacing: p2dWidth(10),
            fontSize: p2dWidth(100),
            fontWeight: '700',
            textAlign: 'center',
          }}>
          自助购药
        </Text>
        <TouchableOpacity
          style={{marginLeft: '27%', marginTop: p2dHeight(100)}}
          onPress={() => this.props.navigation.navigate('list')}>
          <Image
            style={{width: p2dWidth(580), height: p2dWidth(720)}}
            source={require('../assets/buyMedBtn.png')}></Image>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => this.props.navigation.navigate('repertory')}>
          <Text>查看库存</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          onPress={() => this.props.navigation.navigate('unshelve')}>
          <Text>下架库存</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('replenishment')}>
          <Text>补货</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={{
            position: 'absolute',
            top: p2dHeight(300),
            left: p2dWidth(100),
          }}
          onPress={() => this.props.navigation.navigate('channel')}>
          <Text>货道管理</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          style={{
            position: 'absolute',
            top: p2dHeight(400),
            left: p2dWidth(100),
          }}
          onPress={() => this.props.navigation.navigate('admin')}>
          <Text>管理员登录页面</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: p2dHeight(500),
            left: p2dWidth(100),
          }}
          onPress={() => this.props.navigation.navigate('maintain')}>
          <Text>维护模式</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={{
            position: 'absolute',
            top: p2dHeight(600),
            left: p2dWidth(100),
          }}
          onPress={() => this.props.navigation.navigate('drugDetail')}>
          <Text>药品详情</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={{
            position: 'absolute',
            top: p2dHeight(800),
            left: p2dWidth(100),
          }}
          onPress={() => this.props.navigation.navigate('setting')}>
          <Text>setting</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={{
            position: 'absolute',
            top: p2dHeight(900),
            left: p2dWidth(100),
          }}
          onPress={() => this.setState({showAlert: true})}>
          <Text>AlertButton{this.state}</Text>
        </TouchableOpacity> */}
        <View
          style={{
            position: 'absolute',
            top: p2dHeight(700),
            left: p2dWidth(20),
            width: p2dWidth(400),
            height: p2dHeight(100),
          }}></View>

        {/* <View
          style={{
            position: 'absolute',
            top: p2dHeight(600),
            left: p2dWidth(100),
          }}>
          <Button
            onPress={() => {
              showMessage({
                message: 'Simple message',
                type: 'info',
              });
            }}
            title="Request Details"
            color="#841584"
          />
        </View> */}

        <TouchableOpacity
          style={{
            position: 'absolute',
            left: p2dWidth(20),
            bottom: p2dHeight(5),
            width: p2dWidth(200),
            height: p2dWidth(80),
          }}
          onPress={() => this.addClick()}>
          <Text style={{fontSize: p2dWidth(50), color: 'transparent'}}>
            设备维护
          </Text>
        </TouchableOpacity>
        <OperateModal
          ref="opModal"
          callback={this.confirmCallback.bind(this)}
        />
      </View>
    );
  }
}

export default home;
