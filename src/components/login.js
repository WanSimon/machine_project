import React, {Component} from 'react';
import {Text, View, Image, ScrollView, TouchableOpacity} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {p2dHeight, p2dWidth} from '../js/utils';

class login extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}

  render() {
    return (
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}>
          <View
            style={{
              width: p2dWidth(580),
              height: p2dWidth(650),
              backgroundColor: '#fff',
              borderRadius: p2dWidth(40),
            }}>
            <Text
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
              <QRCode size={p2dWidth(274)} value={this.props.qrcode} />
            </View>
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
              微信扫描二维码
            </Text>
            <Text
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
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export default login;
