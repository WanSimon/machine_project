
import React, { Component } from 'react';
import { Modal, StyleSheet, Alert, View, Text, TouchableOpacity, Animated, Easing, ScrollView, NativeModules, BackHandler, Button } from 'react-native';
import { p2dWidth } from '../js/utils';
import api from "../js/cloudApi";
import { downloadApk } from 'rn-app-upgrade';

class Upgrade extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      txtValue: '',
      opacityValue: new Animated.Value(0),
      btnDisabled: {
        upgrade: false,
        ignore: false,
        btn: false,
      },
      apkData: {
        received: '', 
        total: '', 
        percent: 0 
      }
    };
  }
  showError(){
    Animated.sequence([
      Animated.timing(
        this.state.opacityValue,
        {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true
        }
      ),
      Animated.timing(
        this.state.opacityValue,
        {
          toValue: 0,
          duration: 2500,
          easing: Easing.ease,
          useNativeDriver: true
        }
      )
    ]).start();
  }
  showModal(){
    this.setState({
      modalVisible: true
    });
  }
  confirm(){
    if(this.state.btnDisabled.btn) return;
    NativeModules.RaioApi.debug({msg: 'setting page upgrade components confirm func start'}, null);
    this.setState({ btnDisabled: {...this.state.btnDisabled, btn: true} });
    downloadApk({
      interval: 666, 
      //apkUrl: "http://47.114.162.91:3000/app-debug.apk",
      //apkUrl: "http://47.114.162.91:3000/vendor_V0103.R002.SP05.apk",
      apkUrl: this.props.upgradeData.download_url,
      downloadInstall: true,
      callback: {
        onProgress: (received, total, percent) => {
          console.info(received, total, percent);
          this.setState({ apkData: {received, total, percent} })
        },
        onFailure: (errorMessage, statusCode) => {
          console.info(errorMessage, statusCode);
          Alert.alert('', '下载失败, 请稍后再试! ', [ {text:"确定"} ]);
          this.setState({ btnDisabled: {...this.state.btnDisabled, btn: false} });
        },
        onComplete: () => {
          console.info('onComplete');
          this.setState({ apkData: { ...this.state.apkData, percent: 100, received: this.state.apkData.total } })
          //this.setState({ btnDisabled: {...this.state.btnDisabled, btn: false} });
          //setTimeout(() => {
          //  BackHandler.exitApp();
          //}, 5000);
        },
      },
    });  
  }
  async cancel(){
    try{
      if(this.state.btnDisabled.btn) return;
      NativeModules.RaioApi.debug({msg: 'setting page upgrade components cancel func start'}, null);
      this.setState({ btnDisabled: {...this.state.btnDisabled, btn: true} });
      let ret = await api.ignoreUpgrade( {equipment_id: this.props.upgradeData.equipment_id} );
      if(ret){
        this.setState({ modalVisible:false });
      }else{
        Alert.alert('', '操作失败, 请稍后再试! ', [ {text:"确定"} ]);
      }
    }catch(e){
      NativeModules.RaioApi.debug({msg: 'setting page upgrade components cancel func err', data: e.message || e}, null);
    }
    this.setState({ btnDisabled: {...this.state.btnDisabled, btn: false} });
    NativeModules.RaioApi.debug({msg: 'setting page upgrade components cancel func end'}, null);
  }
  render() {
    return (
      <Modal animationType="fade" transparent={true} visible={this.state.modalVisible} >
        <View style={customStyle.modalContainer}>
          <View style={customStyle.modalContent}>
            <View style={customStyle.headerContent}>
              <Text style={{fontSize: 16, fontWeight: "800", textAlign:'center'}}>发现新版本</Text>
              { this.props.upgradeData.refresh_version ? <Text style={{fontSize: 16, fontWeight: "600", textAlign:'center'}}>{this.props.upgradeData.refresh_version}</Text> : null}
            </View>
            <ScrollView style={customStyle.sectionContent}>
              {
                Array.isArray(this.props.upgradeData.modify_contents) && this.props.upgradeData.modify_contents.map((item, idx) => <View key={idx} style={{paddingLeft: p2dWidth(40), paddingRight: p2dWidth(40), paddingBottom: p2dWidth(10)}}><View><Text>【{item.refresh_type}】 {item.content}</Text></View></View>) 
              }
            </ScrollView>
            <View style={{ width: '100%', marginTop: 10, opacity: 1 }}>
              {
                this.state.apkData.percent == 100 ?  
                <Text style={{color: '#808080', textAlign: 'center'}}>正在安装中,请勿断电,请稍后...</Text>: (this.state.apkData.total ? <Text style={{color: '#808080', textAlign: 'center'}}>{this.state.apkData.received} / {this.state.apkData.total} ( {this.state.apkData.percent}% )</Text> : <Text>&nbsp;</Text>)
              } 
            </View>
            <View style={customStyle.actionContent}>
              {
                this.props.upgradeData.is_force ?
                null :
                <TouchableOpacity style={[customStyle.button1, this.state.btnDisabled.btn ? customStyle.button3 : {}]} onPress={() => this.cancel()}>
                  <Text style={customStyle.buttonLabel}>忽略本次更新</Text>
                </TouchableOpacity>
              }
              <TouchableOpacity style={[customStyle.button2, this.state.btnDisabled.btn ? customStyle.button3 : {}]} onPress={() => this.confirm()}>
                <Text style={customStyle.buttonLabel}>立即更新</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

}

const customStyle = StyleSheet.create({
  modalContainer:{
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  modalContent:{
    marginLeft: '16%',
    marginRight: '16%',
    backgroundColor: "white",
    maxWidth: p2dWidth(960),
    paddingBottom: p2dWidth(40),
    borderRadius: 8,
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: '65%',
  },
  headerContent:{
    marginTop: p2dWidth(40),
  },
  sectionContent:{
    width: '100%',
    marginTop: p2dWidth(40),
  },
  actionContent:{
    width: '100%',
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    marginTop: p2dWidth(40),
  },
  button1:{
    width: '40%',
    maxWidth: p2dWidth(240),
    fontSize:p2dWidth(32),
    backgroundColor: '#00BFCE',
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    borderRadius: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
  button2:{
    width: '40%',
    maxWidth: p2dWidth(240),
    fontSize:p2dWidth(32),
    backgroundColor: '#00BFCE',
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    borderRadius: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
  button3:{
    backgroundColor: '#808080',  
  },
  buttonLabel:{
    color: '#FFFFFF',
    letterSpacing: 1
  }
});


export default Upgrade;