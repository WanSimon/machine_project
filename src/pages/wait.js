import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  ImageBackground,
  NativeModules,
  DeviceEventEmitter,
} from 'react-native';
import TopBar from '../components/topbar';
import {p2dHeight, p2dWidth, parseTime} from '../js/utils';
import {store} from '../store/store';
import api from '../js/cloudApi';
import {upgradeEquipmentInfo, upgradePickupStatus} from '../action';
import {EquipmentOperationType, OrderStatus} from '../js/common';
import uuid from 'react-native-uuid';
import {
  AddBlankLine,
  AddTextContent,
  AddImageContent,
} from '../js/ticketHelper';
import Conf from '../js/conf';
import QRCode from 'react-native-qrcode-svg';

class wait extends Component {
  constructor() {
    super();

    this.state = {
      drugArr: [],
      applyRefundUrl: '',
    };

    this.queue = new Set();
  }

  async componentDidMount() {
    console.debug('go to page 【wait】');
    this.emitListener = DeviceEventEmitter.addListener(
      'out_callback',
      (res) => {
        console.info('wait page, listen out_callback res = %o', res);
        NativeModules.RaioApi.debug(
          {
            msg: `wait page, listen out_callback res = ${JSON.stringify(res)}`,
            method: 'wait.componentDidMount',
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

    let orderInfo = store.getState().orderInfo;
    console.info('wait page componentDidMount state orderInfo = %o', orderInfo);
    NativeModules.RaioApi.debug(
      {
        msg: `wait page componentDidMount state orderInfo = ${JSON.stringify(
          orderInfo,
        )}`,
        method: 'wait.componentDidMount',
      },
      null,
    );

    let equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    let res = await api.getEquipmentDetail(equipmentId);
    console.info(
      '【wait】-----equipmentDetail---更新前的数据',
      res.equipmentDetailInfo.equipmentProductInfo.slotProductInfoList,
    );

    console.info(
      '【wait】-------本地药品信息---更新前',
      store.getState().equipmentInfo.equipmentProductInfo.slotProductInfoList,
    );

    let applyRefundUrl = $conf.applyRefundUrl + `&o=${orderInfo.serialNo}`;
    this.setState({applyRefundUrl});

    let cartList = store.getState().cart.cartList;
    console.info('cartList====>wait', cartList);
    let drugArr = this.parseCart(cartList);
    this.pickup(drugArr);
  }

  async componentWillUnmount() {
    // let equipmentId =
    //   store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    // let res = await api.getEquipmentDetail(equipmentId);
    // console.info('========+++++========', res);
    // console.info(
    //   '【wait】-----equipmentDetail---更新后的数据',
    //   res.equipmentDetailInfo.equipmentProductInfo.slotProductInfoList,
    // );

    // console.info(
    //   '【wait】-------本地药品信息---更新后',
    //   store.getState().equipmentInfo.equipmentProductInfo.slotProductInfoList,
    // );

    console.debug('destroy page 【wait】');
    DeviceEventEmitter.removeAllListeners(); // out_callback
    this.emitListener = null;
  }

  async pickup(drugArr) {
    //取药开始 设置取药状态
    let action = upgradePickupStatus(true);
    store.dispatch(action);

    let orderInfo = store.getState().orderInfo;

    //TODO log
    let equipmentInfo = store.getState().equipmentInfo;

    console.info(
      'orderInfo-----equipmentInfo-----wait',
      orderInfo,
      '------',
      equipmentInfo.equipmentProductInfo.equipmentId,
    );
    // let drugChannel = JSON.parse(
    //   store.getState().equipmentInfo.equipmentTypeInfo.drugChannel,
    // );

    //从药品的信息
    // let equipment_slot = drugChannel.slot_info_list;
    let slotProductInfoList =
      equipmentInfo.equipmentProductInfo.slotProductInfoList;

    //所有药品信息列表
    let slotList = [...slotProductInfoList];
    // 该变量用来上传云端库存变更消息
    let slotProductPickupInfoList = [];
    let result = true;
    for (let i = 0; i < drugArr.length; i++) {
      let drug = drugArr[i];
      console.log('drug===>wait', drug);
      //已选的药品信息列表
      let productSlotList = slotList.filter(
        (slot) => slot.orgProductInfo.productInfo.productId === drug.productId,
      );

      let isPicked = false;

      for (let j = 0; j < productSlotList.length && isPicked === false; j++) {
        let slot = productSlotList[j]; //单个已选药品信息

        if (slot.realStock > slot.lockStock) {
          let slotNo = slot.slotNo; //eg:slotNo:"1,2"

          let productSlotNoArray = slot.slotNo.split(',');
          let x = productSlotNoArray[0] - 1;
          let y = 7 - productSlotNoArray[1];

          //从drugChannel中筛选出单个已选药品的轨道信息
          // let equipment_slot_obj = equipment_slot.filter(
          //   (slot) => slot.slot_no === slot_no,
          // );
          // if () {
          // let x = equipment_slot_obj[0].x;
          // let y = 6 - equipment_slot_obj[0].y;
          // let span = equipment_slot_obj[0].x_aisle_count;

          // 该变量用来上传云端库存变更消息
          let slotProductChgInfo = {
            slotNo: slotNo,
            orgProductId: drug.orgProductId,
            electronicMonitoringCode: drug.electronicMonitoringCode,
            changedCount: 1,
            //op_time:new Date().getTime()/1000
            opTime: new Date().getTime(),
          };
          //取药
          try {
            console.info('x--y---wait---page', x, y);
            x = parseInt(x);
            y = parseInt(y);
            await this.out(x, y);
            //取药成功
            isPicked = true;
            drugArr[i].status = 2;
            slot.realStock--;

            slotProductChgInfo.realStock = slot.realStock;
            slotProductChgInfo.lockStock = slot.lockStock;
            slotProductChgInfo.errcode = 0;
            slotProductChgInfo.errmsg = 'pick up ok';

            //为了更新本地equipmentInfo
            slotList = slotList.map((item) => {
              if (item.slotNo === slot.slotNo) {
                return {
                  ...item,
                  realStock: item.realStock - 1,
                };
              } else {
                return item;
              }
            });
          } catch (e) {
            console.info('wait page func out err = %o', e);
            NativeModules.RaioApi.debug(
              {
                msg: `wait page func out err = ${e.message}`,
                method: 'wait.pickup',
              },
              null,
            );
            // todo 取药失败
            result = false;
            drugArr[i].status = 3;

            //取药失败不减实际库存
            slotProductChgInfo.realStock = slot.realStock;
            slotProductChgInfo.lockStock = slot.lockStock;
            slotProductChgInfo.errcode = -1;
            slotProductChgInfo.errmsg = 'pick up failed';

            console.error(e);
            //TODO log
          }
          this.setState({drugArr: [...drugArr]});
          slotProductPickupInfoList.push(slotProductChgInfo);
          break;
          // }
        }
      }

      if (!isPicked) {
        break;
        //alert('取药失败');
      }
    }

    equipmentInfo.equipmentProductInfo.slotProductInfoList = slotList;
    //更新本地库存
    action = upgradeEquipmentInfo(equipmentInfo);
    store.dispatch(action);

    //todo 更新云端库存
    /*  let equipmentProductChangeInfo = {
      req_id:uuid.v4(),
      equipment_product_chg_info:{
        equipment_id:equipmentInfo.id,
        op_type:EquipmentOperationType.EOT_Pick_UP,
        slotProductChgInfoList:slotProductPickupInfoList,
        order_id:orderInfo.id,
        lock_product:0,
        result:(result?0:-1)
      }
    };*/
    let equipmentProductChangeInfo = {
      requestId: uuid.v4(), //
      equipmentId: equipmentInfo.equipmentProductInfo.equipmentId,
      opType: EquipmentOperationType.EOT_Pick_UP,
      orderId: orderInfo.orderId,
      // lock_product: 0,
      // change_finished_lock_product:
      //   orderInfo.lock_product == LockTag.LT_Lock ? 1 : 0,
      result: result ? 0 : -1,
      slotProductChgInfoList: slotProductPickupInfoList,
    };

    //取药成功 更改订单状态
    if (result) {
      //TODO log
      await api.updateOrderStatus(orderInfo.orderId, OrderStatus.OS_Taked);
    }

    // 上报库存变更记录
    //TODO log
    await api.updateEquipmentProduct(equipmentProductChangeInfo);
    //取药结束 设置取药状态
    action = upgradePickupStatus(false);
    store.dispatch(action);

    //

    if (result) {
      //打印成功小票
      this.print_success();
      setTimeout(() => {
        this.props.navigation.navigate('end');
      }, 5000);
    } else {
      //打印失败小票
      this.print_fail(drugArr);
      setTimeout(() => {
        this.props.navigation.navigate('fail', {productList: drugArr});
      }, 5000);
    }
  }

  urlToBase64() {
    return new Promise((resolve, reject) => {
      let rejectTimer = setTimeout(() => reject('timeout'), 3000);
      this.svg.toDataURL((dataURL) => {
        clearTimeout(rejectTimer);
        resolve(dataURL);
      });
    });
  }

  async print_success() {
    try {
      let cart = store.getState().cart;
      let info = store.getState().equipmentInfo;
      let orderInfo = store.getState().orderInfo;
      console.info(
        'wait page func print_success get state orderInfo = %o',
        orderInfo,
      );
      NativeModules.RaioApi.debug(
        {
          msg: `wait page func print_success get state orderInfo = ${orderInfo}`,
          method: 'wait.print_success',
        },
        null,
      );

      //TODO log
      let ticketTemplateInfoList = [];
      //标题
      let ticketTitle = '欧药师智能药机';
      let obj = AddTextContent(ticketTitle, 1, 1, 1);
      ticketTemplateInfoList.push(obj);
      //间隔
      let arr = AddBlankLine(0, 1, ticketTemplateInfoList);
      ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);
      //日期
      let op_date_text =
        '日  期: ' + parseTime(new Date(), '{y}-{m}-{d} {h}:{i}');
      obj = AddTextContent(op_date_text, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //药机名称
      let equipmentName = '药  机: ' + info.equipmentGroupInfo.name;
      obj = AddTextContent(equipmentName, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //流水号
      let serialNo = '流水号: ' + orderInfo.serialNo;
      obj = AddTextContent(serialNo, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //间隔
      arr = AddBlankLine(0, 1, ticketTemplateInfoList);
      ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);

      let recodeTitle = '编号/品名           单价        数量       小计';
      obj = AddTextContent(recodeTitle, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //分隔符
      let separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      let cartList = cart.cartList;
      let i = 0;
      for (let key in cartList) {
        let productInfo = cartList[key];
        if (productInfo.num === 0) {
          continue;
        }
        let content = `${i + 1}.${productInfo.name}`;
        obj = AddTextContent(content, 0, 0, 1, ticketTemplateInfoList);
        ticketTemplateInfoList.push(obj);

        let unitPrice = productInfo.price;
        let price = (unitPrice / 100).toFixed(2).toString();
        let count = productInfo.num.toString();
        let amount = ((unitPrice * productInfo.num) / 100)
          .toFixed(2)
          .toString();
        content =
          price.padStart(24, ' ') +
          count.padStart(12, ' ') +
          amount.padStart(12, ' ');
        obj = AddTextContent(content, 0, 0, 0, ticketTemplateInfoList);
        ticketTemplateInfoList.push(obj);

        content = `规    格：${productInfo.specification || ' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticketTemplateInfoList);
        ticketTemplateInfoList.push(obj);

        /*content = `批    号：${productInfo.batch_number || ' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        content = `有 效 期：${productInfo.expiration_date||' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);*/

        content = `生产厂家：${productInfo.manufacturer || ' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticketTemplateInfoList);
        ticketTemplateInfoList.push(obj);

        //间隔
        arr = AddBlankLine(0, 1, ticketTemplateInfoList);
        ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);
        i++;
      }

      //分隔符
      separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      let totalProductCount = `数量合计：${cart.productNum}`;
      obj = AddTextContent(totalProductCount, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      let total_amount = `金额合计：${(cart.totalPrice / 100).toFixed(2)}`;
      obj = AddTextContent(total_amount, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      //间隔
      arr = AddBlankLine(0, 1, ticketTemplateInfoList);
      ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);

      let phone = `客服电话：${info.equipmentGroupInfo.phone || ' '}`;
      obj = AddTextContent(phone, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      let remark = '谢谢惠顾，欢迎再次使用！';
      obj = AddTextContent(remark, 1, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      this.printTicket(ticketTemplateInfoList);
      //alert('print success');
    } catch (e) {
      alert(e.message);
    }
  }

  async print_fail(drugArr) {
    let productArr = [];
    for (let i = 0; i < drugArr.length; i++) {
      let orgProductId = drugArr[i].orgProductId;
      //成功
      if (drugArr[i].status == 2) {
        let successIndex = productArr.findIndex(
          (item) => item.orgProductId === orgProductId && item.status == 2,
        );
        if (successIndex === -1) {
          let drug = {...drugArr[i]};
          productArr.push(drug);
        } else {
          productArr[successIndex].num++;
        }
      }
      //失败
      else {
        let failIndex = productArr.findIndex(
          (item) => item.orgProductId === orgProductId && item.status == 3,
        );
        if (failIndex === -1) {
          let drug = {...drugArr[i]};
          drug.status = 3;
          productArr.push({...drugArr[i]});
        } else {
          productArr[failIndex].num++;
        }
      }
    }

    try {
      let info = store.getState().equipmentInfo;
      let orderInfo = store.getState().orderInfo;
      console.info(
        'wait page func print_fail get state orderInfo = %o',
        orderInfo,
      );
      NativeModules.RaioApi.debug(
        {
          msg: `wait page func print_fail get state orderInfo = ${orderInfo}`,
          method: 'wait.print_fail',
        },
        null,
      );
      //TODO log

      let ticketTemplateInfoList = [];
      //标题
      let ticketTitle = '欧药师智能药机';
      let obj = AddTextContent(ticketTitle, 1, 1, 1);
      ticketTemplateInfoList.push(obj);
      //间隔
      let arr = AddBlankLine(0, 1, ticketTemplateInfoList);
      ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);
      //日期
      let op_date_text =
        '日  期: ' + parseTime(new Date(), '{y}-{m}-{d} {h}:{i}');
      obj = AddTextContent(op_date_text, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //药机名称
      let equipmentName = '药  机: ' + info.name;
      obj = AddTextContent(equipmentName, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //流水号
      let serialNo = '流水号: ' + orderInfo.serialNo;
      obj = AddTextContent(serialNo, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //间隔
      arr = AddBlankLine(0, 1, ticketTemplateInfoList);
      ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);

      let recode_title = '编号/品名       单价      数量     小计     出药';
      obj = AddTextContent(recode_title, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);
      //分隔符
      let separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      for (let i = 0; i < productArr.length; i++) {
        let productInfo = productArr[i];
        let content = `${i + 1}.${productInfo.name}`;
        obj = AddTextContent(content, 0, 0, 1, ticketTemplateInfoList);
        ticketTemplateInfoList.push(obj);

        let unitPrice = productInfo.price;
        let price = (unitPrice / 100).toFixed(2).toString();
        let count = productInfo.num.toString();
        let amount = ((unitPrice * productInfo.num) / 100)
          .toFixed(2)
          .toString();
        let result = productInfo.status == 2 ? '成功' : '失败';
        content =
          price.padStart(20, ' ') +
          count.padStart(10, ' ') +
          amount.padStart(9, ' ') +
          result.padStart(7, ' ');
        obj = AddTextContent(content, 0, 0, 0, ticketTemplateInfoList);
        ticketTemplateInfoList.push(obj);

        //间隔
        arr = AddBlankLine(0, 1, ticketTemplateInfoList);
        ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);
      }
      let remark = '取药失败，请保留小票';
      obj = AddTextContent(remark, 1, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      let phone = `客服电话：${info.equipmentGroupInfo.phone || ' '}`;
      obj = AddTextContent(phone, 0, 0, 0, ticketTemplateInfoList);
      ticketTemplateInfoList.push(obj);

      try {
        //间隔
        arr = AddBlankLine(0, 1);
        ticketTemplateInfoList = ticketTemplateInfoList.concat(arr);
        //申请退款二维码
        let imageBase64 = await this.urlToBase64();
        obj = AddImageContent(imageBase64, 1);
        ticketTemplateInfoList.push(obj);

        let applyDesc = '扫码申请退款';
        obj = AddTextContent(applyDesc, 1, 0, 0);
        ticketTemplateInfoList.push(obj);
      } catch (e) {
        alert(e);
        console.error(e);
      }

      this.printTicket(ticketTemplateInfoList);
    } catch (e) {
      alert(e.message);
    }
  }

  printTicket(ticketTemplateInfoList) {
    if (Conf.debug) {
      return;
    }
    for (let i = 0; i < ticketTemplateInfoList.length; i++) {
      let item = ticketTemplateInfoList[i];
      if (item.type === 'text') {
        NativeModules.RaioApi.printText(
          item.str,
          item.align,
          item.size,
          item.bold,
          i === ticketTemplateInfoList.length - 1 ? 1 : 0,
          (res) => {},
        );
      }
      if (item.type === 'image') {
        //二维码退款走此流程
        NativeModules.RaioApi.printImage(
          item.image_info,
          item.align,
          i === ticketTemplateInfoList.length - 1 ? 1 : 0,
          (res) => {},
        );
      }
    }
  }

  //出药
  out(x, y) {
    NativeModules.RaioApi.debug(
      {msg: `call out input x=${x},y=${y}`, method: 'wait.out'},
      null,
    );
    return new Promise((resolve, reject) => {
      if (Conf.debug) {
        resolve();
      } else {
        NativeModules.RaioApi.out(0, x, y, (res) => {
          if (res === 0) {
            let obj = {
              resolve,
              reject,
              x,
              y,
            };
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

  parseCart(cartList) {
    let drugArr = [];
    for (let key in cartList) {
      if (cartList[key].num > 0) {
        for (let i = 0; i < cartList[key].num; i++) {
          let obj = {
            orgProductId: key,
            ...cartList[key],
            status: 1,
          };
          obj.num = 1; //格式化后的数组的每个单位的药品数量为一，为每次出一个单位的药品提供数据支持
          drugArr.push(obj);
        }
      }
    }
    console.info('wait------page', drugArr);
    this.setState({drugArr: drugArr});

    return drugArr;
  }

  parseStatus(status) {
    switch (status) {
      case 1:
        return '正在取药';
      case 2:
        return '取药完成';
      case 3:
        return '取药失败';
    }
  }

  parseColor(status) {
    switch (status) {
      case 1:
        return '#999999';
      case 2:
        return '#00bfce';
      case 3:
        return '#ff5c2a';
    }
  }

  render() {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}>
        <TopBar
          // disableCount={true}
          count={90000}
          hideBack={true}
          // hideBack={false}
          pageName="等待取药"
          navigation={this.props.navigation}
        />
        <ImageBackground
          style={{
            width: '100%',
            height: p2dHeight(460),
          }}
          source={require('../assets/wait.png')}
        />
        <ScrollView
          style={{
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
          {this.state.drugArr.map((item, index) => (
            <View
              style={{
                width: p2dWidth(1080),
                height: p2dHeight(230),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
              key={index}>
              <Image
                style={{
                  width: p2dWidth(200),
                  height: p2dHeight(200),
                  marginLeft: p2dWidth(40),
                }}
                source={{uri: Conf.resource_fdfs + item.homeThumbUrl}}
              />
              <Text
                style={{
                  fontSize: p2dWidth(28),
                  fontWeight: '500',
                  color: '#333333',
                  marginLeft: p2dWidth(20),
                }}>
                {item.name}
              </Text>
              <Text
                style={{
                  marginLeft: 'auto',
                  marginRight: p2dWidth(40),
                  fontSize: p2dWidth(28),
                  fontWeight: '500',
                  color: this.parseColor(item.status),
                }}>
                {this.parseStatus(item.status)}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={{position: 'absolute', opacity: 0}}>
          {this.state.applyRefundUrl ? (
            <QRCode
              value={this.state.applyRefundUrl}
              getRef={(c) => (this.svg = c)}
            />
          ) : null}
        </View>
      </View>
    );
  }
}

export default wait;
