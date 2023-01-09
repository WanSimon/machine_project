import React, {Component} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import {p2dHeight, p2dWidth} from '../js/utils';
import {Table, TableWrapper, Row, Cell} from 'react-native-table-component';
import {store} from '../store/store';
import api from '../js/cloudApi';
import {updateSlotNo, updateProductId} from '../action';
import {widthArr, tableHead} from '../js/common';
import uuid from 'react-native-uuid';
import ReplenishmentModal from './replenishmentModal';

class Repertory extends Component {
  constructor() {
    super();
    this.state = {
      tab: 'channel',
      tableData: [],
      equipmentGroupInfo: {},
      unshelveModalVisible: false,
      unshelveNum: '0',
      unshelveData: {},
      replenishmentModalVisible: false,
      replenishData: {},
      replenishNum: '0',
      equipmentId: '',
      slotNo: '',
      replenishmentRowData: [],
    };
  }

  async componentDidMount() {
    console.debug('go to page 【repertory】');

    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    this.setState({
      equipmentId,
    });
  }

  async toDetail(cellData) {
    console.info('------cellData------', cellData);
    let action = updateProductId(cellData);
    store.dispatch(action);
    this.props.navigation.navigate('drugDetail');
  }
  getSelectedRow(rowData) {
    this.setState({unshelveModalVisible: true});
    let orgProductId = '';
    let slotNo = rowData[1];
    let productList =
      store.getState().equipmentInfo.equipmentProductInfo.slotProductInfoList;
    productList.forEach((item) => {
      if (item.slotNo === slotNo) {
        orgProductId = item.orgProductInfo.orgProductId;
      }
    });
    this.setState({
      unshelveData: {
        slotNo: rowData[1],
        realStock: rowData[4],
        upperLimit: rowData[5],
        lockStock: rowData[6],
        batchNumber: rowData[7],
        orgProductId,
      },
    });
  }

  async unshelveSubmit() {
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    let unshelveNum = parseInt(this.state.unshelveNum);
    const adminId = store.getState().adminData.adminId;

    let res = await api.updateEStock({
      equipmentId,
      requestId: uuid.v4(),
      opAccountId: adminId,
      opType: 1,
      lockProduct: '0',
      result: '1',
      slotProductChgInfoList: [
        {
          ...this.state.unshelveData,
          changedCount: unshelveNum,
          opTime: new Date().getTime(),
          errcode: 0,
        },
      ],
    });

    if (res.status) {
      console.info('商品下架成功');
      this.setState({unshelveModalVisible: false});
      this.props.shouldUpdate('repertory');
      Alert.alert('药品下架成功');
    }
  }

  async getReplenishRowData(rowData) {
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    if (rowData[3]) {
      let detail = await api.getEDrugStockDetail({
        equipmentId,
        slotNo: rowData[1],
      });
      this.setState({
        replenishData: {
          equipmentId,
          slotNo: rowData[1],
          type: rowData[2],
          realStock: rowData[4],
          lockStock: rowData[6],
          upperLimit: rowData[5],
          batchNumber: rowData[7],
          productName: orw[3],
          orgProductId: detail.drugStockInfo.orgProductId,
          hasProduct: true, //名字
          flag: 'old',
          // slotNoList: String(rowData[1]).split(','),
        },

        replenishModalVisible: true,
      });
    } else {
      let productList = await api.getProductInfoByEquipmentId({equipmentId});
      let orgId = productList.productInfo[0].orgId;

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
      this.setState({
        replenishData: {
          slotNo: rowData[1],
          type: rowData[2],
          equipmentId,
          hasProduct: false,
          flag: 'new',
          orgId,
          formattedProductList,
          batchNumberList,
          // slotNoList: String(rowData[1]).split(','),
        },
      });
    }
  }

  componentWillUnmount() {
    console.debug('will leave [repertory]');
  }
  render() {
    const state = this.state;
    const detail = (rowData, index) => (
      <TouchableOpacity
        onPress={() => {
          if (rowData[4] !== 0) {
            this.toDetail(rowData, index);
          }
        }}>
        <View
          style={{
            width: p2dWidth(90),
            height: p2dHeight(35),
            // backgroundColor: '#78B7BB',
            borderRadius: 2,
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: '#78B7BB',
              width: p2dWidth(90),
              lineHeight: p2dHeight(35),
              textAlign: 'center',
              fontSize: p2dWidth(20),
            }}>
            查看
          </Text>
        </View>
      </TouchableOpacity>
    );
    const management = (slotNoStr, rowData, index) => {
      return (
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            onPress={() => {
              console.info('----------rowData----------', rowData);

              this.getSelectedRow(rowData);
              let action = updateSlotNo(slotNoStr);
              store.dispatch(action);
              if (rowData[4] !== 0) {
                this.props.navigation.navigate('unshelve');
              }
            }}>
            <View
              style={{
                width: p2dWidth(50),
                height: p2dHeight(35),
                // backgroundColor: '#77B7BB',
                borderRadius: 1,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#77B7BB',
                  lineHeight: p2dHeight(35),
                  width: p2dWidth(40),
                  fontSize: p2dWidth(20),
                }}>
                下架
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              let action = updateSlotNo(slotNoStr);
              store.dispatch(action);
              this.props.navigation.navigate('replenishment', {
                rowData: rowData,
              });
              // this.getReplenishRowData(rowData);
              // this.setState({
              //   replenishmentRowData: rowData,
              //   replenishmentModalVisible: true,
              // });
            }}>
            <View
              style={{
                width: p2dWidth(50),
                height: p2dHeight(35),
                // backgroundColor: '#77B7BB',
                borderRadius: 1,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#77B7BB',
                  lineHeight: p2dHeight(35),
                  width: p2dWidth(40),
                  fontSize: p2dWidth(20),
                }}>
                补货
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    };
    return (
      <View
        style={{
          flex: 1,
          display: 'flex',
          height: p2dHeight(400),
          flexDirection: 'column',
          marginTop: p2dHeight(50),
        }}>
        <ScrollView
          style={{
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '70%',
          }}>
          <Table
            style={{
              width: p2dWidth(1055),
              marginLeft: p2dWidth(10),
            }}
            borderStyle={{
              borderColor: '#C1C1C1',
              borderWidth: p2dWidth(2),
            }}>
            <Row
              data={tableHead}
              textStyle={{
                fontSize: p2dWidth(20),
                width: '100%',
                textAlign: 'center',
              }}
              height={p2dHeight(40)}
              widthArr={widthArr}
            />
            {this.props.tableData.map((rowData, index) => (
              <TableWrapper
                key={index}
                style={{
                  flexDirection: 'row',
                }}>
                {rowData.map((cellData, cellIndex) => {
                  if (cellIndex === 8) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={detail(cellData, index)}
                        textStyle={styles.cell}
                        width={p2dWidth(90)}
                      />
                    );
                  }
                  if (cellIndex === 9) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={management(rowData[1], rowData, index)}
                        width={p2dWidth(130)}
                        textStyle={styles.cell}
                      />
                    );
                  }
                  if ([0, 4, 5, 6].includes(cellIndex)) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={cellData}
                        width={p2dWidth(60)}
                        textStyle={styles.cell}
                      />
                    );
                  }

                  if ([1, 2].includes(cellIndex)) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={
                          cellIndex === 1
                            ? `${cellData.split(',')[0]}层${
                                cellData.split(',')[1]
                              }列`
                            : cellData
                        }
                        textStyle={styles.cell}
                        width={p2dWidth(110)}
                      />
                    );
                  }
                  if ([7].includes(cellIndex)) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={cellData}
                        textStyle={styles.cell}
                        width={p2dWidth(130)}
                      />
                    );
                  }
                  return (
                    <Cell
                      key={cellIndex}
                      data={cellData}
                      textStyle={styles.cell}
                      width={p2dWidth(240)}
                    />
                  );
                })}
              </TableWrapper>
            ))}
          </Table>
        </ScrollView>
        {/* <Modal
          visible={this.state.unshelveModalVisible}
          animationType="slide"
          // transparent={true}
          style={{backgroundColor: 'grey'}}
          presentationStyle={{backgroundColor: 'grey'}}
          onRequestClose={() => {
            this.setState({unshelveModalVisible: false});
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: p2dHeight(80),
            }}>
            <View style={{marginTop: p2dHeight(150)}}>
              <Text style={{fontSize: p2dWidth(50)}}>下架数量</Text>
            </View>
            <TextInput
              style={{
                width: p2dWidth(300),
                height: p2dHeight(100),
                fontSize: p2dWidth(32),
                borderColor: $conf.theme,
                borderWidth: p2dWidth(2),
                marginTop: p2dHeight(220),
              }}
              keyboardType="number-pad"
              onChangeText={(val) => {
                this.setState({unshelveNum: val});
              }}></TextInput>
            <View
              style={{
                marginTop: p2dHeight(320),
                width: p2dWidth(500),
                height: p2dHeight(80),
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <TouchableOpacity
                style={{
                  borderColor: $conf.theme,
                  borderWidth: p2dWidth(2),
                  width: p2dWidth(200),
                  height: p2dHeight(80),
                }}
                onPress={() => this.unshelveSubmit()}>
                <Text
                  style={{
                    color: $conf.theme,
                    textAlign: 'center',
                    fontSize: p2dWidth(35),
                    height: p2dHeight(70),
                    lineHeight: p2dHeight(70),
                  }}>
                  确定
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderColor: $conf.theme,
                  borderWidth: p2dWidth(2),
                  width: p2dWidth(200),
                  height: p2dHeight(80),
                }}
                onPress={() => this.setState({unshelveModalVisible: false})}>
                <Text
                  style={{
                    color: $conf.theme,
                    textAlign: 'center',
                    fontSize: p2dWidth(35),
                    height: p2dHeight(70),
                    lineHeight: p2dHeight(70),
                  }}>
                  取消
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}
        {/* <ReplenishmentModal
          replenishmentModalVisible={this.state.replenishmentModalVisible}
          setReplenishmentModalVisible={(v) =>
            this.setState({replenishmentModalVisible: v})
          }
          replenishData={this.state.replenishData}
          shouldUpdate={(v) => this.props.shouldUpdate(v)}></ReplenishmentModal> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cell: {fontSize: p2dWidth(20), textAlign: 'center'},
  container: {flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff'},
  head: {},
  row: {flexDirection: 'row', backgroundColor: '#FFF1C1'},
  btn: {
    width: p2dWidth(40),
    height: 18,
    backgroundColor: '#78B7BB',
    borderRadius: 2,
  },
  btnText: {
    textAlign: 'center',
    color: '#fff',
    width: p2dWidth(40),
    fontSize: p2dWidth(20),
  },
});

export default Repertory;
