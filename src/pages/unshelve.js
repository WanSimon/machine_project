import React, {Component} from 'react';

import uuid from 'react-native-uuid';
import {
  Text,
  TextInput,
  Button,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {height, p2dHeight, p2dWidth} from '../js/utils';
import api from '../js/cloudApi';
import {store} from '../store/store';
import {updateMobile, updateSlotNo, upgradeEquipmentInfo} from '../action';
import TopBar from '../components/topbar';
import AwesomeAlert from 'react-native-awesome-alerts';
import CommonAlert from '../components/commonAlert';
class unshelve extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: {},
      num: 0,
      slotNoList: [],
      isNavigation: false,
      showAlert: false,
      showDrugDeleteAlert: false,
      showShortSupplyAlert: false,
      showLockStockShortAlert: false,
    };
  }
  async componentDidMount() {
    console.debug('go to page 【unshelve】');
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    let slotNo = store.getState().slotNo;
    let slotNoList = slotNo.split(',');
    this.setState({
      slotNoList: slotNoList,
    });
    let detail = await api.getEDrugStockDetail({
      equipmentId,
      slotNo,
    });
    if (detail) {
      this.setState({
        info: detail.drugStockInfo,
      });
    }
  }
  async submitUnShelve() {
    let changedCount = parseInt(this.state.num);

    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;

    const adminId = store.getState().adminData.adminId;

    const {
      slotNo,
      type,
      lockStock,
      realStock,
      upperLimit,
      productName,
      batchNumber,
    } = this.state.info;
    let orgProductId = '';

    if (realStock < this.state.num) {
      this.setState({
        showShortSupplyAlert: true,
        num: '',
      });
      return;
    }

    if (realStock - this.state.num < lockStock) {
      this.setState({
        showLockStockShortAlert: true,
        num: '',
      });
      return;
    }

    let productList =
      store.getState().equipmentInfo.equipmentProductInfo.slotProductInfoList;
    productList.forEach((item) => {
      if (item.slotNo === slotNo) {
        orgProductId = item.orgProductInfo.orgProductId;
      }
    });

    let res = await api.updateEStock({
      // ...this.state.info,
      equipmentId,
      requestId: uuid.v4(),
      opAccountId: adminId,
      opType: 1,
      lockProduct: '0',
      result: '1',
      slotProductChgInfoList: [
        {
          slotNo,
          orgProductId,
          batchNumber,
          // orgId: '',
          realStock,
          upperLimit,
          lockStock,
          // count: ,
          changedCount: changedCount,
          opTime: new Date().getTime(),
          errcode: 0,
        },
      ],
    });
    console.info('res', res);
    if (res.status) {
      let slotNo = store.getState().slotNo;
      let detail = await api.getEDrugStockDetail({
        equipmentId,
        slotNo,
      });

      if (changedCount === parseInt(realStock)) {
        let unbind = await api.unbind({
          equipmentId,
          slotNoes: [slotNo],
        });

        if (unbind.status) {
          this.setState({
            showDrugDeleteAlert: true,
          });
        }
      } else {
        this.setState({
          showAlert: true,
        });
      }

      this.setState({
        info: detail.drugStockInfo,
        num: '',
      });
    }
  }

  showDrugDeleteAlert() {
    this.setState({
      showDrugDeleteAlert: true,
    });
  }

  hideDrugDeleteAlert() {
    this.setState({
      showDrugDeleteAlert: false,
    });
  }

  showShortSupplyAlert() {
    this.setState({
      showShortSupplyAlert: true,
    });
  }
  hideShortSupplyAlert() {
    this.setState({
      showShortSupplyAlert: false,
    });
  }

  hideAlert() {
    this.setState({
      showAlert: false,
    });

    this.props.navigation.navigate('repertory');
  }

  showAlert() {
    this.setState({
      showAlert: true,
    });
  }

  componentWillUnmount() {
    console.debug('will leave 【unshelve】');
  }
  render() {
    const {
      slotNo,
      type,
      lockStock,
      realStock,
      upperLimit,
      productName,
      batchNumber,
    } = this.state.info;
    const {
      showAlert,
      showShortSupplyAlert,
      showDrugDeleteAlert,
      showLockStockShortAlert,
    } = this.state;
    return (
      <View style={{height: '100%', display: 'flex'}}>
        <TopBar
          pageName={'下架'}
          hideBack={false}
          disableAdminExit={false}
          disableCount={true}
          navigation={this.props.navigation}></TopBar>
        <View style={{marginTop: p2dHeight(50)}}>
          <Text
            style={{
              fontSize: p2dWidth(50),
              fontWeight: 'bold',
              marginLeft: p2dWidth(60),
            }}>
            | 货道信息
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            height: p2dHeight(100),
            // borderColor: 'yellow',
            // borderWidth: 2,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginLeft: p2dWidth(120),
          }}>
          <Text style={{fontSize: p2dWidth(40), width: p2dWidth(480)}}>
            货道: {this.state.slotNoList[0]}层{this.state.slotNoList[1]}列
          </Text>
          <Text style={{fontSize: p2dWidth(40), width: p2dWidth(400)}}>
            形式: {type === 1 ? '格子柜' : '推板'}
          </Text>
        </View>
        <View>
          <Text
            style={{
              marginLeft: p2dWidth(60),
              marginTop: p2dHeight(80),
              fontSize: p2dWidth(50),
              fontWeight: 'bold',
            }}>
            | 操作
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            height: p2dHeight(600),
            // borderColor: 'green',
            // borderWidth: 2,
            justifyContent: 'space-around',
            marginLeft: p2dWidth(120),
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <Text style={{fontSize: p2dWidth(35), width: p2dWidth(300)}}>
              商品名称:
            </Text>
            <Text style={{fontSize: p2dWidth(35)}}>{productName}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <Text style={{fontSize: p2dWidth(35), width: p2dWidth(300)}}>
              商品批号:
            </Text>
            <Text style={{fontSize: p2dWidth(35)}}>
              {batchNumber ? batchNumber : '无'}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <Text style={{fontSize: p2dWidth(35), width: p2dWidth(300)}}>
              锁定库存:
            </Text>
            <Text style={{fontSize: p2dWidth(35)}}>{lockStock}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <Text style={{fontSize: p2dWidth(35), width: p2dWidth(300)}}>
              实际库存:
            </Text>
            <Text style={{fontSize: p2dWidth(35)}}>{realStock}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <Text style={{fontSize: p2dWidth(35), width: p2dWidth(300)}}>
              最大容量:
            </Text>
            <Text style={{fontSize: p2dWidth(35)}}>{upperLimit}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: p2dWidth(35), width: p2dWidth(300)}}>
              *下架数量
            </Text>
            <TextInput
              style={{
                // position: 'absolute',
                // top: p2dHeight(0),
                // left: p2dWidth(200),
                borderColor: $conf.theme,
                borderWidth: p2dWidth(3),
                width: p2dWidth(100),
                height: p2dHeight(100),
                borderRadius: p2dWidth(10),
                fontSize: p2dWidth(32),
              }}
              keyboardType="numeric"
              onChangeText={(num) => this.setState({num})}></TextInput>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: p2dHeight(100),
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: this.state.num ? $conf.theme : 'grey',
              width: p2dWidth(300),
            }}
            disabled={!this.state.num}
            onPress={() => this.submitUnShelve()}>
            <Text
              style={{
                fontSize: p2dWidth(40),
                lineHeight: p2dHeight(80),
                color: '#FFFFFF',
                textAlign: 'center',
                borderRadius: p2dWidth(65),
              }}>
              保存
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{backgroundColor: 'grey', width: p2dWidth(300)}}
            onPress={() => this.props.navigation.navigate('repertory')}>
            <Text
              style={{
                fontSize: p2dWidth(40),
                lineHeight: p2dHeight(80),
                color: '#FFFFFF',
                textAlign: 'center',
                borderRadius: p2dWidth(65),
              }}>
              取消
            </Text>
          </TouchableOpacity>
        </View>
        <CommonAlert
          confirmText="确定"
          title="成功下架药品"
          navigate={() => this.props.navigation.navigate('repertory')}
          showAlert={showAlert}></CommonAlert>
        <CommonAlert
          confirmText="确定"
          title="该药道信息已经删除"
          navigate={() => this.props.navigation.navigate('repertory')}
          showAlert={showDrugDeleteAlert}></CommonAlert>
        <CommonAlert
          confirmText="确定"
          title="实际库存小于要下架的数量,下架失败"
          showAlert={showShortSupplyAlert}></CommonAlert>
        <CommonAlert
          confirmText="确定"
          showAlert={showLockStockShortAlert}
          title="下架的后会导致实际库存小于锁定库存,下架失败"></CommonAlert>
        {/* <AwesomeAlert
          show={showDrugDeleteAlert}
          showProgress={false}
          title="该药道信息已经删除"
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
            this.hideDrugDeleteAlert();
          }}
        />

        <AwesomeAlert
          show={showShortSupplyAlert}
          showProgress={false}
          title="商品数量小于要下架的数量,下架失败"
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
            this.hideShortSupplyAlert();
          }}
        /> */}
      </View>
    );
  }
}

export default unshelve;
