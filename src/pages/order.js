import React, {Component} from 'react';
import {
  Text,
  View,
  Alert,
  Image,
  TouchableOpacity,
  NativeModules,
  ScrollView,
} from 'react-native';
import TopBar from '../components/topbar';
import {p2dHeight, p2dWidth, parseCent} from '../js/utils';
import {store} from '../store/store';
import api from '../js/cloudApi';
import {upgradeOrder} from '../action';
import ModalSelector from 'react-native-modal-selector';
import CommonAlert from '../components/commonAlert';

import AwesomeAlert from 'react-native-awesome-alerts';
class order extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalPrice: 0,
      totalNumber: 0,
      //订单内部编码
      tradeNo: '',
      orgId: '',
      textInputValue: '',
      patientId: '',
      name: '',
      doctorName: '',
      doctorId: '',
      formattedPatientList: [],
      drugArr: [],
      mobile: '',
      submitable: true,
      showUnbindDoctor: false,
      showUnbindPatientAlert: false,
    };
  }

  async componentDidMount() {
    console.debug('go to page 【order】');
    console.info(
      store.getState().logged.userId,
      store.getState().logged.mobile,
    );
    let patientList = await api.getPatientMemberInfoList({
      customerId: store.getState().logged.userId,
    });
    const firstPatient = patientList.patientMemberInfoList[0];
    let formattedPatientList = patientList.patientMemberInfoList.map((item) => {
      return {
        key: item.patientId,
        label: item.name,
      };
    });
    this.setState({
      formattedPatientList: [
        ...this.state.formattedPatientList,
        ...formattedPatientList,
      ],
      name: firstPatient.name,
      patientId: firstPatient.patientId,
      mobile: store.getState().logged.mobile,
    });
    console.info(
      'firstPatient-------',
      firstPatient.patientId,
      '-------------',
      'orgId',
      '--------------',
      store.getState().equipmentInfo.equipmentGroupInfo.orgId,
      'mobile',
      store.getState().logged.mobile,
    );
    console.info('----------didMount------', firstPatient.patientId);
    let doctor = await api.getPatientRelateDoctorList({
      patientId: firstPatient.patientId,
      orgId: store.getState().equipmentInfo.equipmentGroupInfo.orgId,
    });
    if (doctor.doctorInfoList.length) {
      console.info('doctor.doctorInfoList--------------------', doctor);
      let relatedDoctor = doctor.doctorInfoList[0];
      this.setState({
        doctorId: relatedDoctor.doctorId,
        doctorName: relatedDoctor.name,
      });
      console.info(
        'componentDidMounted-formattedPPatientList-------',
        formattedPatientList,
      );
    } else {
      // Alert.alert('选中就诊人没有关联的医生,请仔细审核');
      this.setState({
        showUnbindDoctor: true,
      });
    }

    let cart = store.getState().cart;
    let orderInfo = store.getState().orderInfo;
    console.info('order-------cart', cart);
    this.setState({
      tradeNo: orderInfo.innerOrderNo,
      orderId: orderInfo.orderId,
      totalPrice: cart.totalPrice,
    });

    console.info('order---page----cart', cart.cartList);
    cartListObj = cart.cartList;
    let drugList = [];
    let totalNumber = 0;
    for (let key in cartListObj) {
      if (cartListObj[key].num > 0) {
        drugList.push({
          orgProductId: key,
          ...cartListObj[key],
        });
        totalNumber = totalNumber + cartListObj[key].num;
      }
    }
    console.info('---------drugList', drugList);
    this.setState({drugArr: [...drugList], totalNumber});
    console.info('order page get reducex orderInfo = %o', orderInfo);
    NativeModules.RaioApi.debug(
      {
        msg: `order page get reducex orderInfo = ${JSON.stringify(orderInfo)}`,
        method: 'order.componentDidMount',
      },
      null,
    );
    ///

    let action = upgradeOrder(orderInfo);
    store.dispatch(action);

    console.info(
      'formatted----formattedPatientList',
      this.state.formattedPatientList,
    );
    console.log('------orderInfo------', orderInfo);
  }

  async submitOrder() {
    this.setState({submitable: false});
    const {doctorId, patientId} = this.state;
    if (!doctorId) {
      // Alert.alert('关联医生不存在,请重新审核订单信息');

      this.setState({
        showUnbindDoctor: true,
        submitable: true,
      });

      return;
    }
    if (!patientId) {
      // Alert.alert('关联就诊人不存在,请重新审核订单信息');
      this.setState({
        showUnbindPatientAlert: true,
        submitable: true,
      });
      return;
    }
    let orderInfo = store.getState().orderInfo;
    orderInfo.doctorId = this.state.doctorId;
    orderInfo.patientId = this.state.patientId;
    orderInfo.orgId = store.getState().equipmentInfo.equipmentGroupInfo.orgId;
    orderInfo.amount = store.getState().cart.totalPrice;
    orderInfo.payType = 1;
    orderInfo.equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    NativeModules.RaioApi.debug(
      {msg: 'order page submitOrder start', method: 'order.submitOrder'},
      null,
    );
    try {
      let res = await api.submitEOrder(orderInfo);
      orderInfo.serialNo = res.orderInfo.serialNo;
      console.info('serialNo----==================', res.orderInfo.serialNo);
      let action = upgradeOrder(orderInfo);
      store.dispatch(action);
      this.setState({submitable: true});
      NativeModules.RaioApi.debug(
        {
          msg: `order page submitOrder success, ${JSON.stringify(res)}`,
          method: 'order.submitOrder',
        },
        null,
      );
    } catch (e) {
      console.error(e);
      NativeModules.RaioApi.debug(
        {
          msg: `order page submitOrder fail, ${e.message}`,
          method: 'order.submitOrder',
        },
        null,
      );
    }
    NativeModules.RaioApi.debug(
      {msg: 'order page submitOrder end', method: 'order.submitOrder'},
      null,
    );
    this.props.navigation.navigate('pay');
  }

  async getPatientRelateDoctor(patientId) {
    console.info('---------deubg----get---------', patientId);
    let doctor = await api.getPatientRelateDoctorList({
      patientId: patientId,
      orgId: store.getState().equipmentInfo.equipmentGroupInfo.orgId,
    });

    if (doctor.doctorInfoList.length === 0) {
      this.setState({
        doctorId: '',
        doctorName: '',
      });
    }
    console.info('doctor---getPatientRelatedDoctor', doctor);
    let doctorDetail = doctor.doctorInfoList[0];

    this.setState({
      doctorId: doctorDetail.doctorId,
      doctorName: doctorDetail.name,
    });
  }

  hideUnbindDoctor() {
    this.setState({
      showUnbindDoctor: false,
    });
  }

  hideUnbindPatientAlert() {
    this.setState({
      showUnbindPatientAlert: false,
    });
  }

  componentWillUnmount() {
    console.debug('destroy page 【 order 】');
  }

  render() {
    const {
      drugArr,
      name,
      mobile,
      formattedPatientList,
      doctorName,
      doctorId,
      totalNumber,
      totalPrice,
      patientId,
      showUnbindDoctor,
      showUnbindPatientAlert,
    } = this.state;
    return (
      <View
        style={[
          {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
          },
        ]}>
        {/* <CommonAlert
          showAlert={showUnbindDoctor}
          title="关联医生不存在,请重新审核订单信息"
          confirmText="确定"></CommonAlert>
        <CommonAlert
          showAlert={showUnbindDoctor1}
          title="关联医生不存在,请重新审核订单信息"
          confirmText="确定"></CommonAlert>
        <CommonAlert
          showAlert={showUnbindPatientAlert}
          title="关联就诊人不存在,请重新审核订单信息"
          confirmText="确定"></CommonAlert>
        <CommonAlert
          showAlert={showUnbindPatientAlert1}
          title="关联就诊人不存在,请重新审核订单信息"
          confirmText="确定"></CommonAlert> */}

        <AwesomeAlert
          show={showUnbindPatientAlert}
          showProgress={false}
          title="关联就诊人不存在,请重新审核订单信息"
          // message="I have a message for you!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          // cancelText="No, cancel"
          confirmText="确定"
          confirmButtonColor="#DD6B55"
          titleStyle={{
            fontSize: p2dWidth(35),
            // borderWidth: 2,
            // borderColor: 'yellow',
            textAlign: 'center',
            // marginTop: p2dHeight(50),
            marginTop: p2dHeight(20),
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
            fontSize: p2dWidth(30),
            color: 'white',
            lineHeight: p2dHeight(55),
            textAlign: 'center',
          }}
          confirmButtonStyle={{
            backgroundColor: $conf.theme,
            width: p2dWidth(120),
            height: p2dHeight(60),
            marginTop: p2dHeight(50),
          }}
          contentContainerStyle={{
            // borderColor: 'red',
            // borderWidth: 2,
            marginTop: -p2dHeight(300),
            width: p2dWidth(500),
            height: p2dHeight(300),
          }}
          onConfirmPressed={() => {
            this.hideUnbindPatientAlert();
          }}
        />
        <AwesomeAlert
          show={showUnbindDoctor}
          showProgress={false}
          title="关联医生不存在,请重新审核订单信息"
          // message="I have a message for you!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          // cancelText="No, cancel"
          confirmText="确定"
          confirmButtonColor="#DD6B55"
          titleStyle={{
            fontSize: p2dWidth(35),
            // borderWidth: 2,
            // borderColor: 'yellow',
            textAlign: 'center',
            // marginTop: p2dHeight(50),
            marginTop: p2dHeight(20),
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
            fontSize: p2dWidth(30),
            color: 'white',
            lineHeight: p2dHeight(55),
            textAlign: 'center',
          }}
          confirmButtonStyle={{
            backgroundColor: $conf.theme,
            width: p2dWidth(120),
            height: p2dHeight(60),
            marginTop: p2dHeight(50),
          }}
          contentContainerStyle={{
            // borderColor: 'red',
            // borderWidth: 2,
            marginTop: -p2dHeight(300),
            width: p2dWidth(500),
            height: p2dHeight(300),
          }}
          onConfirmPressed={() => {
            this.hideUnbindDoctor();
          }}
        />

        <TopBar
          // count={this.state.count}
          count={150}
          pageName="确认订单信息"
          hideBack={true}
          navigation={this.props.navigation}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: p2dWidth(30),
            marginRight: p2dWidth(30),
            marginTop: p2dHeight(30),
            height: p2dHeight(400),
            justifyContent: 'space-around',
            position: 'relative',
          }}>
          <View>
            <Text style={{fontSize: p2dWidth(50), fontWeight: 'bold'}}>
              | 就诊信息
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>当前登录账号</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>{mobile}</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: p2dHeight(-10),
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>选择就诊人</Text>
            </View>
            <View
              style={{
                width: p2dWidth(200),
                marginTop: p2dHeight(-30),
                height: p2dHeight(80),
              }}>
              <ModalSelector
                data={formattedPatientList}
                selectedKey={patientId}
                initValue={name}
                style={{
                  height: p2dHeight(80),
                  textAlign: 'center',
                  // borderColor: 'green',

                  // borderStyle: 'solid',
                }}
                selectStyle={{
                  height: p2dHeight(80),
                  // paddingTop: p2dHeight(7),
                  textAlign: 'center',

                  borderRadius: p2dWidth(65),

                  // borderColor: 'purple',
                  // borderWidth: 2,
                  // borderStyle: 'solid',
                  // fontColor: 'purple',
                }}
                selectedItemTextStyle={{
                  fontSize: p2dWidth(40),
                  fontColor: 'white',
                }}
                optionContainerStyle={{
                  // borderWidth: 2,
                  // backgroundColor: 'green',
                  // borderColor: 'red',
                  // height: p2dHeight(130),
                  // lineHeight: p2dHeight(130),
                  width: p2dWidth(500),
                  marginLeft: '25%',
                }}
                initValueTextStyle={{
                  //已选中就诊人的样式
                  color: 'rgba(0,191,206,0.7)',
                  fontSize: p2dWidth(30),
                  lineHeight: p2dHeight(63),
                }}
                selectTextStyle={{
                  fontSize: p2dWidth(30),
                }}
                cancelText={'确定'}
                cancelContainerStyle={{width: p2dWidth(500), marginLeft: '25%'}}
                cancelTextStyle={{fontSize: p2dWidth(30)}}
                optionTextStyle={{fontSize: p2dWidth(30)}}
                onChange={(option) => {
                  this.setState({patientId: option.key, name: option.label});
                  this.getPatientRelateDoctor(option.key);
                }}
              />
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
              marginTop: p2dHeight(-30),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>关联医生</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>{doctorName}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            marginLeft: p2dWidth(30),
            marginRight: p2dWidth(30),
          }}>
          <Text style={{fontSize: p2dWidth(50), fontWeight: 'bold'}}>
            | 已选药品
          </Text>
          {/* 当药品超过三个的时候显示向下滑动查看全部药品 */}
        </View>
        <View
          style={{
            marginLeft: p2dWidth(30),
            marginRight: p2dWidth(30),
            flexGrow: 1,
            marginTop: p2dHeight(40),
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: p2dHeight(680),
          }}>
          <ScrollView
            style={{
              marginTop: p2dHeight(30),
              borderRadius: p2dWidth(20),
              borderColor: '#d9d9d9',

              // borderColor: 'yellow',
              borderWidth: 2,
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              backgroundColor: '#fafafa',
              // backgroundColor: 'green',
              marginTop: p2dHeight(-1),
            }}>
            {drugArr.map((item) => (
              <View
                style={{
                  height: p2dHeight(230),
                  position: 'relative',
                  borderBottomColor: '#d9d9d9',
                  borderBottomWidth: p2dHeight(2),
                  borderBottomStyle: 'solid',
                }}
                key={item.orgProductId}>
                <Image
                  style={{
                    width: p2dWidth(160),
                    height: p2dWidth(160),
                    position: 'absolute',
                    top: p2dWidth(40),
                    left: p2dHeight(60),
                  }}
                  source={{
                    uri: $conf.resource_oss + item.homeThumbUrl,
                  }}
                />

                <View
                  style={{
                    width: p2dWidth(400),
                    position: 'absolute',
                    left: p2dWidth(400),
                    top: p2dHeight(40),
                  }}>
                  <Text style={{fontSize: p2dWidth(33)}}>{item.name}</Text>
                  <Text
                    style={{
                      fontSize: p2dWidth(28),
                      position: 'absolute',
                      top: p2dHeight(53),
                      marginLeft: p2dHeight(10),
                    }}>
                    {item.specification}
                  </Text>
                  <Text
                    style={{
                      fontSize: p2dWidth(33),
                      color: 'red',
                      position: 'absolute',
                      top: p2dHeight(100),
                    }}>
                    ￥{parseCent(item.price)}
                  </Text>
                </View>
                <View
                  style={{
                    position: 'absolute',
                    top: p2dHeight(70),
                    left: p2dWidth(800),
                  }}>
                  <Text style={{fontSize: p2dWidth(35)}}>x{item.num}</Text>
                </View>
                {/* <View
                  style={{
                    backgroundColor: '#d9d9d9',
                    height: p2dHeight(2),
                  }}></View> */}
              </View>
            ))}
          </ScrollView>
        </View>
        <View
          style={{
            display: 'flex',
            height: p2dHeight(350),
            justifyContent: 'space-around',
            marginLeft: p2dWidth(30),
            marginRight: p2dWidth(30),
          }}>
          <Text style={{fontSize: p2dWidth(50), fontWeight: 'bold'}}>
            | 价格明细
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>药品总价</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>
                ￥{parseCent(totalPrice)}
              </Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',

              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>优惠</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>￥0</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>实际价格</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(33)}}>
                ￥{parseCent(totalPrice)}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'row',
            marginLeft: p2dWidth(30),
            marginRight: p2dWidth(30),
            marginBottom: p2dHeight(40),
          }}>
          <View style={{paddingTop: p2dHeight(20)}}>
            <Text style={{marginRight: p2dWidth(50), fontSize: p2dWidth(33)}}>
              共计{totalNumber}件 金额￥{parseCent(totalPrice)}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              borderRadius: p2dWidth(65),
              backgroundColor: 'rgba(0,191,206,0.7)',
              width: p2dWidth(300),
              height: p2dHeight(90),
              marginRight: p2dWidth(30),
            }}
            disabled={!this.state.submitable}
            onPress={() => this.submitOrder()}>
            <Text
              style={{
                textAlign: 'center',
                paddingTop: p2dHeight(22),
                fontSize: p2dWidth(36),
                color: '#FFFFFF',
              }}>
              提交订单
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default order;
