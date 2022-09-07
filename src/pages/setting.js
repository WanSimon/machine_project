import React, { Component, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Alert, Button, DeviceEventEmitter, NativeModules, BackHandler  } from 'react-native';
import TopBar from '../components/topbar';
import { p2dWidth, parseTime } from '../js/utils';
import {Picker} from '@react-native-picker/picker';
import Conf from '../js/conf';
import {AddBlankLine, AddTextContent, AddImageContent} from '../js/ticketHelper';
import {store} from "../store/store";
import api from "../js/cloudApi";
import UpgradeModal from '../components/upgrade';


class Setting extends Component {
  constructor() {
    super();
    this.state = {
      //层
      selectedRow: '1',
      //列
      selectedColumn: '1',
      //按钮状态
      btnDisabled: {
        track: false,
        print: false,
        upgrade: false
      },
      //
      currentAppVersion: Conf.appVersion,
      //层数据
      rowData: ['1'],
      //列数据
      columnData: ['1'],
      //版本信息
      versionInfo: {
        embed_version: '',
        current_version: '',
        equipment_type: '',
        equipment_id: '',
        mac: '' 
      },
      upgradeData: {},
    };
    this.queue = new Set();
  }

  componentDidMount(){
    console.debug('go page 【setting】');
    this.emitListener = DeviceEventEmitter.addListener('out_callback', res => {
      NativeModules.RaioApi.info({msg: `setting page out callback, ${JSON.stringify(res)}`, method: 'setting.componentDidMount'}, null);
      for (let item of this.queue) {
        if(item.x===res.x && item.y===res.y){
          // 1：开始出货，2：等待用户取货，3：出货完成，负数：出货失败错误码
          if(res.type === 1 || res.type === 2){
            return;
          }
          if(res.type === 3){
            item.resolve();
          }else {
            item.reject(res.type);
          }
          this.queue.delete(item);
        }
      }
    });
    //获取版本数据信息
    let equipmentInfo = store.getState().equipmentInfo;
    try{
      //药道信息
      let slotInfo = JSON.parse(equipmentInfo.drug_channel);
      slotInfo.aisleX = Number(slotInfo.aisleX) || 1;
      slotInfo.aisleY = Number(slotInfo.aisleY) || 1;
      let row = Array(slotInfo.aisleY).toString().split(',').map((item, idx) => `${idx + 1}`);
      this.setState({rowData: row});
      let column = Array(slotInfo.aisleX).toString().split(',').map((item, idx) => `${idx + 1}`);
      this.setState({columnData: column});
      //版本信息
      let versionInfo = equipmentInfo.equipment_version_info;
      //设备类型信息
      let equipmentTypeInfo = equipmentInfo.equipment_type_info;
      let obj = {
        current_version: versionInfo.current_version,
        embed_version: versionInfo.embed_version,
        equipment_type: equipmentTypeInfo.type,
        equipment_id: equipmentInfo.id,
        mac: equipmentInfo.mac, 
      }
      this.setState({versionInfo: obj});
    }catch(e){
      NativeModules.RaioApi.error({msg: 'setting page store equipmentInfo error' , method: 'setting.componentDidMount'}, null);  
    }
  }
  componentWillUnmount(){
    console.debug('destroy page 【setting】');
    DeviceEventEmitter.removeListener('out_callback');
    this.emitListener = null;
  }
  setSelectedRow(value, index){
    //console.info(`row ${value}${typeof value}-${index}`);
    this.setState({ selectedRow: value });
  }
  setSelectedColumn(value, index){
    //console.info(`column ${value}${typeof value}-${index}`);
    this.setState({ selectedColumn: value });
  }
  out(x,y){
    NativeModules.RaioApi.debug({msg: `call out input x=${x},y=${y}`, method: 'setting.out'}, null);
    return new Promise((resolve, reject)=>{
      if(Conf.debug){
        setTimeout(()=>{
          resolve();
        },5000);
      } else {
        NativeModules.RaioApi.out(0, x, y,  res => {
          if(res ===0) {
            let obj = { resolve, reject, x,y };
            this.queue.add(obj);
          }else{
            reject(res);
          }
          setTimeout(()=>{
            reject('timeout');
          },30000);
        });
      }
    });
  }
  async testTrack(){
    try{
      if(this.state.btnDisabled.track) return;
      NativeModules.RaioApi.debug({msg: 'setting page testTrack start', method: 'setting.testTrack'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, track: true} });
      let x = Number(this.state.selectedColumn) - 1;
      let y = 6 - (Number(this.state.selectedRow) - 1);
      NativeModules.RaioApi.debug({msg: `setting page testTrack x=${x},y=${y}`, method: 'setting.testTrack'}, null);
      await this.out(x, y);
      this.setState({ btnDisabled: {...this.state.btnDisabled, track: false} }); 
      NativeModules.RaioApi.debug({msg: 'setting page testTrack end', method: 'setting.testTrack'}, null);
    }catch(e){
      NativeModules.RaioApi.error({msg: `setting page testTrack error=${e.message}` , method: 'setting.testTrack'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, track: false} });  
    }
  }
  async testPrint(){
    try {
      if(this.state.btnDisabled.print) return;
      NativeModules.RaioApi.debug({msg: 'setting page testPrint start', method: 'setting.testPrint'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, print: true} });
      let ticket_template_info_list = [];
      //标题
      let ticket_title = '欧药师智能药机';
      let obj = AddTextContent(ticket_title, 1, 1, 1);
      ticket_template_info_list.push(obj);
      //间隔
      let arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);
      //日期
      let op_date_text = "日  期: " + parseTime(new Date(), '{y}-{m}-{d} {h}:{i}');
      obj = AddTextContent(op_date_text, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //药机名称
      let equipmentName = "药  机: 测试药机" ;
      obj = AddTextContent(equipmentName, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //流水号
      let serial_no = "流水号: 123456789" ;
      obj = AddTextContent(serial_no, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //间隔
      arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      let recode_title = "编号/品名           单价        数量       小计";
      obj = AddTextContent(recode_title, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //分隔符
      let separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //药品
      let content = `1. 莲花清瘟`;
      obj = AddTextContent(content, 0, 0, 1, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      let price = '1.23';
      let count = '2';
      let amount = '2.46';
      content = price.padStart(24, ' ') + count.padStart(12, ' ') + amount.padStart(12, ' ');
      obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      content = `规    格：100mg`;
      obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      content = `生产厂家： 哈药六厂`;
      obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      //间隔
      arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      //分隔符
      separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      let total_product_count = `数量合计：2`;
      obj = AddTextContent(total_product_count, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      let total_amount = `金额合计：2.46`;
      obj = AddTextContent(total_amount, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      //间隔
      arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      let phone = `客服电话：400400123`;
      obj = AddTextContent(phone, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      
      let remark = `谢谢惠顾，欢迎再次使用！`;
      obj = AddTextContent(remark, 1, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      this.printTicket(ticket_template_info_list);
      NativeModules.RaioApi.debug({msg: 'setting page testPrint end', method: 'setting.testPrint'}, null);
      setTimeout(() => {
        this.setState({ btnDisabled: {...this.state.btnDisabled, print: false} });
      }, 5000);
    }catch (e) {
      NativeModules.RaioApi.error({msg: `setting page testPrint error=${e.message}`, method: 'setting.testPrint'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, print: false} });  
    }
  }
  printTicket(ticket_template_info_list){
    if(Conf.debug){
      return;
    }
    for(let i=0;i<ticket_template_info_list.length;i++){
      let item = ticket_template_info_list[i];
      if(item.type==='text'){
        NativeModules.RaioApi.printText(item.str,item.align,item.size,item.bold,(i===ticket_template_info_list.length-1?1:0),(res)=>{
        });
      }
      if(item.type==='image'){
        NativeModules.RaioApi.printImage(item.image_info,item.align,(i===ticket_template_info_list.length-1?1:0),(res)=>{
        });
      }
    }
  }
  exitApp(){
    Alert.alert('提示', '确定退出App?', [ {text:"确定", onPress: () => { BackHandler.exitApp() }}, {text:"取消"}] );
  }
  async upgrade(){
    try{
      if(this.state.btnDisabled.upgrade) return;
      NativeModules.RaioApi.debug({msg: 'setting page upgrade start', method: 'setting.upgrade'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, upgrade: true} });
      let data = await api.getUpgradeInfo({equipment_id: this.state.versionInfo.equipment_id, mac: this.state.versionInfo.mac, app_version: Conf.appVersion});
      
      if(data && data.app_version_info){
        NativeModules.RaioApi.debug({msg: `setting page getUpgradeInfo success, data=${JSON.stringify(data)}` , method: 'setting.upgrade'}, null);
        if(data.app_version_info.refresh_version && (data.app_version_info.refresh_version != data.app_version_info.current_version)){
          this.setState({upgradeData: data.app_version_info});
          this.refs.upModal.showModal();
        }else{
          Alert.alert('', '未检测到新版本', [ {text:"确定"} ]);   
        }
      }else{
        Alert.alert('', '获取版本更新数据失败', [ {text:"确定"} ]);
        NativeModules.RaioApi.error({msg: `setting page getUpgradeInfo fail, data=${JSON.stringify(data)}`, method: 'setting.upgrade'}, null);  
      }
      NativeModules.RaioApi.debug({msg: 'setting page upgrade end', method: 'setting.upgrade'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, upgrade: false} });
    }catch(e){
      NativeModules.RaioApi.error({msg: `setting page upgrade error=${e.message}`, method: 'setting.upgrade'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, upgrade: false} });    
    }
  }
  confirmCallback(){
    if(this.refs.upModal) this.refs.upModal.cancel();
  }
  render() {
    return (
      <View style={ { display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TopBar pageName='维护模式' disableCount={true} navigation={this.props.navigation} />
        <View style={customStyle.container}>
          <View style={ customStyle.container }>
            <ScrollView style={ customStyle.scroll }>
              <Text style={customStyle.textLabel} >硬件测试</Text>
              <View style={customStyle.itemContainer}>
                <Text style={{flexShrink: 0}}>履带测试</Text> 
                <View style={{flexGrow: 1}}>
                  <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flexGrow: 0, width: 100}}>
                      <Picker selectedValue={this.state.selectedRow} style={{ height: 50, width: 'auto' }} onValueChange={this.setSelectedRow.bind(this)} >
                        {
                          this.state.rowData.map((item, idx) => <Picker.Item key={item} label={item} value={item} /> )
                        }
                      </Picker>
                    </View>
                    <View style={{flexShrink: 0, marginRight: p2dWidth(20)}}><Text>层</Text></View>
                    <View style={{flexGrow: 0, width: 100}}>
                      <Picker selectedValue={this.state.selectedColumn} style={{ height: 50, width: 'auto' }} onValueChange={this.setSelectedColumn.bind(this)} >
                        {
                          this.state.columnData.map((item, idx) => <Picker.Item key={item} label={item} value={item} /> )
                        }
                      </Picker>
                    </View>
                    <View style={{flexShrink: 0, marginRight: p2dWidth(20)}}><Text>列</Text></View>
                  </View>
                </View>
                <Button color="#00BFCE" disabled={this.state.btnDisabled.track} style={{flexShrink: 0}} title="开始测试" onPress={this.testTrack.bind(this)} />
              </View>
              <View style={[customStyle.itemContainer, customStyle.itemContainer2]}>
                <Text style={{flexShrink: 0}}>打印机测试</Text> 
                <Button color="#00BFCE" disabled={this.state.btnDisabled.print} style={{flexShrink: 0}} title="开始测试" onPress={this.testPrint.bind(this)} />
              </View>
              <Text style={customStyle.textLabel} >关于本机</Text>
              <View style={customStyle.itemContainer3}>
                {/* <View style={customStyle.itemContainer4}>
                  <View style={{flexShrink: 0, width: p2dWidth(360)}}><Text>嵌入式版本</Text></View>
                  <View style={{flexGrow: 1}}><Text>{this.state.versionInfo.embed_version}</Text></View>  
                </View>  */}
                <View style={customStyle.itemContainer4}>
                  <View style={{flexShrink: 0, width: p2dWidth(280)}}><Text>软件版本</Text></View> 
                  <View style={{flexGrow: 1}}><Text>{this.state.currentAppVersion}</Text></View> 
                  <Button color="#00BFCE" disabled={this.state.btnDisabled.upgrade} style={{flexShrink: 0}} title="检查更新" onPress={this.upgrade.bind(this)} /> 
                </View>
                <View style={customStyle.itemContainer4}>
                  <View style={{flexShrink: 0, width: p2dWidth(280)}}><Text>本机型号</Text></View>
                  <View style={{flexGrow: 1}}><Text>{this.state.versionInfo.equipment_type}</Text></View>  
                </View>
                <View style={customStyle.itemContainer4}>
                  <View style={{flexShrink: 0, width: p2dWidth(280)}}><Text>退出程序</Text></View>
                  <View style={{flexGrow: 1}}></View>  
                  <Button color="#00BFCE" style={{flexShrink: 0}} title="退出程序" onPress={this.exitApp.bind(this)} />
                </View> 
              </View>
            </ScrollView>
          </View>
        </View>

        <UpgradeModal ref="upModal" upgradeData={this.state.upgradeData} />
      </View>
    )
  }
}
//$conf.theme
const customStyle = StyleSheet.create({
  container:{
    flexGrow: 1,
    width: "100%",
    position:"relative"
  },
  scroll:{
    width:"100%",
    position:"absolute",
    height:"100%",
    backgroundColor:"#E1E1E1"
  },
  textLabel:{
    fontSize: p2dWidth(42),
    fontFamily: "PingFangSC-Semibold, PingFang SC",
    fontWeight: "800",
    color: "#333333",
    lineHeight: p2dWidth(50),
    paddingLeft: p2dWidth(40),
    paddingRight: p2dWidth(40),
    paddingTop: p2dWidth(40),
    paddingBottom: p2dWidth(20),
    letterSpacing: 1
  },
  itemContainer:{
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center' ,
    marginLeft: p2dWidth(40),
    marginRight: p2dWidth(40),
    padding: p2dWidth(10),
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.6)',
    borderStyle: 'solid',
    borderRadius: 4,
  },
  itemContainer2:{
    marginTop: p2dWidth(20),
    justifyContent: "space-between",
  },
  itemContainer3:{
    marginLeft: p2dWidth(40),
    marginRight: p2dWidth(40),
    padding: p2dWidth(10),
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.6)',
    borderStyle: 'solid',
    borderRadius: 4,
  },
  itemContainer4:{
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center' ,
    padding: p2dWidth(10),
  },
});

export default Setting;