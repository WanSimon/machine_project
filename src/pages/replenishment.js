import React, {Component} from 'react';
import {View, Text, TouchableOpacity, TextInput, Alert} from 'react-native';
import TopBar from '../components/topbar';
import {p2dWidth, p2dHeight} from '../js/utils';
import {store} from '../store/store';
import api from '../js/cloudApi';

import AwesomeAlert from 'react-native-awesome-alerts';
import uuid from 'react-native-uuid';
import ModalSelector from 'react-native-modal-selector';
import {updateUserId} from '../action';
import CommonAlert from '../components/commonAlert';
class replenishment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slotNoList: [],
      info: {},
      batchNumber: '',
      lockStock: '',
      changedCount: '',
      upperLimit: '',
      flag: 'new',
      productList: {},
      formattedProductList: [],
      selectedName: '',
      selectedId: '',
      batchNumberList: [],
      orgId: '',
      showOverageAlert: false,
      showAddOldDrugAlert: false,
      showAddNewDrugAlert: false,
      showContradictAlert: false,
      contradictAlertTitle: '',
      showContradictAlert1: false,
      showContradictAlert2: false,
      showContradictAlert3: false,
      showContradictAlert4: false,
      showContradictAlert5: false,
    };
  }

  async componentDidMount() {
    console.debug(
      'go to page 【replenishment】',
      this.props.navigation.history,
    );
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

    console.info('-----detail replenishment------', detail);

    if (detail.drugStockInfo !== null) {
      this.setState({
        info: detail.drugStockInfo,
        upperLimit: detail.drugStockInfo.upperLimit,
        batchNumber: detail.drugStockInfo.batchNumber,
        lockStock: detail.drugStockInfo.lockStock,

        flag: 'old',
      });
      console.info(
        '---replenishment page----',
        detail.drugStockInfo.upperLimit,
        detail.drugStockInfo.batchNumber,
        detail.drugStockInfo.lockStock,
      );
    } else {
      this.setState({flag: 'new'});
      let productList = await api.getProductInfoByEquipmentId({equipmentId});
      console.info('--------- productList replenishment -------', productList);

      let orgId = productList.productInfo[0].orgId;

      this.setState({orgId});

      let formattedProductList = productList.productInfo.map((item) => {
        return {
          key: item.productInfo.productId,
          label: item.productInfo.name,
        };
      });

      let batchNumberList = productList.productInfo.map((item) => {
        return {
          key: item.productInfo.productId,
          label: item.productInfo.name,
          batchNumber: item.batchNumber,
          orgProductId: item.orgProductId,
        };
      });
      this.setState({formattedProductList, batchNumberList});
    }
    console.info(
      '数据初始化-------',
      detail.drugStockInfo.upperLimit,
      detail.drugStockInfo.batchNumber,
      detail.drugStockInfo.lockStock,
    );
  }

  async updateEStock() {
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    console.info('button');
    console.info('this.state.flag', this.state.flag);
    const {
      batchNumber,
      lockStock,
      changedCount,
      upperLimit,
      slotNoList,
      selectedId,
      orgId,
      batchNumberList,
    } = this.state;
    let adminId = store.getState().adminData.adminId;
    let slotNo = slotNoList.join(',');
    if (this.state.flag === 'new') {
      console.info('flag---', this.state.flag);
      //Alert
      let thisProduct = batchNumberList.find((item) => {
        if (item.key === selectedId) {
          return true;
        }
        return false;
      });

      let upper = parseInt(upperLimit);
      let changed = parseInt(this.state.changedCount);
      let lock = parseInt(lockStock);

      if (upper < changed) {
        this.setState({
          showContradictAlert1: true,
          // contradictAlertTitle: '上架的数量大于最大容量,上架失败',
          upperLimit: '',
          changedCount: '',
        });
        return;
      }
      if (upper < lock) {
        this.setState({
          showContradictAlert2: true,
          // contradictAlertTitle: '上架的最大数量小于锁定库存,上架失败',
          upperLimit: '',
          lockStock: '',
        });
        return;
      }
      if (changed < lock) {
        this.setState({
          showContradictAlert3: true,
          // contradictAlertTitle: '上架的数量小于锁定库存,上架失败',
          changedCount: '',
          lockStock: '',
        });
        return;
      }

      //药道无药品，添加新的药品
      let saveProduct = await api.saveEquipmentProduct({
        equipmentId,
        lockStock: parseInt(lockStock),
        modifiedId: adminId,
        opAccountId: adminId,
        orgId,
        orgProductId: thisProduct.orgProductId,
        realStock: parseInt(this.state.changedCount),
        slotNo,
        upperLimit: parseInt(upperLimit),
      });
      if (saveProduct.equipmentProductId) {
        this.setState({
          showAddNewDrugAlert: true,
        });
      }
      console.info('saveEquipmentProduct----replenishment----', saveProduct);
    } else {
      //药道有药品，给药道补充药品
      let real = parseInt(this.state.info.realStock);
      let changed = parseInt(changedCount);
      let upper = parseInt(upperLimit);
      let lock = parseInt(lockStock);

      if (upper < lock) {
        this.setState({
          showContradictAlert2: true,
        });
        return;
      }

      if (real + changed < lock) {
        this.setState({
          showContradictAlert4: true,
        });
        return;
      }

      if (upper < real + changed) {
        this.setState({
          showContradictAlert5: true,
        });
        return;
      }

      let res = await api
        .updateEStock({
          opType: 0,
          equipmentId,
          lockProduct: 0,
          result: 1,
          opAccountId: adminId,
          requestId: uuid.v4(),
          slotProductChgInfoList: [
            {
              slotNo: slotNo,
              orgProductId: this.state.info.orgProductId,
              changedCount: changed,
              realStock: real,
              lockStock: lock,
              opTime: 1,
              errcode: 0,
              upperLimit: upper,
              batchNumber,
            },
          ],
        })
        .then((res) => {
          if (res.status) {
            this.setState({
              showAddOldDrugAlert: true,
            });
          }
        });
    }
  }

  showAddNewDrugAlert() {
    this.setState({
      showAddNewDrugAlert: true,
    });
  }

  hideAddNewDrugAlert() {
    this.setState({
      showAddNewDrugAlert: false,
    });

    this.props.navigation.navigate('repertory');
  }

  showAddOldDrugAlert() {
    this.setState({
      showAddOldDrugAlert: true,
    });
  }

  hideAddOldDrugAlert() {
    this.setState({
      showAddNewDrugAlert: false,
    });

    this.props.navigation.navigate('repertory');
  }

  showOverageAlert() {
    this.setState({
      showOverageAlert: true,
    });
  }

  hideOverageAlert() {
    this.setState({
      showOverageAlert: false,
    });
  }

  hideContradictAlert1() {
    this.setState({
      showContradictAlert1: false,
    });
  }

  hideContradictAlert2() {
    this.setState({
      showContradictAlert2: false,
    });
  }

  hideContradictAlert3() {
    this.setState({
      showContradictAlert3: false,
    });
  }
  hideContradictAlert4() {
    this.setState({
      showContradictAlert4: false,
    });
  }

  hideContradictAlert5() {
    this.setState({
      showContradictAlert5: false,
    });
  }

  render() {
    const {type, productName, realStock} = this.state.info;
    const {
      slotNoList,
      batchNumber,
      lockStock,
      changedCount,
      upperLimit,
      showAddNewDrugAlert,
      showAddOldDrugAlert,
      showOverageAlert,
      showContradictAlert,
      showContradictAlert1,
      showContradictAlert2,
      showContradictAlert3,
      showContradictAlert4,
      showContradictAlert5,
    } = this.state;
    return (
      <View style={{display: 'flex', justifyContent: 'space-around'}}>
        <TopBar
          pageName="补货"
          hideBack={false}
          disableCount={true}
          disableAdminExit={false}
          navigation={this.props.navigation}></TopBar>
        <View
          style={{
            display: 'flex',
            height: p2dHeight(1200),
          }}>
          <View style={{marginLeft: p2dWidth(80), marginTop: p2dHeight(70)}}>
            <Text style={{fontSize: p2dWidth(50)}}>| 货道信息</Text>
          </View>
          <CommonAlert
            title="商品补货成功"
            showAlert={showAddOldDrugAlert}
            confirmText="确定"
            navigate={() =>
              this.props.navigation.navigate('repertory')
            }></CommonAlert>
          <CommonAlert
            title="成功上架新商品"
            showAlert={showAddNewDrugAlert}
            confirmText="确定"
            navigate={() =>
              this.props.navigation.navigate('repertory')
            }></CommonAlert>
          <CommonAlert
            title="上架药品超过药道最大值"
            showAlert={showOverageAlert}
            confirmText="确定"></CommonAlert>

          {/* <CommonAlert
            title={this.state.contradictAlertTitle}
            showAlert={showContradictAlert}
            confirmText="确定"></CommonAlert> */}

          <AwesomeAlert
            show={showContradictAlert1}
            showProgress={false}
            title="上架的数量大于最大容量,上架失败"
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
              this.hideContradictAlert1();
            }}
          />

          <AwesomeAlert
            show={showContradictAlert2}
            showProgress={false}
            title="上架的最大数量小于锁定库存,上架失败"
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
              this.hideContradictAlert2();
            }}
          />

          <AwesomeAlert
            show={showContradictAlert3}
            showProgress={false}
            title="上架的数量小于锁定库存,上架失败"
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
              this.hideContradictAlert3();
            }}
          />

          <AwesomeAlert
            show={showContradictAlert4}
            showProgress={false}
            title="锁定库存大于实际库存和上架商品数量之和，上架失败"
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
              this.hideContradictAlert4();
            }}
          />

          <AwesomeAlert
            show={showContradictAlert5}
            showProgress={false}
            title="最大容量小于实际库存和上架商品数量之和，上架失败"
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
              this.hideContradictAlert5();
            }}
          />

          {/* <AwesomeAlert
            show={showAddOldDrugAlert}
            showProgress={false}
            title="商品补货成功"
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
              this.hideAddOldDrugAlert();
            }}
          />
          <AwesomeAlert
            show={showAddNewDrugAlert}
            showProgress={false}
            title="成功上架新药品"
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
              this.hideAddNewDrugAlert();
            }}
          />
          <AwesomeAlert
            show={showOverageAlert}
            showProgress={false}
            title="上架药品数量超过药道最大值"
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
              this.hideOverageAlert();
            }}
          /> */}

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              marginLeft: p2dWidth(80),
              marginTop: p2dHeight(70),
            }}>
            <View style={{marginLeft: p2dWidth(40), width: p2dWidth(420)}}>
              <Text style={{fontSize: p2dWidth(35)}}>
                货道:{slotNoList[0]}层{slotNoList[1]}列
              </Text>
            </View>
            <View style={{marginLeft: p2dWidth(40), width: p2dWidth(420)}}>
              <Text style={{fontSize: p2dWidth(35)}}>
                形式:{type === 1 ? '格子柜' : '推板'}
              </Text>
            </View>
          </View>
          <View style={{marginLeft: p2dWidth(80), marginTop: p2dHeight(70)}}>
            <Text style={{fontSize: p2dWidth(50)}}>| 操作</Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              height: '50%',
              marginTop: p2dHeight(50),
            }}>
            <View
              style={{
                marginLeft: p2dWidth(120),
                display: 'flex',
                flexDirection: 'row',
              }}>
              <View>
                <Text style={{fontSize: p2dWidth(35)}}>商品名称:</Text>
              </View>
              {this.state.flag === 'new' ? (
                <View>
                  <ModalSelector
                    data={this.state.formattedProductList}
                    // selectedKey={patientId}
                    // initValue={name}
                    style={{
                      height: p2dHeight(80),
                      textAlign: 'center',
                      width: p2dWidth(500),
                      marginLeft: p2dWidth(50),
                      // borderColor: 'green',

                      // borderStyle: 'solid',
                    }}
                    initValue="请选择上架的商品"
                    selectStyle={{
                      height: p2dHeight(80),
                      // paddingTop: p2dHeight(7),
                      textAlign: 'center',

                      width: p2dWidth(500),

                      borderRadius: p2dWidth(65),
                      borderColor: $conf.theme,
                      borderWidth: p2dWidth(3),
                      // borderColor: 'purple',
                      // borderWidth: 2,
                      // borderStyle: 'solid',
                      // fontColor: 'purple',
                    }}
                    selectedItemTextStyle={{
                      fontSize: p2dWidth(40),
                      // color: 'pink',
                      fontColor: 'white',
                    }}
                    optionContainerStyle={{
                      //
                      // borderWidth: 2,
                      // backgroundColor: 'green',
                      // borderColor: 'red',
                      // height: p2dHeight(130),
                      // lineHeight: p2dHeight(130),
                      width: p2dWidth(500),
                      marginLeft: '25%',
                    }}
                    initValueTextStyle={{
                      //
                      //已选中就诊人的样式
                      color: 'rgba(0,191,206,0.7)',
                      // borderWidth: p2dWidth(3),
                      fontSize: p2dWidth(30),
                      lineHeight: p2dHeight(63),
                    }}
                    selectTextStyle={{
                      fontSize: p2dWidth(30),
                      color: $conf.theme,
                      fontColor: 'yellow',
                      lineHeight: p2dWidth(60),
                    }}
                    cancelText={'确定'}
                    cancelContainerStyle={{
                      width: p2dWidth(500),
                      marginLeft: '25%',
                    }}
                    cancelTextStyle={{fontSize: p2dWidth(30)}}
                    optionTextStyle={{fontSize: p2dWidth(30)}}
                    onChange={(option) => {
                      this.setState({
                        selectedId: option.key,
                        selectedName: option.label,
                      });
                      this.state.batchNumberList.forEach((item) => {
                        if (item.key === option.key) {
                          this.setState({batchNumber: item.batchNumber});
                        }
                      });
                      // this.getPatientRelateDoctor(option.key);
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{marginLeft: p2dWidth(100), fontSize: p2dWidth(35)}}>
                  <Text style={{fontSize: p2dWidth(35)}}>{productName}</Text>
                </View>
              )}
            </View>

            <View
              style={{
                marginLeft: p2dWidth(120),
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: p2dWidth(35), width: p2dWidth(200)}}>
                商品批号
              </Text>

              <Text
                style={{
                  fontSize: p2dWidth(35),
                  width: p2dWidth(180),
                  marginLeft: p2dWidth(20),
                  // marginLeft: p2dWidth(300),
                  // position: 'absolute',
                  // top: 0,
                  // left: p2dWidth(200),
                }}>
                {batchNumber}
              </Text>
            </View>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                // marginLeft: p2dWidth(90),
                marginLeft: p2dWidth(115),
                justifyContent: 'flex-start',
                // borderColor: 'red',
                alignItems: 'center',
                // borderWidth: p2dWidth(2),
              }}>
              <Text style={{fontSize: p2dWidth(35), width: p2dWidth(200)}}>
                实际库存:
              </Text>
              <Text
                style={{
                  fontSize: p2dWidth(35),
                  width: p2dWidth(180),
                  marginLeft: p2dWidth(20),
                  // marginLeft: p2dWidth(300),
                  // position: 'absolute',
                  // top: 0,
                  // left: p2dWidth(200),
                }}>
                {realStock}
              </Text>

              <Text
                style={{
                  fontSize: p2dWidth(35),
                  width: p2dWidth(200),
                  marginLeft: p2dWidth(50),
                }}>
                锁定库存
              </Text>

              <TextInput
                style={{
                  width: p2dWidth(200),
                  height: p2dHeight(100),
                  borderColor: $conf.theme,
                  borderWidth: p2dWidth(3),
                  fontSize: p2dWidth(32),
                  borderRadius: p2dWidth(10),
                  color: 'black',
                  // fontColor: 'green',
                }}
                keyboardType="number-pad"
                value={this.state.lockStock}
                onChangeText={(val) => {
                  this.setState({lockStock: val});
                }}></TextInput>
            </View>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginLeft: p2dWidth(115),
                // borderColor: 'red',
                alignItems: 'center',
                // borderWidth: p2dWidth(2),
              }}>
              <Text style={{fontSize: p2dWidth(35), width: p2dWidth(200)}}>
                上架数量
              </Text>

              <TextInput
                style={{
                  width: p2dWidth(200),
                  height: p2dHeight(100),
                  borderColor: $conf.theme,
                  borderWidth: p2dWidth(3),
                  borderRadius: p2dWidth(10),
                  fontSize: p2dWidth(32),
                  color: 'black',
                }}
                keyboardType="number-pad"
                value={this.state.changedCount}
                onChangeText={(val) => {
                  this.setState({
                    changedCount: val,
                  });
                }}></TextInput>

              <Text
                style={{
                  fontSize: p2dWidth(35),
                  width: p2dWidth(200),
                  marginLeft: p2dHeight(50),
                }}>
                最大容量
              </Text>
              <TextInput
                style={{
                  width: p2dWidth(200),
                  height: p2dHeight(100),
                  borderColor: $conf.theme,
                  borderWidth: p2dWidth(3),
                  borderRadius: p2dWidth(10),
                  fontSize: p2dWidth(32),
                  color: 'black',
                }}
                keyboardType="number-pad"
                value={this.state.upperLimit}
                onChangeText={(val) => {
                  this.setState({upperLimit: val});
                }}></TextInput>
            </View>
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
              backgroundColor: this.state.changedCount ? $conf.theme : 'grey',
              width: p2dWidth(300),
            }}
            disabled={!this.state.changedCount}
            onPress={() => this.updateEStock()}>
            <Text
              style={{
                fontSize: p2dWidth(40),
                lineHeight: p2dHeight(80),
                color: '#FFFFFF',
                textAlign: 'center',
              }}>
              保存
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: 'grey',
              width: p2dWidth(300),
            }}
            onPress={() => this.props.navigation.navigate('repertory')}>
            <Text
              style={{
                fontSize: p2dWidth(40),
                lineHeight: p2dHeight(80),
                color: '#FFFFFF',
                textAlign: 'center',
              }}>
              取消
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default replenishment;
