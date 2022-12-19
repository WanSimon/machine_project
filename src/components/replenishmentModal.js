import React, {Component} from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {p2dWidth, p2dHeight} from '../js/utils';
import {store} from '../store/store';
import api from '../js/cloudApi';

import uuid from 'react-native-uuid';
import ModalSelector from 'react-native-modal-selector';
class ReplenishmentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slotNoList: [],
      batchNumber: '',
      lockStock: '0',
      changedCount: '0',
      upperLimit: '0',
      productList: {},
      formattedProductList: [],
      selectedName: '',
      selectedId: '',
      batchNumberList: [],
      orgId: '',
    };
  }

  //   async componentDidMount() {
  //     const equipmentId =
  //       store.getState().equipmentInfo.equipmentProductInfo.equipmentId;

  //     let rowData = this.props.replenishmentRowData;
  //     console.info('-----rowData-----', rowData);
  //     this.setState({rowData: rowData});
  //     let slotNo = rowData[1];
  //     let slotNoList = slotNo.split(',');
  //     this.setState({
  //       slotNoList: slotNoList,
  //     });
  //     let detail = await api.getEDrugStockDetail({
  //       equipmentId,
  //       slotNo,
  //     });

  //     console.info('-----detail replenishment------', detail);

  //     if (detail.drugStockInfo !== null) {
  //       this.setState({
  //         info: detail.drugStockInfo,
  //         upperLimit: detail.drugStockInfo.upperLimit,
  //         batchNumber: detail.drugStockInfo.batchNumber,
  //         lockStock: detail.drugStockInfo.lockStock,

  //         flag: 'old',
  //       });
  //       console.info(
  //         '---replenishment page----',
  //         detail.drugStockInfo.upperLimit,
  //         detail.drugStockInfo.batchNumber,
  //         detail.drugStockInfo.lockStock,
  //       );
  //     } else {
  //       this.setState({flag: 'new'});
  //       let productList = await api.getProductInfoByEquipmentId({equipmentId});
  //       console.info('--------- productList replenishment -------', productList);

  //       let orgId = productList.productInfo[0].orgId;

  //       this.setState({orgId});

  //       let formattedProductList = productList.productInfo.map((item) => {
  //         return {
  //           key: item.productInfo.productId,
  //           label: item.productInfo.name,
  //         };
  //       });

  //       let batchNumberList = productList.productInfo.map((item) => {
  //         return {
  //           key: item.productInfo.productId,
  //           label: item.productInfo.name,
  //           batchNumber: item.batchNumber,
  //           orgProductId: item.orgProductId,
  //         };
  //       });
  //       this.setState({formattedProductList, batchNumberList});
  //     }
  //     console.info(
  //       '数据初始化-------',
  //       detail.drugStockInfo.upperLimit,
  //       detail.drugStockInfo.batchNumber,
  //       detail.drugStockInfo.lockStock,
  //     );
  //   }

  async updateEStock() {
    const {flag} = this.props.replenishData;
    //     const equipmentId =
    //       store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    console.info('button');
    console.info('this.state.flag', flag);
    let adminId = store.getState().adminData.adminId;
    if (flag === 'new') {
      console.info('flag---', flag);

      const {orgId, batchNumberList, flag, slotNo} = this.props.replenishData;
      const {selectedId, lockStock, changedCount, upperLimit} = this.state;

      let thisProduct = batchNumberList.find((item) => {
        if (item.key === selectedId) {
          return true;
        }
        return false;
      });
      //药道无药品，添加新的药品
      console.info('----------new Product saveProduct-------', {
        equipmentId,
        lockStock: parseInt(lockStock),
        modifiedId: adminId,
        opAccountId: adminId,
        orgId,
        orgProductId: thisProduct.orgProductId,
        realStock: parseInt(changedCount),
        slotNo,
        upperLimit: parseInt(upperLimit),
      });
      let saveProduct = await api.saveEquipmentProduct({
        equipmentId,
        lockStock: parseInt(lockStock),
        modifiedId: adminId,
        opAccountId: adminId,
        orgId,
        orgProductId: thisProduct.orgProductId,
        realStock: parseInt(changedCount),
        slotNo,
        upperLimit: parseInt(upperLimit),
      });
      if (saveProduct.equipmentProductId) {
        Alert.alert('药品添加成功');
      }
      console.info('saveEquipmentProduct----replenishment----', saveProduct);
    } else {
      const {batchNumber, slotNo, orgProductId, realStock} =
        this.props.replenishData;
      const {lockStock, changedCount, upperLimit} = this.state;
      //药道有药品，给药道补充药品
      let updated = {};
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
              orgProductId: orgProductId,
              changedCount: parseInt(changedCount),
              realStock: parseInt(realStock),
              lockStock: parseInt(lockStock),
              opTime: 1,
              errcode: 0,
              upperLimit: parseInt(upperLimit),
              batchNumber,
            },
          ],
        })
        .then((res) => {
          if (res.status) {
            Alert.alert('补货成功');
          }
        });
    }

    this.props.shouldUpdate('replenishment');
    this.props.setReplenishmentModalVisible(false);
  }

  render() {
    const {type, productName, realStock} = this.state.info;
    const {slotNoList, batchNumber, lockStock, changedCount, upperLimit} =
      this.state;
    return (
      <Modal
        style={{display: 'flex', justifyContent: 'space-around'}}
        visible={this.props.replenishmentModalVisible}>
        <View
          style={{
            display: 'flex',
            height: p2dHeight(1200),
          }}>
          <View style={{marginLeft: p2dWidth(80), marginTop: p2dHeight(70)}}>
            <Text style={{fontSize: p2dWidth(50)}}>| 货道信息</Text>
          </View>

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
                货道:{this.props.replenishment.slotNoList[0]}层
                {this.props.replenishData.slotNoList[1]}列
              </Text>
            </View>
            <View style={{marginLeft: p2dWidth(40), width: p2dWidth(420)}}>
              <Text style={{fontSize: p2dWidth(35)}}>
                形式:{this.props.replenishData.type === 1 ? '格子柜' : '推板'}
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
              {this.props.replenishData.flag === 'new' ? (
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
                    selectStyle={{
                      height: p2dHeight(80),
                      // paddingTop: p2dHeight(7),
                      textAlign: 'center',

                      width: p2dWidth(500),

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
                  <Text>{this.props.replenishData.productName}</Text>
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

              <TextInput
                style={{
                  width: p2dWidth(200),
                  height: p2dHeight(100),
                  borderColor: $conf.theme,
                  borderWidth: p2dWidth(3),
                  borderRadius: p2dWidth(10),
                  fontSize: p2dWidth(32),
                  // color: 'black',
                  // padding: 0,
                }}
                keyboardType="number-pad"
                value={
                  this.props.replenishData.flag === 'old'
                    ? this.props.replenishData.batchNumber
                    : this.state.batchNumber
                }
                onChangeText={(val) => {
                  this.setState({
                    batchNumber: val,
                  });
                }}></TextInput>
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
                borderWidth: p2dWidth(2),
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
                {
                  (this.props.replenishData.flag = 'new'
                    ? 0
                    : this.props.replenishData.realStock)
                }
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
                // value={this.state.lockStock}
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
                borderWidth: p2dWidth(2),
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
                // value={this.state.changedCount}
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
                // value={this.state.upperLimit}
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
              backgroundColor: $conf.theme,
              width: p2dWidth(300),
            }}
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
            onPress={() => {
              this.props.setReplenishmentModalVisible(false);
            }}>
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
      </Modal>
    );
  }
}

export default ReplenishmentModal;
