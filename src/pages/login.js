import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {p2dHeight, p2dWidth} from '../js/utils';
import api from '../js/cloudApi';
import {updateLogged, updateSceneStr} from '../action';
import {store} from '../store/store';
import TopBar from '../components/topbar';
import Conf from '../js/conf';
class login extends Component {
  constructor(props) {
    super(props);
    this.firstCodeRef = React.createRef();
    this.secondCodeRef = React.createRef();
    this.thirdCodeRef = React.createRef();
    this.forthCodeRef = React.createRef();

    this.state = {
      url: '',
      loginMode: 'num',
      mobile: '',
      verifyCode: '',
      count: -1,
      firstCode: '',
      secondCode: '',
      thirdCode: '',
      forthCode: '',
      // hasSubmitted: false,
      codeStatus: 'first', //用来标志是不是首次进入页面
      selectedOutline: 0, //1代表手机号输入框,2代表验证码输入框,0代表输入框没有获得焦点，标注获得焦点的输入框
      loginOutline: false,
      weixinCodeUrl: '',
      ticket: '',
      sceneStr: '',
      orgId: '',
    };
  }

  async componentDidMount() {
    const orgId = store.getState().equipmentInfo.equipmentGroupInfo.orgId;
    console.info('orgId-------', orgId);
    let res = await api.getQrCode(orgId);
    console.log('login', orgId, res.qrCodeInfo.sceneStr);
    drugChannel = JSON.parse(
      store.getState().equipmentInfo.equipmentTypeInfo.drugChannel,
    );
    this.setState({
      ticket: res.qrCodeInfo.ticket,
      sceneStr: res.qrCodeInfo.sceneStr,
      orgId: orgId,
    });
    this.setState({weixinCodeUrl: Conf.weixinUrl + res.qrCodeInfo.ticket});

    const action = updateSceneStr(res.qrCodeInfo.sceneStr);
    store.dispatch(action);
  }

  async checkLogin() {
    this.checkTimer = setInterval(() => {
      api
        .checkQrLogin({
          sceneStr: this.state.sceneStr,
          orgId: this.state.orgId,
        })
        .then((res) => {
          console.info('CheckLogin-----------------++++', res);
          let statusCode = res.qrLoginInfo.errorCode;
          switch (statusCode) {
            case '10003':
              Alert.alert('请重新扫码');
              break;
            case '10004':
              Alert.alert('您还没有注册,注册后才能登录');
              break;
            case '10005':
              Alert.alert('您还没有和医生绑定，绑定后才能登陆');
              break;
            case '10010':
              {
                let action = updateLogged({
                  mobile: res.qrLoginInfo.customerInfo.phone,
                  userId: res.qrLoginInfo.customerInfo.customerId,
                });
                store.dispatch(action);
                clearInterval(this.checkTimer);
                this.props.navigation.navigate('order');
              }
              break;
            default:
              break;
          }
        });
    }, 5000);
  }

  switchLoginMode(val) {
    this.setState({loginMode: val});
  }

  async submitLoginForm() {
    const {verifyCode, mobile} = this.state;
    if (!(verifyCode && mobile)) {
      Alert.alert('请输入完整的登录信息');
      return;
    }
    let phoneReg = /^((\+|00)86)?1\d{10}$/; //正则表达式校验

    let regTest = phoneReg.test(mobile);
    if (!regTest) {
      Alert.alert('请输入正确格式的手机号');
      return;
    }

    let res = await api.verifyCodeLogin({
      // mobile: '18151787126',
      // mobile: '17316222495',
      mobile,
      verifyCode,
      appType: 1,
      orgId: store.getState().equipmentInfo.equipmentGroupInfo.orgId,
    });

    console.log('resverfycodelogin', mobile, 'verifyCode', verifyCode, res);
    if (res.token) {
      console.log('verifyCodeLogin--------', res);

      let action = updateLogged({
        mobile,
        userId: res.userId,
      });
      store.dispatch(action);
      clearInterval(this.checkTimer);
      this.props.navigation.navigate('order');
    }
  }

  async getVerificationCode() {
    //获取验证码
    const {mobile, count} = this.state;
    if (!mobile) {
      Alert.alert('请输入完整的手机号');
      return;
    }
    if (count > 0) {
      return;
    }
    let res = await api.getVerifyCode({mobile});

    console.info('getVerifyCode', res);
    if (res.verifyCode) {
      this.setState({
        count: 60,
      });
      Alert.alert('验证码已发送,请注意查收');
    } else {
      Alert.alert('验证码发送失败,请重新获取验证码');
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

  componentWillUnmount() {
    console.info('destroy page 【 login 】');
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }
  render() {
    const {verifyCode, mobile, loginOutline, loginMode} = this.state;
    return (
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <TopBar
          hideBack={false}
          pageName="用户登录"
          navigation={this.props.navigation}
        />
        <View
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(0, 0, 0)',
            position: 'relative',
          }}>
          <Text
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
              fontWeight: '400',
              color: '#333333',
              fontSize: p2dWidth(80),
              top: p2dHeight(100),
            }}>
            请先登录
          </Text>
          <View
            style={[
              {
                marginTop: p2dHeight(300),
                flexDirection: 'row',
                display: 'flex',
                justifyContent: 'center',
              },
            ]}>
            <TouchableOpacity
              style={{
                borderColor: 'rgba(206,208,209,0.7)',
                borderWidth: 1,
                borderStyle: 'solid',
                width: p2dWidth(400),
                height: p2dHeight(100),
                backgroundColor:
                  loginMode === 'code' ? 'rgba(0,191,206,0.7)' : '#fff',
              }}
              onPress={() => {
                this.switchLoginMode('code'), this.checkLogin();
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: p2dWidth(36),
                  lineHeight: p2dHeight(100),
                }}>
                微信扫码登录
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderColor: 'rgba(206,208,209,0.7)',
                borderWidth: 1,
                borderStyle: 'solid',
                height: p2dHeight(100),
                width: p2dWidth(400),
                borderLeftWidth: 0,

                backgroundColor:
                  loginMode === 'num' ? 'rgba(0,191,206,0.7)' : '#fff',
              }}
              onPress={() => this.switchLoginMode('num')}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: p2dWidth(36),
                  lineHeight: p2dHeight(100),
                }}>
                验证码登录
              </Text>
            </TouchableOpacity>
          </View>
          {this.state.loginMode === 'code' ? (
            <View
              style={{
                width: '100%',
                // backgroundColor: '#fff',
                flexGrow: 1,
                borderRadius: p2dWidth(40),
              }}>
              <Image
                source={{
                  uri: this.state.weixinCodeUrl,
                }}
                style={{
                  marginTop: p2dHeight(250),
                  width: p2dWidth(450),
                  height: p2dWidth(450),
                  marginLeft: p2dWidth(320),
                }}></Image>
            </View>
          ) : (
            <View
              style={{
                width: '100%',
                borderRadius: p2dWidth(40),
                flexDirection: 'column',
                position: 'relative',
                flexGrow: 1,
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  position: 'relative',
                  top: p2dHeight(70),
                }}>
                <View style={{marginLeft: p2dWidth(280)}}>
                  <Text style={{fontSize: p2dWidth(50), fontWeight: 'bold'}}>
                    | 手机号
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginLeft: p2dWidth(320),
                    marginTop: p2dWidth(30),
                  }}>
                  <TextInput
                    style={[
                      {
                        borderColor:
                          this.state.selectedOutline === 1
                            ? 'rgba(0,191,206,0.7)'
                            : '#8c8c8c',
                        // borderWidth: 2,
                        borderBottomWidth: 2,
                        // borderRadius: 2,
                        letterSpacing: p2dWidth(8),
                        paddingLeft: p2dWidth(15),
                        borderStyle: 'solid',
                        height: p2dHeight(100),
                        width: p2dWidth(400),
                        fontSize: p2dWidth(32),
                      },
                    ]}
                    onFocus={() => {
                      this.setState({selectedOutline: 1});
                    }}
                    autoComplete="tel" //详情见文档
                    clearTextOnFocus={true}
                    // keyboardType="numeric" //弹出键盘类型

                    keyboardType="number-pad"
                    onChangeText={(val) => {
                      this.setState({mobile: val});
                      if (verifyCode && val) {
                        this.setState({loginOutline: true});
                      } else {
                        this.setState({
                          loginOutline: false,
                        });
                      }
                    }}
                    multiline={false}></TextInput>
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
                      marginTop: p2dHeight(10),
                    }}
                    disabled={this.state.count <= -1 ? false : true}
                    onPress={() => this.getVerificationCode()}>
                    <Text
                      style={{
                        fontSize: p2dWidth(20),
                        textAlign: 'center',
                        lineHeight: p2dHeight(60),
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
                  top: p2dHeight(340),
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
                        this.state.selectedOutline === 2
                          ? 'rgba(0,191,206,0.7)'
                          : '#8c8c8c',
                      borderBottomWidth: 2,
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
                      this.setState({selectedOutline: 2});
                    }}
                    maxLength={6}
                    onChangeText={(val) => {
                      this.setState({verifyCode: val});
                      if (val && mobile) {
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
                  backgroundColor: !loginOutline
                    ? '#d9d9d9'
                    : 'rgba(0,191,206,0.7)',
                  borderRadius: 7,
                  // borderStyle: 'solid',
                  // borderWidth: 1,
                  height: p2dHeight(90),
                  position: 'absolute',
                  width: p2dWidth(450),
                  top: p2dHeight(680),
                  marginLeft: p2dWidth(310),
                }}>
                <TouchableOpacity
                  style={{}}
                  onPress={() => this.submitLoginForm()}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: p2dWidth(36),
                      lineHeight: p2dHeight(93),
                    }}>
                    登录
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
}

export default login;
