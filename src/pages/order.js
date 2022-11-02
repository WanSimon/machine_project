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
class order extends Component {
  constructor() {
    super();

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
      Alert.alert('选中就诊人没有关联的医生,请仔细审核');
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
      Alert.alert('关联医生不存在,请重新审核订单信息');
      return;
    }
    if (!patientId) {
      Alert.alert('关联就诊人不存在,请重新审核订单信息');
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
      orderInfo.serialNo = res.serialNo;
      let action = upgradeOrder(orderInfo);
      store.dispatch(action);

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
        <TopBar
          count={this.state.count}
          // count={150}
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
          }}>
          <View>
            <Text style={{fontSize: p2dWidth(50)}}>| 就诊信息</Text>
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
              <Text style={{fontSize: p2dWidth(28)}}>当前登录账号</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(28)}}>{mobile}</Text>
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
              <Text style={{fontSize: p2dWidth(28)}}>选择就诊人</Text>
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
                  borderColor: 'green',
                  borderWidth: 1,
                  borderStyle: 'solid',
                }}
                selectStyle={{
                  height: p2dHeight(80),
                  // paddingTop: p2dHeight(7),
                  textAlign: 'center',
                  borderColor: 'pink',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  color: 'black',
                  // fontColor: 'purple',
                }}
                selectedItemTextStyle={{
                  fontSize: p2dWidth(30),
                }}
                initValueTextStyle={{
                  //已选中就诊人的样式
                  color: 'rgba(0,191,206,0.7)',
                  fontSize: p2dWidth(28),
                  lineHeight: p2dHeight(80),
                }}
                selectTextStyle={{
                  fontSize: p2dWidth(30),
                }}
                cancelText={'确定'}
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
              <Text style={{fontSize: p2dWidth(28)}}>关联医生</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(28)}}>{doctorName}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            marginLeft: p2dWidth(30),
            marginRight: p2dWidth(30),
          }}>
          <Text style={{fontSize: p2dWidth(50)}}>| 已选药品</Text>
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
              borderWidth: 2,
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              backgroundColor: '#fafafa',
              marginTop: p2dHeight(-1),
            }}>
            {drugArr.map((item) => (
              <View
                style={{
                  height: p2dHeight(230),
                  position: 'relative',
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
                    uri: $conf.resource_fdfs + item.homeThumbUrl,
                  }}
                />

                <View
                  style={{
                    width: p2dWidth(400),
                    position: 'absolute',
                    left: p2dWidth(400),
                    top: p2dHeight(40),
                  }}>
                  <Text style={{fontSize: p2dWidth(28)}}>{item.name}</Text>
                  <Text
                    style={{
                      fontSize: p2dWidth(20),
                      position: 'absolute',
                      top: p2dHeight(50),
                      marginLeft: p2dHeight(10),
                    }}>
                    {item.specification}
                  </Text>
                  <Text
                    style={{
                      fontSize: p2dWidth(30),
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
                  <Text style={{fontSize: p2dWidth(32)}}>x{item.num}</Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#d9d9d9',
                    height: p2dHeight(2),
                  }}></View>
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
          <Text style={{fontSize: p2dWidth(50)}}>| 价格明细</Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginLeft: p2dWidth(30),
              marginRight: p2dWidth(30),
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(28)}}>药品总价</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(28)}}>
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
              <Text style={{fontSize: p2dWidth(28)}}>优惠</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(28)}}>￥0</Text>
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
              <Text style={{fontSize: p2dWidth(28)}}>实际价格</Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(28)}}>
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
            <Text style={{marginRight: p2dWidth(50), fontSize: p2dWidth(28)}}>
              共计{totalNumber}件 金额￥{parseCent(totalPrice)}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              borderRadius: p2dWidth(20),
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
                paddingTop: p2dHeight(20),
                fontSize: p2dWidth(36),
                // fontColor: 'white',
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
