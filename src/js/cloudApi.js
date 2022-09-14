import Conf from '../js/conf';
import {NativeModules} from 'react-native';
import {getSign} from '../js/utils';
import {store} from '../store/store';

const router = {
  //heartbeat:'/xy.server/req_heartbeat',
  heartbeat: '/equipment/heartbeat',
  //getEquipmentInfo:'/xy.server/req_get_equipment_info',
  getEquipmentInfo: '/equipment/getEquipmentInfo',
  getEquipmentDetail: '/equipment/getEquipmentInfoDetail',
  //submitOrder:'/xy.server/req_submit_order',
  submitOrder: '/ceorder/submitOrder',
  //pay:'/xy.server/req_pay',
  //pay:'/pay/toPay',
  pay: '/ceorder/pay',
  //getPayStatus:'/xy.server/req_get_pay_status',
  //getPayStatus:'/xy.server/req_get_pay_status',
  getPayStatus: '/ceorder/getPayStatus',
  //getOrderInfo:'/xy.server/req_get_order_info',
  getOrderInfo: '/ceorder/getOrderInfo',
  //updateEquipmentProduct:'/xy.server/req_equipment_product_changed',
  updateEquipmentProduct: '/inventory/updateEStock',
  uploadApiLog: '/merchant/uploadAppLog',
  getEquipmentProductByCode: '/equipment/getEProductByCode',
  updateOrderStatus: '/ceorder/updateOrderStatus',
  getUpgradeInfo: '/equipment/getAppVersionRefreshInfo',
  ignoreUpgrade: '/equipment/ignoreRefresh',
  getQrCode: '/user/login/qrcode',
  getUserInfo: '/user/info',
  getToken: '/tonsil/auth/authenticate',
};

const ignoreRouter = ['/equipment/heartbeat'];

class CloudApi {
  constructor() {
    this.url = Conf.cloudUrl;
    this.token = store.getState().token;
  }

  async _request(method, route, data) {
    let options = {
      //请求方式
      method,
      //请求头定义
      headers: {
        Authorization: 'Bearer ' + this.token,
        'Content-Type': 'application/json; charset=utf-8',
        loginType: 1, //设备登录
      },
    };
    data = data || {};
    if (method.toLowerCase() == 'post') {
      data.sig = getSign(data, Conf.sign);
      data.appId = Conf.sign.appId;
    }
    options.body = JSON.stringify(data);

    if (!ignoreRouter.includes(route)) {
      NativeModules.RaioApi.debug(
        {
          msg: `request route ${route}, send data = ${JSON.stringify(
            options.body,
          )}`,
        },
        null,
      );
      console.debug(`request route ${route}, send data ${options.body}`);
    }

    return new Promise(async (resolve, reject) => {
      let timer = setTimeout(() => {
        if (!ignoreRouter.includes(route)) {
          NativeModules.RaioApi.debug(
            {msg: `response route ${route} timeout`},
            null,
          );
          console.debug(`response route ${route} timeout`);
        }
        reject(new Error('timeout'));
      }, 10000);
      try {
        let res = await fetch(this.url + route, options);
        clearTimeout(timer);
        if (res.status >= 200 && res.status < 500) {
          let resObj = await res.json();
          //console.debug(`response route ${route} success, data=${JSON.stringify(resObj)}`);
          if (!resObj) {
            if (!ignoreRouter.includes(route)) {
              NativeModules.RaioApi.debug(
                {msg: `response route ${route} no response`},
                null,
              );
              console.info(`response route ${route} no response`);
            }
            reject(new Error('no response'));
          } else {
            if (resObj.code && resObj.code != 1000) {
              let msg = resObj.msg || 'unknown error';
              if (!ignoreRouter.includes(route)) {
                NativeModules.RaioApi.debug(
                  {msg: `response route ${route} error, ${msg}`},
                  null,
                );
                console.info(`response route ${route} error2, ${msg}`);
              }
              reject(new Error(msg));
            } else {
              if (!ignoreRouter.includes(route)) {
                NativeModules.RaioApi.debug(
                  {
                    msg: `response route ${route} success, data=${JSON.stringify(
                      resObj.data,
                    )}`,
                  },
                  null,
                );
                console.debug(
                  `response route ${route} success, data=${JSON.stringify(
                    resObj.data,
                  )}`,
                );
              }
              resolve(resObj.data);
            }
          }
        } else {
          const error = new Error(res.statusText);
          error.response = res;
          if (!ignoreRouter.includes(route)) {
            NativeModules.RaioApi.debug(
              {msg: `response route ${route} error`},
              null,
            );
            console.info(
              `response route ${route} error1 ${JSON.stringify(res)}`,
            );
          }
          reject(error);
        }
      } catch (e) {
        if (!ignoreRouter.includes(route)) {
          NativeModules.RaioApi.debug(
            {msg: `response route ${route} error, ${e.message}`},
            null,
          );
          console.info(`response route ${route} error3 ${e.message}`);
        }
        reject(e);
      }
    });
  }

  async heartbeat(equipment_id, temperature, humidity, status) {
    console.log('hearbeat starting.');
    console.debug(
      'input<->equipment_id=%s,temperature=%f,humidity=%f',
      equipment_id,
      temperature,
      humidity,
    );
    if (!equipment_id) {
      console.info('hearbeat failed, equipment_id is empty!');
      return null;
    }
    let res = null;
    try {
      res = await this._request('POST', router.heartbeat, {
        equipment_id,
        temperature,
        humidity,
      });
    } catch (e) {
      console.info('request req_heartbeat crash!!err=%o', e);
    }
    console.log('hearbeat finished');
    return res;
  }

  async getQrCode() {
    let res = null;

    try {
      res = await this._request('GET', router.getQrCode);
    } catch (e) {
      console.info('Get Qrcode error');
    }
    return res;
  }

  async getUserInfo(sceneStr) {
    let res = null;
    try {
      res = await this._request('POST', router.getUserInfo, {sceneStr});
    } catch (e) {
      console.info('Get user info error');
    }
    return res;
  }

  async getEquipmentInfo(equipment_id, mac) {
    console.log('getEquipmentInfo starting.');
    console.debug('input<->equipment_id=%s,mac=%s', equipment_id, mac);
    let res = null;
    try {
      res = await this._request('POST', router.getEquipmentInfo, {
        equipment_id,
        mac,
      });
    } catch (e) {
      console.info('request req_get_equipment_info crash!!err=%o', e.message);
    }
    console.log('getEquipmentInfo finished');
    return res;
  }

  //获取设备详情
  async getEquipmentDetail(equipment_id, mac) {
    console.log('getEquipmentDetail starting.');
    console.debug('input<->equipment_id=%s,mac=%s', equipment_id, mac);
    let res = null;
    try {
      res = await this._request('POST', router.getEquipmentDetail, {
        equipment_id,
        mac,
      });
    } catch (e) {
      console.info('request getEquipmentDetail crash!!err=%o', e);
    }
    console.log('getEquipmentDetail finished');
    return res;
  }

  /**
   * 提交订单
   * @param id 订单id
   * @param inner_order_no 内部编号
   * @param outer_order_no 外部编号
   * @param serial_no 流水号
   * @param merchant_id 商户id
   * @param equipment_id 设备id
   * @param amount 金额
   * @param customer_amount 会员金额
   * @param pay_amount 实际支付金额
   * @param pay_type 支付方式
   * @param pay_status 支付状态
   * @param buy_way 购买方式
   * @param order_source 订单来源
   * @param customer_id 会员id
   * @param pick_up_code 取货码
   * @param pick_up_type 取货方式
   * @param pay_order_no 支付订单编号
   * @param id_card 身份证号码
   * @param medical_insurance_card 医保卡号
   * @param {Array} order_detail_info_list 订单详情 [{
					//订单id
					"id":"dafaf",
					//商品编号
					"product_id:"dafaf",
					//批次
					"batch_number:"34343434",
					//批号
					"batch:"34343434",
					//金额
					"amount:"50,
					//会员价
					"customer_amount:"60,
					//单价
					"unit_price:"70,
					//会员单价
					"customer_price:"80,
					//数量
					"product_count:"90
				}]
   * */
  async submitOrder(orderInfo) {
    console.log('SubmitOrder starting.');
    console.debug('input<->orderInfo:%s', orderInfo);
    let res = null;
    try {
      res = await this._request('POST', router.submitOrder, {
        order_info: orderInfo,
      });
    } catch (e) {
      console.info('request req_submit_order crash!!err=%o', e);
    }
    console.log('SubmitOrder finished');
    return res;
  }

  async pay(payInfo) {
    console.log('pay starting.');
    console.debug('input<->payInfo:%s', payInfo);
    let res = null;
    try {
      res = await this._request('POST', router.pay, payInfo);
    } catch (e) {
      console.info('request pay crash!!err=%o', e);
    }
    console.log('pay finished');
    return res;
  }

  async getPayStatus(trade_no) {
    console.log('getPayStatus starting.');
    console.debug('input<->trade_no:%s', trade_no);
    let res = null;
    try {
      res = await this._request('POST', router.getPayStatus, {trade_no});
    } catch (e) {
      console.info('request getPayStatus crash!!err=%o', e);
    }
    console.log('getPayStatus finished');
    return res;
  }

  async getOrderInfo(order_id) {
    console.log('getOrderInfo starting.');
    console.debug('input<->order_id:%s', order_id);
    let res = null;
    try {
      res = await this._request('POST', router.getOrderInfo, {order_id});
    } catch (e) {
      console.info('request getOrderInfo crash!!err=%o', e);
    }
    console.log('getOrderInfo finished');
    return res.order_info;
  }

  async updateEquipmentProduct(equipmentProductChangeInfo) {
    console.log('updateEquipmentProduct starting.');
    console.debug(
      'input<->equipmentProductChangeInfo=%s',
      equipmentProductChangeInfo,
    );
    let res = null;
    try {
      res = await this._request(
        'POST',
        router.updateEquipmentProduct,
        equipmentProductChangeInfo,
      );
    } catch (e) {
      console.info('request req_equipment_product_changed crash!!err=%o', e);
    }
    console.log('updateEquipmentProduct finished');
    return res;
  }

  async uploadAppLog(logObj) {
    console.log('uploadAppLog starting.');
    console.debug('input<->logObj=%s', logObj);
    let res = null;
    try {
      res = this._request('POST', router.uploadApiLog, logObj);
    } catch (e) {
      console.info('request uploadAppLog crash!!err=%s', e);
    }
    console.log('uploadAppLog finished');
    return res;
  }

  async getEquipmentProductByCode(equipment_id, pick_up_code) {
    console.log('getEquipmentProductByCode starting.');
    console.debug(
      'input<->equipment_id=%s,pick_up_code=%s',
      equipment_id,
      pick_up_code,
    );
    let res = null;
    try {
      res = await this._request('POST', router.getEquipmentProductByCode, {
        equipment_id,
        pick_up_code,
      });
    } catch (e) {
      console.info('request getEquipmentProductByCode crash!!err=%o', e);
    }
    console.log('getEquipmentProductByCode finished');
    return res;
  }

  async updateOrderStatus(order_id, status) {
    console.log('updateOrderStatus starting.');
    console.debug('input<->order_id=%s,status=%d', order_id, status);
    let res = null;
    try {
      res = await this._request('POST', router.updateOrderStatus, {
        order_id,
        status,
      });
      console.debug('res<->%s', res);
    } catch (e) {
      console.info('request updateOrderStatus crash!!err=%o', e);
    }
    console.log('updateOrderStatus finished');
    return res;
  }

  async getUpgradeInfo(obj) {
    console.log('getUpgradeInfo starting.');
    console.debug('input<->%o', obj);
    let res = null;
    try {
      res = await this._request('POST', router.getUpgradeInfo, {...obj});
    } catch (e) {
      console.info('request updateOrderStatus crash!!err=%o', e);
    }
    console.log('getUpgradeInfo finished');
    return res;
  }

  async ignoreUpgrade(obj) {
    console.log('ignoreUpgrade starting.');
    console.debug('input<->%o', obj);
    let res = null;
    try {
      await this._request('POST', router.ignoreUpgrade, {...obj});
      res = true;
    } catch (e) {
      console.info('request ignoreUpgrade crash!!err=%o', e);
    }
    console.log('ignoreUpgrade finished');
    return res;
  }

  async getToken(obj) {
    let res = null;
    try {
      console.log('getToken11');
      res = await this._request('POST', router.getToken, {...obj});
    } catch (e) {
      console.log('Get error');
    }
    return res;
  }
}

class WeiXinApi {
  constructor() {
    this.url = Conf.weixinUrl;
  }

  async _request(method, route, data) {
    let options = {
      //请求方式
      method,
      //请求头定义
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    };
    data = data || {};
    if (method.toLowerCase() == 'post') {
      data.sig = getSign(data, Conf.sign);
      data.appId = Conf.sign.appId;
    }
    options.body = JSON.stringify(data);

    if (!ignoreRouter.includes(route)) {
      NativeModules.RaioApi.debug(
        {
          msg: `request route ${route}, send data = ${JSON.stringify(
            options.body,
          )}`,
        },
        null,
      );
      console.debug(`request route ${route}, send data ${options.body}`);
    }

    return new Promise(async (resolve, reject) => {
      let timer = setTimeout(() => {
        if (!ignoreRouter.includes(route)) {
          NativeModules.RaioApi.debug(
            {msg: `response route ${route} timeout`},
            null,
          );
          console.debug(`response route ${route} timeout`);
        }
        reject(new Error('timeout'));
      }, 10000);
      try {
        let res = await fetch(this.url + route, options);
        clearTimeout(timer);
        if (res.status >= 200 && res.status < 500) {
          let resObj = await res.json();
          //console.debug(`response route ${route} success, data=${JSON.stringify(resObj)}`);
          if (!resObj) {
            if (!ignoreRouter.includes(route)) {
              NativeModules.RaioApi.debug(
                {msg: `response route ${route} no response`},
                null,
              );
              console.info(`response route ${route} no response`);
            }
            reject(new Error('no response'));
          } else {
            if (resObj.code && resObj.code != 1000) {
              let msg = resObj.msg || 'unknown error';
              if (!ignoreRouter.includes(route)) {
                NativeModules.RaioApi.debug(
                  {msg: `response route ${route} error, ${msg}`},
                  null,
                );
                console.info(`response route ${route} error2, ${msg}`);
              }
              reject(new Error(msg));
            } else {
              if (!ignoreRouter.includes(route)) {
                NativeModules.RaioApi.debug(
                  {
                    msg: `response route ${route} success, data=${JSON.stringify(
                      resObj.data,
                    )}`,
                  },
                  null,
                );
                console.debug(
                  `response route ${route} success, data=${JSON.stringify(
                    resObj.data,
                  )}`,
                );
              }
              resolve(resObj.data);
            }
          }
        } else {
          const error = new Error(res.statusText);
          error.response = res;
          if (!ignoreRouter.includes(route)) {
            NativeModules.RaioApi.debug(
              {msg: `response route ${route} error`},
              null,
            );
            console.info(
              `response route ${route} error1 ${JSON.stringify(res)}`,
            );
          }
          reject(error);
        }
      } catch (e) {
        if (!ignoreRouter.includes(route)) {
          NativeModules.RaioApi.debug(
            {msg: `response route ${route} error, ${e.message}`},
            null,
          );
          console.info(`response route ${route} error3 ${e.message}`);
        }
        reject(e);
      }
    });
  }

  async getWeiXinQrcode(ticket) {
    let res = null;
    try {
      res = await this._request('POST', ticket);
    } catch (e) {
      console.info('request ignoreUpgrade crash!!err=%o', e);
    }
    return res;
  }
}

const API = new CloudApi();

export const WeiXinAPI = new WeiXinApi();

export default API;
