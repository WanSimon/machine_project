import React, {Component} from 'react';
import TopBar from '../components/topbar';
import {View, Alert, Text, TextInput, TouchableOpacity} from 'react-native';
import {p2dWidth, p2dHeight} from '../js/utils';
import api from '../js/cloudApi';
import {updateAdminData} from '../action';
import {store} from '../store/store';
import AwesomeAlert from 'react-native-awesome-alerts';
import CommonAlert from '../components/commonAlert';
class admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verifyCode: '',
      phone: '',
      selectedOutline: 'none',
      loginOutline: false,
      count: -1,

      showLoginFailAlert: false,
      showIncorrectPhoneAlert: false,
      showFullLoginDataAlert: false,
    };
  }
  componentDidMount() {}

  async getVerificationCode() {
    //获取验证码
    const {phone, count} = this.state;
    if (!phone) {
      // Alert.alert('请输入手机号');
      return;
    }
    if (count > 0) {
      return;
    }
    let res = await api.getVerifyCode({mobile: phone});

    console.info('getVerifyCode', res);
    if (res.verifyCode) {
      this.setState({
        count: 60,
      });
      // Alert.alert('验证码已发送,请注意查收');
    }
    this.timer = setInterval(() => {
      if (this.state.count > 0) {
        this.setState({
          count: this.state.count - 1,
        });
      } else {
        this.setState({count: -2});
        clearInterval(this.timer);
      }
    }, 1000);
  }

  async submitLoginForm() {
    const {verifyCode, phone} = this.state;
    if (!(verifyCode && phone)) {
      this.setState({showFullLoginDataAlert: true});
      // Alert.alert('请输入完整的登陆信息');
      return;
    }

    let phoneReg = /^((\+|00)86)?1\d{10}$/; //正则表达式校验

    let regTest = phoneReg.test(phone);
    if (!regTest) {
      this.setState({
        showIncorrectPhoneAlert: true,
      });
      // Alert.alert('请输入正确格式的手机号');
      return;
    }

    let res = await api.verifyCodeLogin({
      mobile: phone,
      verifyCode,
      appType: 4, //合伙人
      orgId: store.getState().equipmentInfo.equipmentGroupInfo.orgId,
    });

    if (res.token) {
      let action = updateAdminData({
        phone,
        adminId: res.userId,
        token: res.token,
      });
      store.dispatch(action);
      this.props.navigation.navigate('maintain');
    } else {
      this.setState({
        showLoginFailAlert: true,
      });
    }
  }

  showLoginFailAlert() {
    this.setState({
      showLoginFailAlert: true,
    });
  }

  hideLoginFailAlert() {
    this.setState({
      showLoginFailAlert: false,
    });
  }

  showIncorrectPhoneAlert() {
    this.setState({
      showIncorrectPhoneAlert: true,
    });
  }

  hideIncorrectPhoneAlert() {
    this.setState({
      showIncorrectPhoneAlert: false,
    });
  }

  showFullLoginDataAlert() {
    this.setState({
      showFullLoginDataAlert: true,
    });
  }

  hideFullLoginDataAlert() {
    this.setState({
      showFullLoginDataAlert: false,
    });
  }

  render() {
    const {
      verifyCode,
      phone,
      selectedOutline,
      loginOutline,
      showFullLoginDataAlert,
      showIncorrectPhoneAlert,
      showLoginFailAlert,
    } = this.state;
    return (
      <View
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}>
        <CommonAlert
          title="请输入完整的登录信息"
          showAlert={showFullLoginDataAlert}
          confirmText="确定"></CommonAlert>
        <CommonAlert
          title="请输入完整的手机号"
          showAlert={showIncorrectPhoneAlert}
          confirmText="确定"></CommonAlert>
        <CommonAlert
          title="登录失败,检查登录信息无误后再提交"
          confirmText="确定"
          showAlert={showLoginFailAlert}></CommonAlert>

        {/* <AwesomeAlert
          show={showFullLoginDataAlert}
          showProgress={false}
          title="请输入完整的登录信息"
          // message="I have a message for you!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          // cancelText="No, cancel"
          confirmText="确定"
          confirmButtonColor="#DD6B55"
          titleStyle={{
            fontSize: p2dWidth(50),
            // borderWidth: 2,
            // borderColor: 'yellow',
            textAlign: 'center',
            // marginTop: p2dHeight(50),
            height: p2dHeight(100),
            // lineHeight: p2dHeight(400),
          }}
          // alertContainerStyle={{//最大的
          //   backgroundColor: 'red',
          //   color: 'black',
          //   borderColor: 'black',
          //   borderWidth: 2,
          // }}
          overlayStyle={{
            //灰影
            height: '100%',
          }}
          confirmButtonTextStyle={{
            fontSize: p2dWidth(35),
            color: 'white',
            lineHeight: p2dHeight(75),
            textAlign: 'center',
          }}
          confirmButtonStyle={{
            backgroundColor: $conf.theme,
            width: p2dWidth(200),
            height: p2dHeight(90),
            marginTop: p2dHeight(50),
          }}
          contentContainerStyle={{
            // borderColor: 'red',
            // borderWidth: 2,
            marginTop: -p2dHeight(300),
            width: p2dWidth(600),
            height: p2dHeight(300),
          }}
          onConfirmPressed={() => {
            this.hideFullLoginDataAlert();
          }}
        />
        <AwesomeAlert
          show={showIncorrectPhoneAlert}
          showProgress={false}
          title="请输入完整的手机号"
          // message="I have a message for you!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          // cancelText="No, cancel"
          confirmText="确定"
          confirmButtonColor="#DD6B55"
          titleStyle={{
            fontSize: p2dWidth(50),
            // borderWidth: 2,
            // borderColor: 'yellow',
            textAlign: 'center',
            // marginTop: p2dHeight(50),
            height: p2dHeight(100),
            // lineHeight: p2dHeight(400),
          }}
          // alertContainerStyle={{//最大的
          //   backgroundColor: 'red',
          //   color: 'black',
          //   borderColor: 'black',
          //   borderWidth: 2,
          // }}
          overlayStyle={{
            //灰影
            height: '100%',
          }}
          confirmButtonTextStyle={{
            fontSize: p2dWidth(35),
            color: 'white',
            lineHeight: p2dHeight(75),
            textAlign: 'center',
          }}
          confirmButtonStyle={{
            backgroundColor: $conf.theme,
            width: p2dWidth(200),
            height: p2dHeight(90),
            marginTop: p2dHeight(50),
          }}
          contentContainerStyle={{
            // borderColor: 'red',
            // borderWidth: 2,
            marginTop: -p2dHeight(300),
            width: p2dWidth(600),
            height: p2dHeight(300),
          }}
          onConfirmPressed={() => {
            this.hideIncorrectPhoneAlert();
          }}
        />

        <AwesomeAlert
          show={showLoginFailAlert}
          showProgress={false}
          title="登录失败,检查登录信息无误后再提交"
          // message="I have a message for you!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          // cancelText="No, cancel"
          confirmText="确定"
          confirmButtonColor="#DD6B55"
          titleStyle={{
            fontSize: p2dWidth(50),
            // borderWidth: 2,
            // borderColor: 'yellow',
            textAlign: 'center',
            // marginTop: p2dHeight(50),
            height: p2dHeight(100),
            // lineHeight: p2dHeight(400),
          }}
          // alertContainerStyle={{//最大的
          //   backgroundColor: 'red',
          //   color: 'black',
          //   borderColor: 'black',
          //   borderWidth: 2,
          // }}
          overlayStyle={{
            //灰影
            height: '100%',
          }}
          confirmButtonTextStyle={{
            fontSize: p2dWidth(35),
            color: 'white',
            lineHeight: p2dHeight(75),
            textAlign: 'center',
          }}
          confirmButtonStyle={{
            backgroundColor: $conf.theme,
            width: p2dWidth(200),
            height: p2dHeight(90),
            marginTop: p2dHeight(50),
          }}
          contentContainerStyle={{
            // borderColor: 'red',
            // borderWidth: 2,
            marginTop: -p2dHeight(300),
            width: p2dWidth(600),
            height: p2dHeight(300),
          }}
          onConfirmPressed={() => {
            this.hideLoginFailAlert();
          }}
        /> */}

        <TopBar
          pageName="维护模式"
          hideBack={false}
          disableCount={true}
          disableAdminExit={false}
          navigation={this.props.navigation}
        />
        <View style={{marginTop: p2dHeight(50)}}>
          <Text style={{fontSize: p2dWidth(80), textAlign: 'center'}}>
            请登录管理员账号
          </Text>
        </View>
        <View style={{display: 'flex', marginTop: p2dHeight(100)}}>
          <View style={{marginLeft: -p2dWidth(300)}}>
            <Text
              style={{
                fontSize: p2dWidth(50),
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              | 手机号码
            </Text>
          </View>
          <View
            style={{
              borderColor: 'black',
              marginTop: p2dHeight(50),
              marginLeft: p2dWidth(190),
              position: 'relative',
            }}>
            <TextInput
              style={{
                marginLeft: p2dWidth(130),
                borderColor:
                  this.state.selectedOutline === 'phone'
                    ? 'rgba(0,191,206,0.7)'
                    : '#8c8c8c',
                // borderWidth: 2,
                borderBottomWidth: p2dWidth(4),
                // borderRadius: 2,
                letterSpacing: p2dWidth(8),
                fontSize: p2dWidth(32),
                height: p2dHeight(100),
                width: p2dWidth(400),
              }}
              onFocus={() => {
                this.setState({selectedOutline: 'phone'});
              }}
              keyboardType="number-pad"
              multiline={false}
              onChangeText={(val) => {
                this.setState({phone: val});
                if (verifyCode && val) {
                  this.setState({
                    loginOutline: true,
                  });
                }
              }}></TextInput>
            <TouchableOpacity
              style={{
                backgroundColor:
                  this.state.count < 0
                    ? 'rgba(0,191,206,0.7)'
                    : 'rgba(206,208,209,0.7)',
                width: p2dWidth(250),
                height: p2dHeight(70),
                paddingTop: p2dHeight(7),
                paddingVertical: 6,
                borderRadius: 8,
                marginLeft: p2dWidth(50),
                marginTop: p2dHeight(30),
                position: 'absolute',
                top: 0,
                left: p2dWidth(500),
              }}
              disabled={this.state.count <= -1 ? false : true}
              onPress={() => this.getVerificationCode()}>
              <Text
                style={{
                  fontSize: p2dWidth(20),
                  textAlign: 'center',
                  lineHeight: p2dHeight(60),
                  color: this.state.count < 0 ? '#FFFFFF' : '#000000',
                }}>
                {this.state.count === -1
                  ? '获取验证码'
                  : this.state.count > 0
                  ? `${this.state.count}后重新获取`
                  : '重新获取验证码'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            top: p2dHeight(710),
          }}>
          <View style={{marginLeft: p2dWidth(280)}}>
            <Text style={{fontSize: p2dWidth(50), fontWeight: 'bold'}}>
              | 请输入验证码
            </Text>
          </View>
          <View
            style={[
              {
                display: 'flex',
                flexDirection: 'row',
                width: p2dWidth(400),
                marginLeft: p2dWidth(320),
                justifyContent: 'space-between',
                marginTop: p2dHeight(30),
              },
            ]}>
            <TextInput
              style={{
                borderBottomColor:
                  this.state.selectedOutline === 'num'
                    ? 'rgba(0,191,206,0.7)'
                    : '#8c8c8c',
                borderBottomWidth: p2dWidth(4),
                borderStyle: 'solid',
                // borderRadius: 2,
                width: p2dWidth(400),
                height: p2dWidth(100),
                letterSpacing: p2dWidth(12),
                fontSize: p2dWidth(32),
              }}
              // keyboardType="numeric" //弹出键盘类型
              keyboardType="number-pad"
              onFocus={() => {
                this.setState({selectedOutline: 'num'});
              }}
              maxLength={6}
              onChangeText={(val) => {
                this.setState({verifyCode: val});
                if (val && phone) {
                  this.setState({loginOutline: true});
                } else {
                  this.setState({
                    loginOutline: false,
                  });
                }
              }}></TextInput>
          </View>
        </View>

        <View
          style={{
            // borderColor: 'black',
            backgroundColor: !loginOutline ? '#d9d9d9' : 'rgba(0,191,206,0.7)',
            borderRadius: 7,
            // borderStyle: 'solid',
            // borderWidth: 1,
            height: p2dHeight(90),
            position: 'absolute',
            width: p2dWidth(450),
            top: p2dHeight(1100),
            marginLeft: p2dWidth(310),
          }}>
          <TouchableOpacity onPress={() => this.submitLoginForm()}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: p2dWidth(36),
                lineHeight: p2dHeight(97),
                color: '#FFFFFF',
              }}>
              登录
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default admin;
