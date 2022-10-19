import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import {p2dHeight, p2dWidth} from '../js/utils';
import {clearCart} from '../action';
import {store} from '../store/store';
import TopBar from '../components/topbar';
import QRCode from 'react-native-qrcode-svg';

class fail extends Component {
  constructor(props) {
    super(props);
    const {navigation} = this.props;
    let productList = navigation.getParam('productList');
    //productList = [{name:'阿莫西林',status:1}];
    let info = store.getState().equipmentInfo;
    this.state = {
      text1: '非常抱歉，取药失败！',
      text2: '联系客服：' + (info.equipmentGroupInfo.phone || '4008-793-542'),
      text3: '请在取药口拿取小票，并拍照留存',
      text4: '工作时间：09:00-18:00',
      productList: productList,
      serialNo: '',
      applyRefundUrl: '',
    };
  }

  goHome() {
    const action = clearCart();
    store.dispatch(action);
    this.props.navigation.navigate('home');
  }

  async componentDidMount() {
    let orderInfo = store.getState().orderInfo;

    let applyRefundUrl = $conf.applyRefundUrl + `&o=${orderInfo.serialNo}`;
    this.setState({serialNo: orderInfo.serialNo, applyRefundUrl});
  }

  parseStatus(status) {
    switch (status) {
      case 1:
        return '取药失败';
      case 2:
        return '取药成功';
      case 3:
        return '取药失败';
    }
  }

  render() {
    return (
      <View style={customStyle.container}>
        <TopBar
          disableCount={true}
          hideBack={true}
          pageName="取药失败"
          navigation={this.props.navigation}
        />
        <ImageBackground
          style={{width: '100%', height: p2dHeight(460), position: 'relative'}}
          imageStyle={{width: '100%', height: p2dHeight(460)}}
          source={require('../assets/failed.png')}>
          <Text style={customStyle.failText1}>{this.state.text1}</Text>
          <Text style={customStyle.failText2}>{this.state.text2}</Text>
          <Text style={customStyle.failText4}>{this.state.text4}</Text>
          <Text style={customStyle.failText3}>{this.state.text3}</Text>
        </ImageBackground>

        <View
          style={{
            marginTop: p2dHeight(40),
            paddingLeft: p2dWidth(40),
            width: '100%',
          }}>
          <Text
            style={{
              fontSize: p2dWidth(32),
              fontWeight: '600',
              color: '#333',
              letterSpacing: p2dWidth(1),
            }}>
            流水订单号：{this.state.serialNo}
          </Text>
        </View>

        <View style={customStyle.productContainer}>
          <ScrollView
            style={{
              width: '100%',
              position: 'absolute',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
            {this.state.productList.map((item) => (
              <View style={customStyle.productItem}>
                <Image
                  style={customStyle.productImage}
                  source={{uri: $conf.resource_oss + item.homeThumb}}
                />
                <View style={customStyle.productInfo}>
                  <Text style={customStyle.productName}>{item.name}</Text>
                  <Text style={customStyle.productStatus}>
                    {this.parseStatus(item.status)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => this.goHome()}
          style={customStyle.confirmBtn}>
          <Image
            style={{
              width: p2dWidth(280),
              height: p2dHeight(100),
            }}
            source={require('../assets/fail_ok.png')}
          />
        </TouchableOpacity>

        <View
          style={{
            position: 'absolute',
            left: p2dWidth(57),
            bottom: p2dHeight(110),
            width: p2dWidth(140),
            height: p2dHeight(140),
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {this.state.applyRefundUrl ? (
            <QRCode size={p2dWidth(175)} value={this.state.applyRefundUrl} />
          ) : null}
        </View>

        <Text
          style={{
            position: 'absolute',
            bottom: p2dHeight(40),
            left: p2dWidth(40),
            color: '#666',
            fontWeight: '500',
            fontSize: p2dWidth(28),
          }}>
          扫码申请退款
        </Text>
      </View>
    );
  }
}

export default fail;

const customStyle = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  productContainer: {
    flexGrow: 1,
    position: 'relative',
    marginTop: p2dHeight(20),
    marginBottom: p2dHeight(160),
    width: '100%',
  },
  failText1: {
    position: 'absolute',
    left: p2dWidth(325),
    top: p2dHeight(150),
    fontSize: p2dWidth(28),
    fontWeight: '600',
    lineHeight: p2dHeight(60),
    letterSpacing: 1,
    color: '#666666',
  },
  failText2: {
    position: 'absolute',
    left: p2dWidth(325),
    top: p2dHeight(192),
    fontSize: p2dWidth(28),
    fontWeight: '600',
    lineHeight: p2dHeight(60),
    letterSpacing: 1,
    color: '#666666',
  },
  failText4: {
    position: 'absolute',
    left: p2dWidth(325),
    top: p2dHeight(234),
    fontSize: p2dWidth(28),
    fontWeight: '600',
    lineHeight: p2dHeight(60),
    letterSpacing: 1,
    color: '#666666',
  },
  failText3: {
    position: 'absolute',
    left: p2dWidth(325),
    top: p2dHeight(276),
    fontSize: p2dWidth(22),
    fontWeight: '600',
    lineHeight: p2dHeight(60),
    letterSpacing: 1,
    color: '#666666',
  },
  productItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: p2dWidth(40),
    marginRight: p2dWidth(40),
    marginBottom: p2dHeight(10),
  },
  productImage: {
    width: p2dWidth(200),
    height: p2dHeight(200),
    flexShrink: 0,
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  productName: {
    fontSize: p2dWidth(28),
    fontWeight: '600',
    color: '#333333',
    lineHeight: p2dWidth(40),
    marginLeft: p2dWidth(20),
  },
  productStatus: {
    fontSize: p2dWidth(28),
    fontWeight: '600',
    color: '#FF5C2A',
    lineHeight: p2dWidth(40),
  },
  confirmBtn: {
    position: 'absolute',
    right: p2dWidth(20),
    bottom: p2dHeight(30),
    height: p2dHeight(100),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: p2dWidth(280),
  },
});
