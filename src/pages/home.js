import React, {Component} from 'react';
import {store} from '../store/store';
import {
  Animated,
  Easing,
  ImageBackground,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import {p2dHeight, p2dWidth, parseTime} from '../js/utils';

import OperateModal from '../components/operator';
import Conf from '../js/conf';

class home extends Component {
  constructor() {
    super();

    this.state = {
      equipmentInfo: {},
      addr: '',
      date: '',
      no: '',
      scaleValue: new Animated.Value(1),
      upgradeData: {},
    };
    this.clickTimer = null;
    this.clickIndex = 0;
    this.animationIndex = 0;
  }

  async componentDidMount() {
    console.debug('go to page 【home】');

    let info = store.getState().equipmentInfo;
    let addr = info.equipmentGroupInfo.addr || '';
    let date = parseTime(new Date(), '{y}-{m}-{d}  {h}:{i}');
    let no = info.no || '';
    this.setState({addr, date, no});
    this.timer = setInterval(() => {
      let nowDate = parseTime(new Date(), '{y}-{m}-{d}  {h}:{i}');
      this.setState({date: nowDate});
    }, 60000);

    this.startAnimation();
  }
  //动画循环
  startAnimation() {
    Animated.sequence([
      Animated.timing(this.state.scaleValue, {
        toValue: 1.1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.scaleValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => this.startAnimation());
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

  addClickIndex() {
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
    this.props.navigation.navigate('setting');
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
      <ImageBackground
        style={{width: '100%', height: '100%'}}
        imageStyle={{width: '100%', height: '100%'}}
        source={require('../assets/home2.png')}>
        <Image
          style={{
            position: 'absolute',
            left: p2dWidth(20),
            top: p2dHeight(24),
            width: p2dWidth(50),
            height: p2dHeight(50),
          }}
          source={require('../assets/location.png')}
        />
        <Text
          numberOfLines={1}
          style={{
            position: 'absolute',
            left: p2dWidth(72),
            top: p2dHeight(27),
            right: p2dWidth(400),
            ...styles.textStyle,
          }}>
          {this.state.addr}
        </Text>
        <Text
          style={{
            position: 'absolute',
            right: p2dWidth(20),
            top: p2dHeight(27),
            ...styles.textStyle,
          }}>
          {this.state.date}
        </Text>
        <Text
          style={{
            width: '100%',
            position: 'absolute',
            textAlign: 'center',
            top: p2dHeight(324),
            height: p2dHeight(112),
            lineHeight: p2dHeight(112),
            fontSize: p2dWidth(80),
            fontWeight: 'bold',
            color: '#fff',
            letterSpacing: p2dWidth(8),
          }}>
          欢迎使用自助药房
        </Text>
        <Text
          style={{
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            top: p2dHeight(454),
            ...styles.textStyle,
            color: '#F9F9F9',
          }}>
          Welcome to the Self-service Pharmacy
        </Text>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: p2dWidth(350),
            bottom: p2dHeight(930),
            width: p2dWidth(360),
            height: p2dHeight(360),
          }}
          onPress={() => this.props.navigation.navigate('list')}>
          {/* // onPress={() => this.props.navigation.navigate('out')}> */}
          <Animated.View
            style={{
              width: p2dWidth(360),
              height: p2dWidth(360),
              transform: [{scale: this.state.scaleValue}],
            }}>
            <Image
              style={{
                width: p2dWidth(360),
                height: p2dWidth(360),
              }}
              source={require('../assets/buyBtn.png')}
            />
          </Animated.View>
        </TouchableOpacity>
        <Text
          style={{
            position: 'absolute',
            width: '100%',
            left: p2dWidth(20),
            bottom: p2dHeight(25),
            height: p2dHeight(33),
            lineHeight: p2dHeight(33),
            fontSize: p2dWidth(24),
            fontWeight: '500',
            color: '#fff',
          }}>
          设备编码：{this.state.no}
        </Text>
        <Image
          style={{
            position: 'absolute',
            left: p2dWidth(636),
            bottom: p2dHeight(76),
            width: p2dWidth(344),
            height: p2dWidth(719),
          }}
          source={require('../assets/people1.png')}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: p2dHeight(670),
            right: p2dWidth(170),
            width: p2dWidth(100),
            height: p2dWidth(100),
          }}
          onPress={() => this.addClickIndex()}
        />
        <OperateModal
          ref="opModal"
          callback={this.confirmCallback.bind(this)}
        />
        {/* <UpgradeModal ref="upModal" upgradeData={this.state.upgradeData} /> */}
      </ImageBackground>
    );
  }
}

const customStyle = StyleSheet.create({
  mtContainer: {
    position: 'absolute',
    bottom: p2dHeight(180),
    left: p2dWidth(125),
    width: p2dWidth(460),
    height: p2dHeight(667),
  },
  mtHeader: {
    width: p2dWidth(460),
    height: p2dHeight(130),
    backgroundColor: '#FFFFFF',
    borderRadius: p2dWidth(20),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: p2dWidth(40),
    paddingRight: p2dWidth(50),
  },
  mtLogo: {
    width: p2dHeight(63),
    height: p2dWidth(50),
  },
  mtTitle: {
    fontSize: p2dWidth(42),
    fontWeight: '800',
    color: '#333333',
    lineHeight: p2dWidth(59),
    letterSpacing: p2dWidth(4),
  },
  mtContent: {
    width: p2dWidth(460),
    height: p2dWidth(496),
    position: 'relative',
    paddingTop: p2dWidth(81),
    paddingBottom: p2dWidth(72),
  },
  mtLeft: {
    position: 'absolute',
    top: p2dWidth(-55),
    left: p2dWidth(26),
    width: p2dWidth(16),
    height: p2dWidth(75),
    backgroundColor: '#FFFFFF',
    borderRadius: p2dWidth(11),
  },
  mtRight: {
    position: 'absolute',
    top: p2dWidth(-55),
    right: p2dWidth(24),
    width: p2dWidth(16),
    height: p2dWidth(75),
    backgroundColor: '#FFFFFF',
    borderRadius: p2dWidth(11),
  },
  mtCenter: {
    position: 'absolute',
    top: p2dWidth(-30),
    left: '50%',
    marginLeft: p2dWidth(-150),
    width: p2dWidth(300),
    height: p2dWidth(60),
    backgroundColor: '#FF9E00',
    borderRadius: p2dWidth(40),
  },
  mtStep: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    paddingLeft: p2dWidth(42),
    paddingRight: p2dWidth(42),
  },
  mtItem: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
  },
  mtCircle: {
    width: p2dWidth(42),
    height: p2dWidth(42),
    borderColor: '#00BFCE',
    borderWidth: 2,
    borderRadius: p2dWidth(42),
    borderStyle: 'solid',
    marginRight: p2dWidth(10),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mtStepText: {
    fontSize: p2dWidth(28),
    fontWeight: '500',
    color: '#333333',
    lineHeight: p2dWidth(42),
    letterSpacing: 2,
  },
  mtStepText1: {
    fontSize: p2dWidth(20),
    fontWeight: '500',
    color: '#333333',
    lineHeight: p2dWidth(42),
    letterSpacing: 2,
  },
  mtStepText2: {
    color: '#00BFCE',
  },
  mtStepText3: {
    fontSize: p2dWidth(20),
    color: '#333333',
    lineHeight: p2dWidth(42),
    letterSpacing: 1,
  },
  mtStepText4: {
    fontSize: p2dWidth(28),
    fontWeight: '900',
    color: '#D0021B',
    lineHeight: p2dWidth(50),
    letterSpacing: 1,
  },
});

export default home;
