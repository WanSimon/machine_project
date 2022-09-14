import React, {Component} from 'react';
import {Text, View, Image, ScrollView, TouchableOpacity} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {p2dHeight, p2dWidth} from '../js/utils';
import api, {WeiXinAPI} from '../js/cloudApi';
import {updateSceneStr} from '../action';
import {store} from '../store/store';
import TopBar from '../components/topbar';
class login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrcode: '',
    };
  }

  async componentDidMount() {
    let res = await api.getQrCode();
    let weixinQrcode = await WeiXinAPI.getWeiXinQrcode(res.ticket); //获取二维码
    this.setState({qrcode: weixinQrcode});
    const action = updateSceneStr(res.sceneStr);
    store.dispatch(action);
    let resUserInfo;

    let t = window.setTimeout(() => {
      resUserInfo = api.getUserInfo(res.sceneStr);
    }, 2000);

    if (resUserInfo.status === 200) {
      window.clearTimeout(t);
      this.props.navigation.navigate('customerOrder');
    }
  }

  render() {
    return (
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}>
        <TopBar
          hideBack={true}
          pageName="微信登录"
          navigation={this.props.navigation}
        />
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}>
          <Text
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
              fontWeight: '600',
              color: '#333333',
              fontSize: p2dWidth(80),
              top: p2dHeight(200),
            }}>
            微信扫码登录
          </Text>
          <View
            style={{
              width: p2dWidth(580),
              height: p2dWidth(650),
              backgroundColor: '#fff',
              borderRadius: p2dWidth(40),
            }}>
            {/* <Text
              style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                fontWeight: '600',
                color: '#333333',
                fontSize: p2dWidth(42),
                top: p2dHeight(80),
              }}>
              会员注册/登录
            </Text> */}

            <Text
              style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                fontWeight: '500',
                color: '#BEBEBE',
                fontSize: p2dWidth(24),
                top: p2dHeight(493),
              }}>
              扫码后点击确定，即可成功登录。
            </Text>

            <View
              style={{
                position: 'absolute',
                right: p2dWidth(153),
                top: p2dHeight(179),
                width: p2dWidth(274),
                height: p2dHeight(274),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {/* <QRCode size={p2dWidth(274)} value={this.state.qrcode} /> */}
              <Image
                style={{
                  height: p2dHeight(274),
                  width: p2dWidth(274),
                }}
                source={{
                  uri: this.state.qrcode,
                }}
              />
            </View>

            {/* <Text
              style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                fontWeight: '500',
                color: '#BEBEBE',
                fontSize: p2dWidth(24),
                bottom: p2dHeight(50),
              }}
              onPress={() => this.props.hideLogin()}>
              跳过 直接支付 >>
            </Text> */}
          </View>
        </View>
      </View>
    );
  }
}

export default login;
