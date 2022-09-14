import React, {Component} from 'react';
import {store} from '../store/store';
import {upgradeEquipmentInfo, upgradeStatusFlag} from '../action';
import {
  ImageBackground,
  TouchableOpacity,
  View,
  Image,
  Text,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import api from '../js/cloudApi';
import {EquipmentStatus} from '../js/common';
import {p2dHeight, p2dWidth} from '../js/utils';
import OperateModal from '../components/operator';
import Conf from '../js/conf';
import {updateToken} from '../action/index';

class start extends Component {
  constructor() {
    super();

    this.state = {
      equipmentInfo: {},
    };

    this.retryTimer = null;
    this.clickTimer = null;
    this.clickIndex = 0;
    this.heartbeatFailCount = 0;
  }

  async componentDidMount() {
    try {
      await this.vendorInit();
    } catch (e) {
      console.error('start page componentDidMount vendorInit error, err=%o', e);
      NativeModules.RaioApi.error(
        {
          msg: `start page componentDidMount vendorInit error=${e.message}`,
          method: 'start.componentDidMount',
        },
        null,
      );
    }

    try {
      await this.setToken();
    } catch (e) {
      console.log('Set token error in start page');
    }

    try {
      await this.retry();
    } catch (e) {
      console.error('start page componentDidMount retry error, err=%o', e);
      NativeModules.RaioApi.error(
        {
          msg: `start page componentDidMount retry error=${e.message}`,
          method: 'start.componentDidMount',
        },
        null,
      );
    }
  }

  async setToken() {
    let res = await api.getToken({appId: '1', appSecret: '1'});
    console.log(res, 'res.setToken');
    const action = updateToken(res.data.token);
    store.dispatch(action);
    console.log(res, 'setToken-end');
  }

  async retry() {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
    }
    let equipmentInfo = await this.getEquipmentInfo();
    if (equipmentInfo?.id) {
      this.heartbeat(equipmentInfo.id);
    } else {
      this.retryTimer = setTimeout(async () => {
        this.retry();
      }, 10000);
    }
  }
  addClickIndex() {
    if (this.clickTimer !== null) {
      clearTimeout(this.clickTimer);
    }
    this.clickIndex++;
    this.clickTimer = setTimeout(() => {
      this.clickIndex = 0;
    }, 5000);
    if (this.clickIndex >= 5) {
      this.clickIndex = 0;
      this.refs.opModal.showModal();
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
  componentWillUnmount() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
    }
    if (this.clickTimer !== null) {
      clearTimeout(this.clickTimer);
    }
  }

  vendorInit() {
    return new Promise((resolve, reject) => {
      if (Conf.debug) {
        console.info('vendor init success, debug mode');
        NativeModules.RaioApi.debug(
          {msg: 'vendor init success, debug mode', method: 'start.vendorInit'},
          null,
        );
        resolve();
      } else {
        NativeModules.RaioApi.init((res) => {
          if (res === 0) {
            console.info(`vendor init success, ${res}`);
            NativeModules.RaioApi.debug(
              {msg: `vendor init success, ${res}`, method: 'start.vendorInit'},
              null,
            );
            resolve();
          } else {
            console.info(`vendor init fail, ${JSON.stringify(res)}`);
            NativeModules.RaioApi.debug(
              {
                msg: `vendor init fail, ${JSON.stringify(res)}`,
                method: 'start.vendorInit',
              },
              null,
            );
            reject(res);
          }
        });
      }
    });
  }

  async getEquipmentInfo() {
    try {
      let mac = await this.getMac();
      let res = await api.getEquipmentInfo(null, mac);
      if (res?.equipment_info) {
        let equipmentInfo = res.equipment_info;
        //获取设备详情
        const equipmentInfoDetailRes = await api.getEquipmentDetail(
          equipmentInfo.id,
          equipmentInfo.mac,
        );
        if (
          equipmentInfoDetailRes &&
          equipmentInfoDetailRes.equipment_detail_info
        ) {
          console.info(
            'start page, getEquipmentInfo,getEquipmentDetail success %o, %o',
            equipmentInfo,
            equipmentInfoDetailRes,
          );
          NativeModules.RaioApi.debug(
            {
              msg: `start page, getEquipmentInfo,getEquipmentDetail success, ${JSON.stringify(
                equipmentInfo,
              )}, ${JSON.stringify(equipmentInfoDetailRes)}`,
              method: 'start.getEquipmentInfo',
            },
            null,
          );
          const action = await upgradeEquipmentInfo(
            equipmentInfoDetailRes.equipment_detail_info,
          );
          store.dispatch(action);
        } else {
          console.info(
            'start page, getEquipmentInfo,getEquipmentDetail something wrong, %o, %o',
            equipmentInfo,
            equipmentInfoDetailRes,
          );
          NativeModules.RaioApi.debug(
            {
              msg: `start page, getEquipmentInfo,getEquipmentDetail something wrong, ${JSON.stringify(
                equipmentInfo,
              )}, ${JSON.stringify(equipmentInfoDetailRes)}`,
              method: 'start.getEquipmentInfo',
            },
            null,
          );
        }
        return equipmentInfo;
      } else {
        console.info('start page, getEquipmentInfo something wrong, %o', res);
        NativeModules.RaioApi.debug(
          {
            msg: `start page, getEquipmentInfo something wrong, ${JSON.stringify(
              res,
            )}`,
            method: 'start.getEquipmentInfo',
          },
          null,
        );
      }
    } catch (e) {
      console.info('start page, getEquipmentInfo fail, %o', e);
      NativeModules.RaioApi.debug(
        {
          msg: `start page, getEquipmentInfo fail, ${JSON.stringify(
            e.message,
          )}`,
          method: 'start.getEquipmentInfo',
        },
        null,
      );
      return false;
    }
  }

  async heartbeat(equipment_id) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(async () => {
      this.heartbeat(equipment_id);
    }, $conf.heartbeatInterval);
    let res = await api.heartbeat(equipment_id, 0, 0);
    if (!res) {
      this.heartbeatFailCount++;
      //心跳失败超过3次
      if (this.heartbeatFailCount > 3) {
        this.props.navigation.navigate('start');
      }
    } else {
      this.heartbeatFailCount = 0;
    }
    if (res && res.hasOwnProperty('equipment_status')) {
      if (res.equipment_status === EquipmentStatus.ES_Stop) {
        //todo 设备停用
        console.debug('equipment has been stopped');
        this.props.navigation.navigate('start');
      } else {
        let isFocused = this.props.navigation.isFocused();
        if (isFocused) {
          this.props.navigation.navigate('home');
        }
      }
    }
    if (res && res.hasOwnProperty('status_flag')) {
      let state = store.getState();
      let pickupStatus = state.pickupStatus;
      //设备取药中 不做任何操作
      if (pickupStatus) {
        //正在取药中
        console.debug(
          'the equipment is pickuping,no need to syncEquipmentInfo',
        );
        return;
      }

      let status_flag = state.statusFlag;
      // 设备发生变更
      if (status_flag !== res.status_flag) {
        console.debug('status_flag changed.');
        if (status_flag) {
          await this.getEquipmentInfo();
        }
        const action = upgradeStatusFlag(res.status_flag);
        store.dispatch(action);
      }
    }
  }

  render() {
    return (
      <ImageBackground
        style={{width: '100%', height: '100%'}}
        imageStyle={{width: '100%', height: '100%'}}
        source={require('../assets/home2.png')}>
        <View>
          <Text
            style={{
              width: '100%',
              position: 'absolute',
              textAlign: 'center',
              top: p2dHeight(600),
              height: p2dHeight(112),
              lineHeight: p2dHeight(112),
              fontSize: p2dWidth(60),
              fontWeight: 'bold',
              color: '#fff',
              letterSpacing: p2dWidth(8),
            }}>
            加载中...
          </Text>
        </View>

        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: p2dWidth(100),
            height: p2dWidth(100),
          }}
          onPress={() => this.addClickIndex()}
        />

        <OperateModal ref="opModal" />
      </ImageBackground>
    );
  }
}

export default start;
