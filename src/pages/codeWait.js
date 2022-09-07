import React, { Component } from 'react';
import { Text, View, Image, ScrollView,TouchableOpacity,ImageBackground,NativeModules ,DeviceEventEmitter } from 'react-native';
import TopBar from '../components/topbar';
import {p2dHeight, p2dWidth, parseCent, parseTime, getBase64} from '../js/utils';
import {store} from "../store/store";
import api from "../js/cloudApi";
import {upgradeEquipmentInfo, upgradePickupStatus} from '../action';
import {EquipmentOperationType,LockTag,OrderStatus} from '../js/common'
import uuid from 'react-native-uuid';
import {AddBlankLine,AddTextContent,AddImageContent} from '../js/ticketHelper';
import QRCode from 'react-native-qrcode-svg';

class codeWait extends Component {
  constructor() {
    super();

    this.state = {
      drugArr:[],
      applyRefundUrl:""
    };

    this.quene = new Set();
  }

  async componentDidMount(){
    console.debug('go to page 【codeWait】');
    this.emitListener = DeviceEventEmitter.addListener('out_callback', (res) => {
      console.info(`codeWait page, listen out_callback res = %o`, res);
      NativeModules.RaioApi.debug({msg: `codeWait page, listen out_callback res = ${JSON.stringify(res)}`, method: 'codeWait.componentDidMount'}, null); 
      for (let item of this.quene) {
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
          this.quene.delete(item);
        }
      }
    });

    let cartList = store.getState().codeOrder.cartList;
    let drugArr = this.parseCart(cartList);
    console.info(`codeWait page componentDidMount computed drugArr = %o`, drugArr);
    NativeModules.RaioApi.debug({msg: `codeWait page componentDidMount computed drugArr = ${JSON.stringify(drugArr)}`, method: 'codeWait.componentDidMount'}, null); 

    let orderInfo = store.getState().codeOrder.orderInfo;
    console.info(`codeWait page componentDidMount state orderInfo = %o`, orderInfo);
    NativeModules.RaioApi.debug({msg: `codeWait page componentDidMount state orderInfo = ${JSON.stringify(orderInfo)}`, method: 'codeWait.componentDidMount'}, null); 

    let serial_no;
    if (!orderInfo.serial_no) {
      try{
        let res = await api.getOrderInfo(orderInfo.order_id);
        serial_no = res?.serial_no || "";
      }catch(e){
        console.info(`codeWait page componentDidMount getOrderInfo.serial_no err = %o`, e);
        NativeModules.RaioApi.debug({msg: `codeWait page componentDidMount getOrderInfo.serial_no err = ${e.message}`, method: 'codeWait.componentDidMount'}, null); 
        serial_no = '';
      }
    }else {
      serial_no = orderInfo.serial_no;
    }
    let applyRefundUrl = $conf.applyRefundUrl + `&o=${serial_no}`;
    this.setState({applyRefundUrl});

    try {
      this.pickup(drugArr);
    }catch (e) {
      console.info(`codeWait page componentDidMount call pickup err = %o`, e);
      NativeModules.RaioApi.debug({msg: `codeWait page componentDidMount call pickup err = ${e.message}`, method: 'codeWait.componentDidMount'}, null); 
    }
  }

  componentWillUnmount(){
    console.debug('destroy page 【codeWait】');
    DeviceEventEmitter.removeListener('out_callback');
    this.emitListener = null;
  }

  urlToBase64() {
    return new Promise((resolve, reject)=>{
      let rejectTimer = setTimeout(()=>reject('timeout'),3000);
      this.svg.toDataURL((dataURL)=>{
        clearTimeout(rejectTimer);
        resolve(dataURL);
      });
    });
  }

  async pickup(drugArr){
    //取药开始 设置取药状态
    let action = upgradePickupStatus(true);
    store.dispatch(action);

    let orderInfo = store.getState().codeOrder.orderInfo;
    console.info(`codeWait page func pickup get state orderInfo = %o`, orderInfo);
    NativeModules.RaioApi.debug({msg: `codeWait page func pickup get state orderInfo = ${orderInfo}`, method: 'codeWait.pickup'}, null); 

    let equipmentInfo = store.getState().equipmentInfo;
    let drug_channel = JSON.parse(equipmentInfo.drug_channel);
    let equipment_slot = drug_channel.slot_info_list;
    let slot_product_list_info = equipmentInfo.equipment_product_info.slot_product_list_info;
    let slot_list = [...slot_product_list_info];
    // 该变量用来上传云端库存变更消息
    let slot_product_pickup_info_list = [];
    let result = true;

    for(let i=0;i<drugArr.length;i++){

      let drug = drugArr[i];
      let product_slot_list = slot_list.filter(slot=>slot.merchant_product_info.merchant_product_id === drug.merchant_product_id);
      // 排序
      product_slot_list = product_slot_list.sort((a,b)=>{return Math.min(b.real_stock,b.lock_stock) - Math.min(a.real_stock,a.lock_stock)});

      let isPicked = false;

      for(let j=0;j<product_slot_list.length && isPicked === false;j++){
        let slot = product_slot_list[j];

        let available_stock;
        // 锁库存
        if(orderInfo.lock_product == LockTag.LT_Lock){
          available_stock = slot.real_stock;
        }
        else {
          available_stock = slot.real_stock - slot.lock_stock;
        }


        // 该槽道可用库存大于0
        if(available_stock>0){
          let slot_no = slot.slot_no;

          let equipment_slot_obj = equipment_slot.filter(slot=>slot.slot_no===slot_no);
          if(equipment_slot_obj && equipment_slot_obj.length>0){
            let x = equipment_slot_obj[0].x;
            let y = 6-equipment_slot_obj[0].y;
            let span = equipment_slot_obj[0].x_aisle_count;

            // 该变量用来上传云端库存变更消息
            let slot_product_chg_info = {
              slot_no:slot_no,
              merchant_product_id:drug.merchant_product_id,
              electronic_monitoring_code:drug.electronic_monitoring_code,
              changed_count: 1,
              //op_time:new Date().getTime()/1000,
              op_time:new Date().getTime()
            };

            //取药
            try{
              await this.out(x,y);
              //取药成功
              isPicked = true;
              drugArr[i].status = 2;
              slot.real_stock--;
              // 锁库存
              if(orderInfo.lock_product == LockTag.LT_Lock){
                 if(slot.lock_stock>0) {
                  slot.lock_stock--;
                 }else {
                   console.error('exception lock_stock:%d,equipment_id:%s,slot_no:%d',slot.lock_stock,equipmentInfo.id,slot_no);
                 }
              }
              slot_product_chg_info.real_stock = slot.real_stock;
              slot_product_chg_info.lock_stock = slot.lock_stock;
              slot_product_chg_info.errcode = 0;
              slot_product_chg_info.errmsg = "pick up ok";
            }catch (e) {
              console.info(`codeWait page func out err = %o`, e);
              NativeModules.RaioApi.debug({msg: `codeWait page func out err = ${e.message}`, method: 'codeWait.pickup'}, null); 
              // todo 取药失败
              result =false;
              drugArr[i].status = 3;

              //取药失败不减实际库存
              slot_product_chg_info.real_stock = slot.real_stock;
              slot_product_chg_info.lock_stock = slot.lock_stock;
              slot_product_chg_info.errcode = -1;
              slot_product_chg_info.errmsg = 'pick up failed';

              console.error(e);
            }
            this.setState({drugArr:[...drugArr]});
            slot_product_pickup_info_list.push(slot_product_chg_info);
            break;
          }

        }
      }

      if(!isPicked){
        break;
        //alert('取药失败');
      }
    }
    equipmentInfo.equipment_product_info.slot_product_list_info = slot_list;
    //更新本地库存
    action = upgradeEquipmentInfo(equipmentInfo);
    store.dispatch(action);

    //更新云端库存
    let equipmentProductChangeInfo = {
      req_id:uuid.v4(),
      equipment_id:equipmentInfo.id,
      op_type:EquipmentOperationType.EOT_Pick_UP,
      order_id:orderInfo.order_id,
      lock_product:orderInfo.lock_product,
      change_finished_lock_product:(orderInfo.lock_product == LockTag.LT_Lock?1:0),
      result:(result?0:-1),
      slot_product_chg_info_list:slot_product_pickup_info_list
    };

    // 上报库存变更记录
    await api.updateEquipmentProduct(equipmentProductChangeInfo);
    //取药结束 设置取药状态
    action = upgradePickupStatus(false);
    store.dispatch(action);
    if(result) {
      //取药成功 更改订单状态
      await api.updateOrderStatus(orderInfo.order_id,OrderStatus.OS_Taked);
      //打印成功小票
      this.print_success();
      this.props.navigation.navigate('end');
    }else{
      //打印失败小票
      this.print_fail(drugArr);
      this.props.navigation.navigate('fail', {productList: drugArr});
    }
  }

  async print_success() {
    try {
      let info = store.getState().equipmentInfo;
      let customerFlag = store.getState().customerFlag;
      let codeOrder = store.getState().codeOrder;
      let orderInfo = codeOrder.orderInfo;
      console.info(`codeWait page func print_success get state orderInfo = %o`, orderInfo);
      NativeModules.RaioApi.debug({msg: `codeWait page func print_success get state orderInfo = ${orderInfo}`, method: 'codeWait.pickup'}, null); 

      if (!orderInfo.serial_no) {
        let res = await api.getOrderInfo(orderInfo.order_id);
        orderInfo.serial_no = res.serial_no || " ";
      }

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
      let equipmentName = "药  机: " + info.name;
      obj = AddTextContent(equipmentName, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //流水号
      let serial_no = "流水号: " + orderInfo.serial_no;
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

      let cartList = codeOrder.cartList;
      let i = 0;
      for (let key in cartList) {
        let productInfo = cartList[key];
        if(productInfo.num === 0) continue;
        let content = `${i + 1}.${productInfo.name}`;
        obj = AddTextContent(content, 0, 0, 1, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        let unit_price = customerFlag ? productInfo.customer_price : productInfo.price;
        let price = (unit_price / 100).toFixed(2).toString();
        let count = productInfo.num.toString();
        let amount = (unit_price * productInfo.num / 100).toFixed(2).toString();
        content = price.padStart(24, ' ') + count.padStart(12, ' ') + amount.padStart(12, ' ');
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        content = `规    格：${productInfo.specification || ' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        /*content = `批    号：${productInfo.batch_number || ' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        content = `有 效 期：${productInfo.expiration_date||' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);*/

        content = `生产厂家：${productInfo.manufacturer || ' '}`;
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        //间隔
        arr = AddBlankLine(0, 1, ticket_template_info_list);
        ticket_template_info_list = ticket_template_info_list.concat(arr);
        i++;
      }

      //分隔符
      separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      let total_product_count = `数量合计：${codeOrder.productNum}`;
      obj = AddTextContent(total_product_count, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      /*let total_amount = `金额合计：${(cart.totalPrice / 100).toFixed(2)}`;
      obj = AddTextContent(total_amount, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);*/

      //间隔
      arr = AddBlankLine(0, 1, ticket_template_info_list);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      let phone = `客服电话：${info.equipment_group_info.phone || " "}`;
      obj = AddTextContent(phone, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      if (info.equipment_group_info.merchant_qr_code) {
        let image = await getBase64($conf.resource + info.equipment_group_info.merchant_qr_code);
        obj = AddImageContent(image, 1, ticket_template_info_list);
        ticket_template_info_list.push(obj);
      }
      let remark = `谢谢惠顾，欢迎再次使用！`;
      obj = AddTextContent(remark, 1, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      this.printTicket(ticket_template_info_list);
      //alert('print success');
    }catch (e) {
      alert(e.message);
    }
  }

  async print_fail(drugArr){
    let productArr = [];
    for(let i=0;i<drugArr.length;i++){
      let merchant_product_id = drugArr[i].merchant_product_id;
      //成功
      if(drugArr[i].status ==2){
        let successIndex = productArr.findIndex(item=>item.merchant_product_id ===merchant_product_id && item.status==2);
        if(successIndex ===-1){
          let drug = {...drugArr[i]};
          productArr.push(drug);
        }
        else {
          productArr[successIndex].num++;
        }
      }
      //失败
      else {
        let failIndex = productArr.findIndex(item=>item.merchant_product_id ===merchant_product_id && item.status==3);
        if(failIndex ===-1){
          let drug = {...drugArr[i]};
          drug.status = 3;
          productArr.push({...drugArr[i]});
        }
        else {
          productArr[failIndex].num++;
        }
      }
    }

    try {
      let info = store.getState().equipmentInfo;
      let customerFlag = store.getState().customerFlag;
      let orderInfo = store.getState().codeOrder.orderInfo;
      console.info(`codeWait page func print_fail get state orderInfo = %o`, orderInfo);
      NativeModules.RaioApi.debug({msg: `codeWait page func print_fail get state orderInfo = ${orderInfo}`, method: 'codeWait.print_fail'}, null); 

      if (!orderInfo.serial_no) {
        let res = await api.getOrderInfo(orderInfo.order_id);
        orderInfo.serial_no = res.serial_no || " ";
      }

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
      let equipmentName = "药  机: " + info.name;
      obj = AddTextContent(equipmentName, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //流水号
      let serial_no = "流水号: " + orderInfo.serial_no;
      obj = AddTextContent(serial_no, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //间隔
      arr = AddBlankLine(0, 1);
      ticket_template_info_list = ticket_template_info_list.concat(arr);

      let recode_title = "编号/品名       单价      数量     小计     出药";
      obj = AddTextContent(recode_title, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);
      //分隔符
      let separator = '-----------------------------------------------';
      obj = AddTextContent(separator, 0, 0, 0, ticket_template_info_list);
      ticket_template_info_list.push(obj);

      for (let i = 0; i < productArr.length; i++) {
        let productInfo = productArr[i];
        let content = `${i + 1}.${productInfo.name}`;
        obj = AddTextContent(content, 0, 0, 1, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        let unit_price = customerFlag ? productInfo.customer_price : productInfo.price;
        let price = (unit_price / 100).toFixed(2).toString();
        let count = productInfo.num.toString();
        let amount = (unit_price * productInfo.num / 100).toFixed(2).toString();
        let result = (productInfo.status == 2 ? "成功" : "失败");
        content = price.padStart(20, ' ') + count.padStart(10, ' ') + amount.padStart(9, ' ') + result.padStart(7, ' ');
        obj = AddTextContent(content, 0, 0, 0, ticket_template_info_list);
        ticket_template_info_list.push(obj);

        //间隔
        arr = AddBlankLine(0, 1);
        ticket_template_info_list = ticket_template_info_list.concat(arr);
      }
      let remark = `取药失败，请保留小票`;
      obj = AddTextContent(remark, 1, 0, 0);
      ticket_template_info_list.push(obj);

      let phone = `客服电话：${info.equipment_group_info.phone || " "}`;
      obj = AddTextContent(phone, 0, 0, 0);
      ticket_template_info_list.push(obj);


      try{
        //间隔
        arr = AddBlankLine(0, 1);
        ticket_template_info_list = ticket_template_info_list.concat(arr);
        //申请退款二维码
        let imageBase64 = await this.urlToBase64();
        obj = AddImageContent(imageBase64, 1);
        ticket_template_info_list.push(obj);

        let applyDesc = `扫码申请退款`;
        obj = AddTextContent(applyDesc, 1, 0, 0);
        ticket_template_info_list.push(obj);
      }
      catch (e) {
        console.error(e);
      }

      this.printTicket(ticket_template_info_list);
    }catch (e) {
      alert(e.message);
    }
  }

  printTicket(ticket_template_info_list){
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

  //出药
  out(x,y){
    NativeModules.RaioApi.debug({msg: `call out input x=${x},y=${y}`, method: 'codeWait.out'}, null); 
    return new Promise((resolve, reject)=>{
      NativeModules.RaioApi.out(0,x,y,(res)=>{
        if(res ===0) {
          let obj = {
            resolve,
            reject,
            x,y
          };
          this.quene.add(obj);
        }
        else reject(res);
        setTimeout(()=>{
          reject('timeout');
        },30000);
      });
    });
  }

  parseCart(cartList){
    let drugArr = [];
    for(let key in cartList){
      if(cartList[key].num>0){
        for(let i=0;i<cartList[key].num;i++){
          let obj = {
            merchant_product_id:key,
            ...cartList[key],
            status:1
          };
          obj.num = 1;
          drugArr.push(obj);
        }
      }
    }
    this.setState({drugArr:drugArr});
    return drugArr;
  }

  parseStatus (status){
    switch (status) {
      case 1:
        return "正在取药";
        break;
      case 2:
        return "取药完成";
        break;
      case 3:
        return "取药失败";
        break;
    }
  }

  parseColor (status){
    switch (status) {
      case 1:
        return "#999999";
      case 2:
        return "#00bfce";
      case 3:
        return "#ff5c2a";
    }
  }

  render() {
    return (
      <View style={{
        display: 'flex',
        flexDirection:'column',
        height:'100%',
        width:'100%',
      }}>
        <TopBar
          disableCount={true}
          hideBack={true}
          pageName='等待取药'
          navigation={this.props.navigation}
        />
        <ImageBackground
          style={{
            width:'100%',
            height:p2dHeight(460)
          }}
          source={require('../assets/wait.png')}/>
        <ScrollView style={{
          flexGrow: 1,
          width:'100%',
          display:'flex',
          flexDirection:'column'
        }}>
          {this.state.drugArr.map((item,index)=><View style={{
            width:p2dWidth(1080),
            height:p2dHeight(230),
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'flex-start'
          }} key={index}>
            <Image
              style={{
                width:p2dWidth(200),
                height:p2dHeight(200),
                marginLeft:p2dWidth(40)
              }}
              source={{uri:$conf.resource_oss+item.home_thumb}}
            />
            <Text  style={{
              fontSize:p2dWidth(28),
              fontWeight:'500',
              color: '#333333',
              marginLeft:p2dWidth(20)
            }}>{item.name}</Text>
            <Text style={{
              marginLeft:'auto',
              marginRight:p2dWidth(40),
              fontSize:p2dWidth(28),
              fontWeight:'500',
              color: this.parseColor(item.status),
            }}>{this.parseStatus(item.status)}</Text>
          </View>)}

        </ScrollView>

        <View style ={{position:'absolute', opacity:0}}>
          {this.state.applyRefundUrl?<QRCode value={this.state.applyRefundUrl} getRef={(c) => (this.svg = c)}/>:null}
        </View>
      </View>
    );
  }
}

export default codeWait;
