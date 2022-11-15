import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Button,
  DeviceEventEmitter,
  NativeModules,
  BackHandler,
  TextInput,
} from 'react-native';
import TopBar from '../components/topbar';
import {p2dWidth, parseTime} from '../js/utils';
import Conf from '../js/conf';
import {AddBlankLine, AddTextContent} from '../js/ticketHelper';
import api from '../js/cloudApi';

import {store} from '../store/store';
import {upgradeEquipmentInfo} from '../action';
class Setting extends Component {
  constructor() {
    super();
    this.state = {
      //按钮状态
      btnDisabled: {
        track: false,
        print: false,
        upgrade: false,
      },
      inputX: '1', //列
      inputY: '1', //层
    };
    this.queue = new Set();
  }

  componentDidMount() {
    console.debug('go page 【setting】');
    this.emitListener = DeviceEventEmitter.addListener(
      'out_callback',
      (res) => {
        NativeModules.RaioApi.info(
          {
            msg: `setting page out callback, ${JSON.stringify(res)}`,
            method: 'setting.componentDidMount',
          },
          null,
        );
        for (let item of this.queue) {
          if (item.x === res.x && item.y === res.y) {
            // 1：开始出货，2：等待用户取货，3：出货完成，负数：出货失败错误码
            if (res.type === 1 || res.type === 2) {
              return;
            }
            if (res.type === 3) {
              item.resolve();
            } else {
              item.reject(res.type);
            }
            this.queue.delete(item);
          }
        }
      },
    );
  }
  componentWillUnmount() {
    console.debug('destroy page 【setting】');
    DeviceEventEmitter.removeListener('out_callback');
    this.emitListener = null;
  }
  out(x, y) {
    NativeModules.RaioApi.debug(
      {msg: `call out input x=${x},y=${y}`, method: 'setting.out'},
      null,
    );
    return new Promise((resolve, reject) => {
      if (Conf.debug) {
        setTimeout(() => {
          resolve();
        }, 5000);
      } else {
        NativeModules.RaioApi.out(0, x, y, (res) => {
          if (res === 0) {
            let obj = {resolve, reject, x, y};
            this.queue.add(obj);
          } else {
            reject(res);
          }
          setTimeout(() => {
            reject('timeout');
          }, 30000);
        });
      }
    });
  }
  async testTrack() {
    try {
      if (this.state.btnDisabled.track) {
        return;
      }
      NativeModules.RaioApi.debug(
        {msg: 'setting page testTrack start', method: 'setting.testTrack'},
        null,
      );
      this.setState({btnDisabled: {...this.state.btnDisabled, track: true}});
      const {inputX, inputY} = this.state;
      x = parseInt(inputX) - 1;
      y = 7 - parseInt(inputY);

      await this.out(x, y);
    } catch (e) {
      NativeModules.RaioApi.error(
        {
          msg: `setting page testTrack error=${e.message}`,
          method: 'setting.testTrack',
        },
        null,
      );
    }

    this.setState({btnDisabled: {...this.state.btnDisabled, track: false}});
  }
  async testPrint() {
    try {
      if (this.state.btnDisabled.print) {
        return;
      }
      NativeModules.RaioApi.debug(
        {msg: 'setting page testPrint start', method: 'setting.testPrint'},
        null,
      );
      this.setState({btnDisabled: {...this.state.btnDisabled, print: true}});
      let ticket_template_info_list = [];
      //标题
      let ticket_title = '欧药师智能药机';
      let obj = AddTextContent(ticket_title, 1, 1, 1);
      ticket_template_info_list.push(obj);
      //间隔
      let arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);
      //日期
      let op_date_text =
        '日  期: ' + parseTime(new Date(), '{y}-{m}-{d} {h}:{i}');
      obj = AddTextContent(op_date_text, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //药机名称
      let equipmentName = '药  机: 测试药机';
      obj = AddTextContent(equipmentName, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //流水号
      let serial_no = '流水号: 123456789';
      obj = AddTextContent(serial_no, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //间隔
      arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      let recode_title = '编号/品名           单价        数量       小计';
      obj = AddTextContent(recode_title, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //分隔符
      let separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //药品
      let content = '1. 莲花清瘟';
      obj = AddTextContent(content, 0, 0, 1, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      let price = '1.23';
      let count = '2';
      let amount = '2.46';
      content =
        price.padStart(24, ' ') +
        count.padStart(12, ' ') +
        amount.padStart(12, ' ');
      obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      content = '规    格：100mg';
      obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      content = '生产厂家： 哈药六厂';
      obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      //间隔
      arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      //分隔符
      separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      let total_product_count = '数量合计：2';
      obj = AddTextContent(
        total_product_count,
        0,
        0,
        0,
        ticket_template_info_list,
      );
      ticket_template_info_list.push(obj);

      let total_amount = '金额合计：2.46';
      obj = AddTextContent(total_amount, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      //间隔
      arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      let phone = '客服电话：400400123';
      obj = AddTextContent(phone, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      let remark = '谢谢惠顾，欢迎再次使用！';
      obj = AddTextContent(remark, 1, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      this.printTicket(ticket_template_info_list);
      NativeModules.RaioApi.debug(
        {msg: 'setting page testPrint end', method: 'setting.testPrint'},
        null,
      );
      setTimeout(() => {
        this.setState({btnDisabled: {...this.state.btnDisabled, print: false}});
      }, 5000);
    } catch (e) {
      NativeModules.RaioApi.error(
        {
          msg: `setting page testPrint error=${e.message}`,
          method: 'setting.testPrint',
        },
        null,
      );
      this.setState({btnDisabled: {...this.state.btnDisabled, print: false}});
    }
  }
  printTicket(ticket_template_info_list) {
    if (Conf.debug) {
      return;
    }
    for (let i = 0; i < ticket_template_info_list.length; i++) {
      let item = ticket_template_info_list[i];
      if (item.type === 'text') {
        NativeModules.RaioApi.printText(
          item.str,
          item.align,
          item.size,
          item.bold,
          i === ticket_template_info_list.length - 1 ? 1 : 0,
          (res) => {},
        );
      }
      if (item.type === 'image') {
        NativeModules.RaioApi.printImage(
          item.image_info,
          item.align,
          i === ticket_template_info_list.length - 1 ? 1 : 0,
          (res) => {},
        );
      }
    }
  }

  getMac() {
    return new Promise((resolve, reject) => {
      if (Conf.debug) {
        NativeModules.RaioApi.debug(
          {
            msg: `get mac success, debug mode, ${Conf.mac}`,
            method: 'start.getMac',
          },
          null,
        );
        console.info(`get mac success, debug mode, ${Conf.mac}`);
        resolve(Conf.mac);
      } else {
        NativeModules.RaioApi.getMac((res) => {
          if (res) {
            res = res.replace(/:/g, '');
            console.info(`get mac success, ${res}`);
            NativeModules.RaioApi.debug(
              {msg: `get mac success, ${res}`, method: 'start.getMac'},
              null,
            );
            resolve(res);
          } else {
            NativeModules.RaioApi.debug(
              {
                msg: `get mac fail, ${JSON.stringify(res)}`,
                method: 'start.getMac',
              },
              null,
            );
            console.info(`get mac fail, ${JSON.stringify(res)}`);
            reject(res);
          }
        });
      }
    });
  }

  async getEquipmentInfo() {
    let mac = await this.getMac();
    let res = await api.getEquipmentInfo(null, mac);
    if (res?.equipmentInfo) {
      res.equipmentInfo;
      let equipmentInfo = res.equipmentInfo;
      //获取设备详情
      const equipmentInfoDetailRes = await api.getEquipmentDetail(
        equipmentInfo.equipmentId,
        equipmentInfo.mac,
      );
      if (
        equipmentInfoDetailRes &&
        equipmentInfoDetailRes.equipmentDetailInfo
      ) {
        console.info(
          'setting page, getEquipmentInfo,getEquipmentDetail success %o, %o',
          equipmentInfoDetailRes,
        );
        const action = await upgradeEquipmentInfo(
          equipmentInfoDetailRes.equipmentDetailInfo,
        );
        store.dispatch(action);
        Alert.alert('更新数据信息成功');
      } else {
        console.info(
          'setting page, getEquipmentInfo,getEquipmentDetail something wrong, %o, %o',
          equipmentInfoDetailRes,
        );
      }
    } else {
      NativeModules.RaioApi.debug(
        {
          msg: `setting page, getEquipmentInfo something wrong, ${JSON.stringify(
            res,
          )}`,
          method: 'setting.getEquipmentInfo',
        },
        null,
      );
    }
  }

  exitApp() {
    Alert.alert('提示', '确定退出App?', [
      {
        text: '确定',
        onPress: () => {
          BackHandler.exitApp();
        },
      },
      {text: '取消'},
    ]);
  }

  confirmCallback() {
    if (this.refs.upModal) {
      this.refs.upModal.cancel();
    }
  }
  render() {
    return (
      <View style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
        <TopBar
          pageName="维护模式"
          disableCount={true}
          navigation={this.props.navigation}
        />
        <View style={customStyle.container}>
          <View style={customStyle.container}>
            <ScrollView style={customStyle.scroll}>
              <Text style={customStyle.textLabel}>硬件测试</Text>
              <View style={customStyle.itemContainer}>
                <Text style={{flexShrink: 0}}>履带测试</Text>
                <View style={{flexGrow: 1}}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        flexGrow: 0,
                        width: 100,
                      }}>
                      <TextInput
                        style={{
                          borderColor: 'red',
                          borderWidth: 3,
                          fontSize: p2dWidth(32),
                          width: p2dWidth(200),
                        }}
                        // keyboardType="numeric" //弹出键盘类型

                        keyboardType="number-pad"
                        value={this.state.inputY}
                        onChangeText={(val) =>
                          this.setState({inputY: val})
                        }></TextInput>
                    </View>
                    <View style={{flexShrink: 0, marginRight: p2dWidth(20)}}>
                      <Text>层</Text>
                    </View>
                    <View
                      style={{
                        flexGrow: 0,
                        width: 100,
                      }}>
                      <TextInput
                        style={{
                          borderColor: 'green',
                          borderWidth: 3,
                          fontSize: p2dWidth(32),
                          width: p2dWidth(200),
                        }}
                        // keyboardType="numeric" //弹出键盘类型
                        keyboardType="number-pad"
                        value={this.state.inputX}
                        onChangeText={(val) =>
                          this.setState({inputX: val})
                        }></TextInput>
                    </View>
                    <View style={{flexShrink: 0, marginRight: p2dWidth(20)}}>
                      <Text>列</Text>
                    </View>
                  </View>
                </View>
                <Button
                  color="#00BFCE"
                  disabled={this.state.btnDisabled.track}
                  style={{flexShrink: 0}}
                  title="开始测试"
                  onPress={this.testTrack.bind(this)}
                />
              </View>
              <View
                style={[customStyle.itemContainer, customStyle.itemContainer2]}>
                <Text style={{flexShrink: 0}}>打印机测试</Text>
                <Button
                  color="#00BFCE"
                  disabled={this.state.btnDisabled.print}
                  style={{flexShrink: 0}}
                  title="开始测试"
                  onPress={this.testPrint.bind(this)}
                />
              </View>
              <Text style={customStyle.textLabel}>关于本机</Text>
              <View style={customStyle.itemContainer3}>
                <View style={customStyle.itemContainer4}>
                  <View style={{flexShrink: 0, width: p2dWidth(280)}}>
                    <Text>退出程序</Text>
                  </View>
                  <View style={{flexGrow: 1}} />
                  <Button
                    color="#00BFCE"
                    style={{flexShrink: 0}}
                    title="退出程序"
                    onPress={this.exitApp.bind(this)}
                  />
                </View>
              </View>
              <View style={customStyle.itemContainer3}>
                <View style={customStyle.itemContainer4}>
                  <View style={{flexShrink: 0, width: p2dWidth(280)}}>
                    <Text>更新药品数据</Text>
                  </View>
                  <View style={{flexGrow: 1}} />
                  <Button
                    color="#00BFCE"
                    style={{flexShrink: 0}}
                    title="更新药品数据"
                    onPress={this.getEquipmentInfo.bind(this)}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }
}
//$conf.theme
const customStyle = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
    position: 'relative',
  },
  scroll: {
    width: '100%',
    position: 'absolute',
    height: '100%',
    backgroundColor: '#E1E1E1',
  },
  textLabel: {
    fontSize: p2dWidth(42),
    fontFamily: 'PingFangSC-Semibold, PingFang SC',
    fontWeight: '800',
    color: '#333333',
    lineHeight: p2dWidth(50),
    paddingLeft: p2dWidth(40),
    paddingRight: p2dWidth(40),
    paddingTop: p2dWidth(40),
    paddingBottom: p2dWidth(20),
    letterSpacing: 1,
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: p2dWidth(40),
    marginRight: p2dWidth(40),
    padding: p2dWidth(10),
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.6)',
    borderStyle: 'solid',
    borderRadius: 4,
  },
  itemContainer2: {
    marginTop: p2dWidth(20),
    justifyContent: 'space-between',
  },
  itemContainer3: {
    marginLeft: p2dWidth(40),
    marginRight: p2dWidth(40),
    padding: p2dWidth(10),
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.6)',
    borderStyle: 'solid',
    borderRadius: 4,
  },
  itemContainer4: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: p2dWidth(10),
  },
});

export default Setting;
