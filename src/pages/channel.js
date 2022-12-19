import React, {Component} from 'react';
import {
  Text,
  TextInput,
  Image,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {height, p2dHeight, p2dWidth} from '../js/utils';
import api from '../js/cloudApi';
import {store} from '../store/store';
import {updateDrugChannel, upgradeEquipmentInfo} from '../action';
import TopBar from '../components/topbar';

import {
  Table,
  TableWrapper,
  Row,
  Cell,
  Rows,
} from 'react-native-table-component';

import AwesomeAlert from 'react-native-awesome-alerts';
import CommonAlert from '../components/commonAlert';
class channel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drugChannel: [
        [1, 1, 4],
        [2, 2, 4],
      ],
      updateChannel: [
        [1, 2, 3, 4],
        [9, 5, 3, 2],
      ],
      updateChannelHead: ['层', '类型', '数量', '修改'],
      tabHead: ['层', '类型', '数量'],
      updatedAllDrug: {},
      simpleUpdateData: [],
      showSubmitSuccessAlert: false,
      showDrugChannelUnderZeroAlert: false,
      showDisabledDeleteAlert: false,
      showDisableBothAlert: false,
      // allDrug: {},
      isDeleteDrug: false,
      removedSlotNoes: [],
      plusDisable: false,
      minusDisable: false,
    };
  }
  async componentDidMount() {
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    // let channelObj = store.getState().drugChannel;
    let res = await api.getEquipmentInfo(equipmentId, null);
    // let drugChannel = store.getState().equipmentInfo.drugChannel;
    console.info('res', JSON.parse(res.equipmentInfo.drugChannel));

    let drugChannel = res.equipmentInfo.drugChannel;
    let channelObj = JSON.parse(drugChannel);
    console.info('channlUpdate--------AllDrug', channelObj);

    // let action = updateDrugChannel(channelObj);
    // store.dispatch(action);
    this.setState({
      updatedAllDrug: channelObj,
    });

    this.simpleFormatted(channelObj);
    this.complexFormatted(channelObj);
  }

  simpleFormatted(channelObj) {
    let formattedChannel = [];
    channelObj.slot_info_list.forEach((item) => {
      let temp = [];
      temp.push(item.row);
      temp.push(item.type == 1 ? '格子柜' : '推板');
      temp.push(item.count);
      formattedChannel.push(temp);
    });
    if (formattedChannel) {
      console.info(formattedChannel);
      this.setState({
        drugChannel: formattedChannel,
        simpleUpdateData: formattedChannel,
      });
    }
  }

  complexFormatted(channelObj) {
    let updateDrug = [];
    channelObj.slot_info_list.forEach((item) => {
      let temp = [];
      temp.push(item.row);
      temp.push(item.type);
      temp.push(item.count);
      temp.push('修改');
      updateDrug.push(temp);
    });
    this.setState({
      updateChannel: updateDrug,
    });
  }

  minusDrug(rowData) {
    let row = rowData[0];
    if (this.state.minusDisable) {
      // Alert.alert('不允许同时进行增加和删除');
      shit.setState({
        showDisableBothAlert: true,
      });
      return;
    }
    let removedSlotNoes = [];
    console.info('-----minusDrug-----', row, rowData);
    if (rowData[2] === 0) {
      this.setState({
        showDrugChannelUnderZeroAlert: true,
      });
      return;
    }
    let updated = this.state.updateChannel.map((item) => {
      if (row === item[0]) {
        if (item[2] > 0) {
          return [item[0], item[1], item[2] - 1, item[3]];
        }
      } else {
        return item;
      }
    });

    console.info('-----minusDrug----updated', updated);
    let slot_info_list = this.state.updatedAllDrug.slot_info_list.map(
      (item) => {
        if (item.row === row && item.count > 0) {
          let temp = [...item.row_info];
          console.info('----row-----,count-----', item.row, item.count);
          console.info('row_info------', item.row_info);
          let removed = temp.pop();
          removedSlotNoes.push(removed.slot_no);

          return {
            ...item,
            count: item.count - 1,
            row_info: temp,
          };
        }
        return item;
      },
    );

    let temp = this.state.simpleUpdateData.map((item) => {
      if (item[0] === row) {
        return [item[0], item[1], item[2] - 1];
      }
      return item;
    });

    console.info('minus------slot_info_slot', slot_info_list);

    this.setState({
      updateChannel: updated,
      updatedAllDrug: {...this.state.updatedAllDrug, slot_info_list},
      simpleUpdateData: temp,
      removedSlotNoes: [...this.state.removedSlotNoes, ...removedSlotNoes],
      plusDisable: true,
    });
  }

  plusDrug(rowData) {
    let row = rowData[0];
    if (this.state.plusDisable) {
      // Alert.alert('不允许同时进行增加和删除');
      this.setState({
        showDisableBothAlert: true,
      });
      return;
    }
    console.info('-----plusDrug-----', row, rowData);
    let updated = this.state.updateChannel.map((item) => {
      if (row === item[0]) {
        return [item[0], item[1], item[2] + 1, item[3]];
      } else {
        return item;
      }
    });

    console.info('-----plusDrug----updated', updated);

    console.info(
      'this.state.updatedAllDrug--------slot_info_list',
      this.state.updatedAllDrug.slot_info_list,
    );

    let slot_info_list = this.state.updatedAllDrug.slot_info_list.map(
      (item) => {
        if (item.row === row) {
          return {
            ...item,
            count: item.count + 1,
            row_info: [
              ...item.row_info,
              {
                slot_no: `${row},${item.count + 1}`,
                length: 0,
                width: 0,
                height: 0,
                y: row,
                x: item.count + 1,
              },
            ],
          };
        }
        return item;
      },
    );

    let temp = this.state.simpleUpdateData.map((item) => {
      if (item[0] === row) {
        return [item[0], item[1], item[2] + 1];
      }
      return item;
    });

    console.info('----slot_info_list-----', slot_info_list);
    console.info(
      '----updatedAllDrug------',
      this.state.updatedAllDrug.slot_info_list,
    );
    this.setState({
      updateChannel: updated,
      updatedAllDrug: {...this.state.updatedAllDrug, slot_info_list},
      simpleUpdateData: temp,
      minusDisable: true,
    });
  }

  async updateChannel() {
    let equipmentInfo = store.getState().equipmentInfo;
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    const updatedAllDrug = this.state.updatedAllDrug;

    let res = await api.updateDrugChannel({
      equipmentId,
      drugChannel: updatedAllDrug,
      removedSlotNoes: !this.state.minusDisable
        ? this.state.removedSlotNoes
        : [],
    });

    if (res.result.errorCode === '1000') {
      console.info('--------channel 1000--------');
      this.setState({
        drugChannel: this.state.simpleUpdateData,
        showSubmitSuccessAlert: true,
        plusDisable: false,
        minusDisable: false,
      });
      //更新store数据
      // let action = updateDrugChannel(updatedAllDrug);
      // store.dispatch(action);

      let channelObj = JSON.stringify(updatedAllDrug);

      equipmentInfo.equipmentTypeInfo.drugChannel = channelObj;
      //更新本地库存
      action = upgradeEquipmentInfo(equipmentInfo);
      store.dispatch(action);
    }
    if (res.result.errorCode === '11005') {
      console.info('----------channel 11005--------');
      this.setState({
        showDisabledDeleteAlert: true,
        minusDisable: false,
        plusDisable: false,
      });

      let res = await api.getEquipmentInfo(equipmentId, null);
      // let drugChannel = store.getState().equipmentInfo.drugChannel;
      let drugChannel = res.equipmentInfo.drugChannel;
      // let drugChannel = store.getState().equipmentInfo.drugChannel;
      console.info('-----drugChannel--------', drugChannel);
      let channelObj = JSON.parse(drugChannel);
      this.setState({
        updatedAllDrug: channelObj,
      });
      this.complexFormatted(channelObj);
      this.simpleFormatted(channelObj);
    }
  }

  showSubmitSuccessAlert() {
    this.setState({
      showSubmitSuccessAlert: true,
    });
  }
  hideSubmitSuccessAlert() {
    this.setState({
      showSubmitSuccessAlert: false,
    });
  }
  showDrugChannelUnderZeroAlert() {
    this.setState({
      showDrugChannelUnderZeroAlert: true,
    });
  }

  hideDrugChannelUnderZeroAlert() {
    this.setState({
      showDrugChannelUnderZeroAlert: false,
    });
  }

  showDisabledDeleteAlert() {
    this.setState({
      showDisabledDeleteAlert: true,
    });
  }

  hideDisableDeleteAlert() {
    this.setState({
      showDisabledDeleteAlert: false,
    });
  }
  render() {
    const {drugChannel} = this.state;
    const {
      showSubmitSuccessAlert,
      showDrugChannelUnderZeroAlert,
      showDisabledDeleteAlert,
      showDisableBothAlert,
    } = this.state;
    const minusAndPlus = (data, rowData, index) => (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-around',
          height: p2dHeight(70),
        }}>
        <View>
          <TouchableOpacity
            style={{
              width: p2dWidth(40),
              height: p2dWidth(40),
              marginTop: p2dHeight(15),
            }}
            onPress={() => this.minusDrug(rowData)}>
            <Image
              style={{width: '100%', height: '100%'}}
              source={require('../assets/bigReduce.png')}></Image>
          </TouchableOpacity>
        </View>
        <View style={{height: '100%'}}>
          <Text style={{fontSize: p2dWidth(35), lineHeight: p2dHeight(70)}}>
            {data}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            style={{
              width: p2dWidth(40),
              height: p2dWidth(40),
              marginTop: p2dHeight(15),
            }}
            onPress={() => this.plusDrug(rowData)}>
            <Image
              style={{width: '100%', height: '100%'}}
              source={require('../assets/bigPlus.png')}></Image>
          </TouchableOpacity>
        </View>
      </View>
    );
    const updateButton = (data, index) => (
      <TouchableOpacity
        style={{
          width: p2dWidth(100),
          height: p2dHeight(50),
          // margiLeft: p2dWidth(50),
          width: '100%',
        }}
        onPress={() => this.updateChannel()}>
        <Text
          style={{
            textAlign: 'center',
            color: $conf.theme,
            fontSize: p2dWidth(35),
          }}>
          {data}
        </Text>
      </TouchableOpacity>
    );
    const formattedType = (data, index) => (
      <View
        style={{
          width: p2dWidth(150),
          height: p2dHeight(60),
          // marginLeft: p2dWidth(30),
          width: '100%',
        }}>
        <Text style={{fontSize: p2dWidth(35), textAlign: 'center'}}>
          {data == 1 ? '格子柜' : '推板'}
        </Text>
      </View>
    );
    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          position: 'relative',
          // justifyContent: 'space-around',
        }}>
        <CommonAlert
          showAlert={showDisabledDeleteAlert}
          title="药道已经绑定商品,不允许删除"
          confirmText="确定"></CommonAlert>
        <CommonAlert
          showAlert={showDrugChannelUnderZeroAlert}
          title="药道数为0,不能减少药道"
          confirmText="确定"></CommonAlert>
        {/* <CommonAlert
          title="药道修改成功"
          showAlert={showSubmitSuccessAlert}
          confirmText="确定"></CommonAlert> */}
        <CommonAlert
          title="不允许同时进行增加和删除的操作"
          showAlert={showDisableBothAlert}
          confirmText="确定"></CommonAlert>
        <AwesomeAlert
          show={showSubmitSuccessAlert}
          showProgress={false}
          title="药道修改成功"
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
            this.hideSubmitSuccessAlert();
          }}
        />
        {/* <AwesomeAlert
          show={showDisabledDeleteAlert}
          showProgress={false}
          title="药道已经绑定商品,不允许删除"
          // message="I have a message for you!"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          // cancelText="No, cancel"
          confirmText="确定"
          confirmButtonColor="#DD6B55"
          titleStyle={{
            fontSize: p2dWidth(40),
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
            fontSize: p2dWidth(30),
            color: 'white',
            lineHeight: p2dHeight(75),
            textAlign: 'center',
          }}
          confirmButtonStyle={{
            backgroundColor: $conf.theme,
            width: p2dWidth(200),
            height: p2dHeight(90),
            marginTop: p2dHeight(40),
          }}
          contentContainerStyle={{
            // borderColor: 'red',
            // borderWidth: 2,
            marginTop: -p2dHeight(300),
            width: p2dWidth(600),
            height: p2dHeight(300),
          }}
          onConfirmPressed={() => {
            this.hideDisableDeleteAlert();
          }}
        />
        <AwesomeAlert
          show={showDrugChannelUnderZeroAlert}
          showProgress={false}
          title="药道数为0,不能再减少药道"
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
            this.hideDrugChannelUnderZeroAlert();
          }}
        />
        <AwesomeAlert
          show={showSubmitSuccessAlert}
          showProgress={false}
          title="药道修改成功"
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
            this.hideSubmitSuccessAlert();
          }}
        /> */}
        <TopBar
          pageName="货道详情"
          hideBack={false}
          disableCount={true}
          disableAdminExit={false}
          navigation={this.props.navigation}></TopBar>

        <View style={{position: 'absolute', top: p2dHeight(190)}}>
          <Text style={{fontSize: p2dWidth(50), textAlign: 'center'}}>
            货道详情
          </Text>
        </View>

        <View style={{position: 'absolute', top: p2dHeight(320)}}>
          <Table
            borderStyle={{borderWidth: p2dWidth(2), borderColor: '#C1C1C1'}}>
            <Row
              data={this.state.tabHead}
              textStyle={{textAlign: 'center', fontSize: p2dWidth(40)}}
              widthArr={[p2dWidth(200), p2dWidth(400), p2dWidth(200)]}
              height={p2dHeight(80)}></Row>
            <Rows
              data={drugChannel}
              widthArr={[p2dWidth(200), p2dWidth(400), p2dWidth(200)]}
              heightArr={[
                p2dHeight(80),
                p2dHeight(80),
                p2dHeight(80),
                p2dHeight(80),
              ]}
              textStyle={{
                fontSize: p2dWidth(40),
                textAlign: 'center',
                lineHeight: p2dHeight(80),
              }}></Rows>
          </Table>
        </View>

        <View style={{position: 'absolute', top: p2dHeight(800)}}>
          <Text style={{fontSize: p2dWidth(50), textAlign: 'center'}}>
            货道管理
          </Text>
        </View>
        <View style={{position: 'absolute', top: p2dHeight(920)}}>
          <Table
            borderStyle={{borderColor: '#C1C1C1', borderWidth: p2dWidth(2)}}>
            <Row
              data={this.state.updateChannelHead}
              style={{
                height: p2dHeight(70),
                backgroundColor: 'yellow',
                textAlign: 'center',
              }}
              textStyle={{fontSize: p2dWidth(40), textAlign: 'center'}}
              widthArr={[
                p2dWidth(200),
                p2dWidth(200),
                p2dWidth(300),
                p2dWidth(200),
              ]}
            />
            {this.state.updateChannel.map((rowData, index) => (
              <TableWrapper
                key={index}
                style={{flexDirection: 'row', backgroundColor: '#FFF1C1'}}>
                {rowData.map((cellData, cellIndex) => {
                  if (cellIndex === 0) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={cellData}
                        height={p2dHeight(70)}
                        textStyle={{
                          fontSize: p2dWidth(35),
                          textAlign: 'center',
                          lineHeight: p2dHeight(70),
                        }}
                        width={p2dWidth(200)}
                      />
                    );
                  }
                  if (cellIndex === 1) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={formattedType(cellData)}
                        height={p2dHeight(70)}
                        textStyle={{
                          fontSize: p2dWidth(35),
                          textAlign: 'center',
                          lineHeight: p2dHeight(70),
                        }}
                        width={p2dWidth(200)}
                      />
                    );
                  }
                  if (cellIndex === 2) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={minusAndPlus(cellData, rowData, index)}
                        height={p2dHeight(70)}
                        textStyle={{
                          fontSize: p2dWidth(35),
                          textAlign: 'center',
                        }}
                        width={p2dWidth(300)}
                      />
                    );
                  }
                  if (cellIndex === 3) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={updateButton(cellData)}
                        height={p2dHeight(70)}
                        textStyle={{
                          fontSize: p2dWidth(35),
                          textAlign: 'center',
                          lineHeight: p2dHeight(70),
                        }}
                        width={p2dWidth(200)}
                      />
                    );
                  }
                })}
              </TableWrapper>
            ))}
          </Table>
        </View>
      </View>
    );
  }
}

export default channel;
