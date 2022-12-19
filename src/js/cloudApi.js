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
  submitEOrder: '/order/submitEOrder',
  //pay:'/xy.server/req_pay',
  //pay:'/pay/toPay',
  orderPay: '/order/orderPay',
  //getPayStatus:'/xy.server/req_get_pay_status',
  //getPayStatus:'/xy.server/req_get_pay_status',
  getOrderPayStatus: '/order/getOrderPayStatus',
  //getOrderInfo:'/xy.server/req_get_order_info',
  getOrderInfo: '/order/getOrderInfo',
  //updateEquipmentProduct:'/xy.server/req_equipment_product_changed',
  updateEquipmentProduct: '/stock/updateEStock',
  uploadApiLog: '/merchant/uploadAppLog',
  getEquipmentProductByCode: '/equipment/getEProductByCode',
  updateOrderStatus: '/order/updateOrderStatus',
  // getUpgradeInfo: '/equipment/getAppVersionRefreshInfo',
  ignoreUpgrade: '/equipment/ignoreRefresh',
  getQrCode: '/auth/qrscan/getQrCode',
  getToken: '/auth/authenticate',
  checkQrLogin: '/auth/qrscan/checkQrLogin',
  pwdLogin: '/auth/pwdLogin',
  verifyCodeLogin: '/auth/verifyCodeLogin',
  getPatientMemberInfoList: '/user/getPatientMemberInfoList',
  getPatientRelateDoctorList: '/doctor/getPatientRelateDoctorList',
  updateOrderPayType: '/order/updateOrderPayType',
  getVerifyCode: '/auth/getVerifyCode',
  getEDrugStocks: '/stock/getEDrugStocks',
  updateEStock: '/stock/updateEStock',
  getEDrugStockDetail: '/stock/getEDrugStockDetail',
  getEProductStocks: '/stock/getEProductStocks',
  saveEquipmentProduct: '/equipment/saveEquipmentProduct ',
  getProductInfoByEquipmentId: '/product/getProductInfoByEquipmentId',
  getProductInfo: '/product/getProductInfo',
  updateDrugChannel: '/equipment/updateDrugChannel',
  unbind: '/equipment/unbind',
};

const ignoreRouter = ['/equipment/heartbeat'];

class CloudApi {
  constructor() {
    this.url = Conf.cloudUrl;
    this.token = store.getState().token; //不能正常使用
  }

  async _request(method, route, data) {
    let options = {
      //请求方式
      method,
      //请求头定义
      headers: {
        Authorization: 'Bearer ' + store.getState().token,
        'Content-Type': 'application/json; charset=utf-8',
        loginType: 1, //设备登录
      },
    };

    data = data || {};
    if (method.toLowerCase() == 'post') {
      data.sig = getSign(data, Conf.sign);
      if (!data.appId) {
        //在首次获取token的时候会传递appId不需要从config中获取
        data.appId = Conf.sign.appId;
      }
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
          console.debug(
            `response route ${route} success, data=${JSON.stringify(resObj)}`,
          );
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

  async heartbeat(equipmentId, temperature, humidity, status) {
    console.log('hearbeat starting.');
    console.debug(
      'input<->equipmentId=%s,temperature=%f,humidity=%f',
      equipmentId,
      temperature,
      humidity,
    );
    if (!equipmentId) {
      console.info('hearbeat failed, equipmentId is empty!');
      return null;
    }
    let res = null;
    try {
      res = await this._request('POST', router.heartbeat, {
        equipmentId,
        temperature,
        humidity,
      });
    } catch (e) {
      console.info('request req_heartbeat crash!!err=%o', e);
    }
    return res;
  }

  async getQrCode(orgId) {
    console.info('getQrCode starting');
    console.debug('input<-> orgId =%', orgId);
    let res = null;

    try {
      res = await this._request('POST', router.getQrCode, {orgId});
    } catch (e) {
      console.info('Get Qrcode error, error  info is ', e);
    }
    console.info('getOrCode finished');
    return res;
  }

  async getEquipmentInfo(equipmentId, mac) {
    console.log('getEquipmentInfo starting.');
    console.debug('input<->equipmentId=%s,mac=%s', equipmentId, mac);
    let res = null;
    try {
      res = await this._request('POST', router.getEquipmentInfo, {
        equipmentId,
        mac,
      });
    } catch (e) {
      console.info('request req_get_equipment_info crash!!err=%o', e.message);
    }
    console.log('getEquipmentInfo finished');
    return res;
  }

  //获取设备详情
  async getEquipmentDetail(equipmentId, mac) {
    console.log('getEquipmentDetail starting.');
    console.debug('input<->equipment_id=%s,mac=%s', equipmentId, mac);
    let res = null;
    try {
      res = await this._request('POST', router.getEquipmentDetail, {
        equipmentId,
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
   * @param equipmentId 设备id
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
  async submitEOrder(orderInfo) {
    console.log('SubmitOrder starting.');
    console.debug('input<->orderInfo:%s', orderInfo);
    let res = null;
    try {
      res = await this._request('POST', router.submitEOrder, {
        ...orderInfo,
      });
    } catch (e) {
      console.info('request req_submit_order crash!!err=%o', e);
    }
    console.log('SubmitOrder finished');
    return res;
  }

  async orderPay(payInfo) {
    console.log('orderPay starting.');
    console.debug('input<->=orderPay :%s', payInfo);
    let res = null;
    try {
      res = await this._request('POST', router.orderPay, payInfo);
    } catch (e) {
      console.info('request orderPay crash!!err=%o', e);
    }
    console.log('orderPay finished');
    return res;
  }

  async getOrderPayStatus(tradeNo) {
    console.log('getOrderPayStatus starting.');
    console.debug('input<->trade_no:%s', tradeNo);
    let res = null;
    try {
      res = await this._request('POST', router.getOrderPayStatus, tradeNo);
    } catch (e) {
      console.info('request getOrderPayStatus crash!!err=%o', e);
    }
    console.log('getOrderPayStatus finished');
    return res;
  }

  async getOrderInfo(orderId) {
    console.log('getOrderInfo starting.');
    console.debug('input<->order_id:%s', orderId);
    let res = null;
    try {
      res = await this._request('POST', router.getOrderInfo, orderId);
    } catch (e) {
      console.info('request getOrderInfo crash!!err=%o', e);
    }
    console.log('getOrderInfo finished');
    return res;
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

  async getEquipmentProductByCode(equipmentId, pick_up_code) {
    console.log('getEquipmentProductByCode starting.');
    console.debug(
      'input<->equipmentId=%s,pick_up_code=%s',
      equipmentId,
      pick_up_code,
    );
    let res = null;
    try {
      res = await this._request('POST', router.getEquipmentProductByCode, {
        equipmentId,
        pick_up_code,
      });
    } catch (e) {
      console.info('request getEquipmentProductByCode crash!!err=%o', e);
    }
    console.log('getEquipmentProductByCode finished');
    return res;
  }

  async updateOrderStatus(orderId, status) {
    console.log('updateOrderStatus starting.');
    console.debug('input<->orderId=%s,status=%d', orderId, status);
    let res = null;
    try {
      res = await this._request('POST', router.updateOrderStatus, {
        orderId,
        status,
      });
      console.debug('res<->%s', res);
    } catch (e) {
      console.info('request updateOrderStatus crash!!err=%o', e);
    }
    console.log('updateOrderStatus finished');
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
      res = await this._request('POST', router.getToken, {...obj});
    } catch (e) {
      console.log('request get token carsh!!err=%o', e);
    }
    console.log('getToken finished');
    return res;
  }

  async checkQrLogin(obj) {
    console.log('checkQrLogin staring.');
    console.debug('input<->', obj);
    let res = null;
    try {
      res = await this._request('POST', router.checkQrLogin, {...obj});
    } catch (e) {
      console.log('request checkQrLogin crash!! err = ', e);
    }
    console.log('checkQrLogin finished', res);
    return res;
  }

  async pwdLogin(obj) {
    console.log('pwdLogin starting.');
    console.info('input<->', obj);
    let res = null;
    try {
      res = await this._request('POST', router.pwdLogin, {...obj});
    } catch (e) {
      console.log('request pwdLogin crash!! err =', e);
    }
    console.info('pwdLogin finished');
    return res;
  }

  async verifyCodeLogin(obj) {
    console.log('verifyCodeLogin starting');
    console.info('input<->', obj);
    let res = null;
    try {
      res = await this._request('POST', router.verifyCodeLogin, {...obj});
    } catch (e) {
      console.log('request verifyCodeLogin crash!! err = ', e);
    }
    console.info('verifyCodeLogin finished');
    return res;
  }

  async getPatientRelateDoctorList(obj) {
    console.info('getPatientRelateDoctorList starting');
    console.info('input<->', obj);
    let res = null;
    try {
      res = await this._request('POST', router.getPatientRelateDoctorList, {
        ...obj,
      });
    } catch (e) {
      console.debug('request getPatientRelateDoctorList crash!! err=', e);
    }
    console.info('getPatientRelateDoctorList finished', res);
    return res;
  }

  async getPatientMemberInfoList(obj) {
    console.info('getPatientMemberInfoList starting');
    console.info('getPatientMemberInfoList request input<->', obj);
    let res = null;
    try {
      res = await this._request('POST', router.getPatientMemberInfoList, {
        ...obj,
      });
    } catch (e) {
      console.debug('request getPatientMemberInfoList');
    }
    console.info('getPatientMemberInfoList finished');
    return res;
  }

  async updateOrderPayType(obj) {
    console.info('updateOrderPayType');
    console.info('input<->', obj);
    let res = null;
    try {
      res = await this._request('POST', router.updateOrderPayType, {
        ...obj,
      });
    } catch (e) {
      console.debug('request updateOrderPayType error !! info =', e);
    }
    console.info('updateOrderPayType finished');
    return res;
  }

  async getVerifyCode(mobile) {
    console.info('getVerifyCode starting');
    console.info('input<-->', mobile);
    try {
      res = await this._request('POST', router.getVerifyCode, mobile);
    } catch (e) {
      console.debug('request getVerifyCode error !! info =', e);
    }
    console.info('getVerifyCode finished');
    return res;
  }

  async getEDrugStocks(equipmentId) {
    console.info(' getEDrugStocks starting');
    console.info('input<-->', equipmentId);
    try {
      res = await this._request('POST', router.getEDrugStocks, {equipmentId});
    } catch (e) {
      console.debug('request getEDrugStocks error !! info =', e);
    }
    console.info('getEDrugStocks finished');
    return res;
  }

  async updateEStock(obj) {
    console.info('updateEStocks starting');
    console.info('input<-->', obj);
    try {
      res = await this._request('POST', router.updateEStock, {...obj});
    } catch (e) {
      console.debug('request updateEStock error !! info =', e);
    }
    console.info('updateEStock finished');
    return res;
  }

  async getEDrugStockDetail(obj) {
    console.info('getEDrugStockDetail starting');
    console.info('input<-->', obj);
    try {
      res = await this._request('POST', router.getEDrugStockDetail, {...obj});
    } catch (e) {
      console.debug('request getEDrugStockDetail error !! info =', e);
    }
    console.info('getEDrugStockDetail finished');
    return res;
  }

  async getEProductStocks(obj) {
    console.info('getEProductStocks starting');
    console.info('input<-->', obj);
    try {
      res = await this._request('POST', router.getEProductStocks, {...obj});
    } catch (e) {
      console.debug('request getEProductStocks error !! info =', e);
    }
    console.info('getEProductStocks finished');
    return res;
  }

  async getProductInfoByEquipmentId(obj) {
    console.info('getProductInfoByEquipmentId starting');
    console.info('input<-->', obj);
    try {
      res = await this._request('POST', router.getProductInfoByEquipmentId, {
        ...obj,
      });
    } catch (e) {
      console.debug('request getProductInfoByEquipmentId error !! info =', e);
    }
    console.info('getProductInfoByEquipmentId finished', res);
    return res;
  }

  async saveEquipmentProduct(obj) {
    console.info('saveEquipmentProduct starting');
    console.info('input<-->', obj);
    try {
      res = await this._request('POST', router.saveEquipmentProduct, {
        ...obj,
      });
    } catch (e) {
      console.debug('request saveEquipmentProduct error !! info =', e);
    }
    console.info('saveEquipmentProduct finished');
    return res;
  }

  async getProductInfo(productId) {
    console.info('getProductInfo starting');
    console.info('input<-->', productId);
    try {
      res = await this._request('POST', router.getProductInfo, {
        productId,
      });
    } catch (e) {
      console.debug('request getProductInfo error !! info =', e);
    }
    console.info('getProductInfo finished');
    return res;
  }

  async updateDrugChannel(obj) {
    console.info('updateDrugChannel starting');
    console.info('input<-->', obj);
    try {
      res = await this._request('POST', router.updateDrugChannel, {
        ...obj,
      });
    } catch (e) {
      console.debug('request updateDrugChannel error !! info =', e);
    }
    console.info('updateDrugChannel finished');
    return res;
  }

  async unbind(obj) {
    console.info('unbind starting');
    console.info('input<-->', obj);
    try {
      res = await this._request('POST', router.unbind, {
        ...obj,
      });
    } catch (e) {
      console.debug('request unbind error !! info =', e);
    }
    console.info('unbind finished');
    return res;
  }
}

const API = new CloudApi();

export default API;
