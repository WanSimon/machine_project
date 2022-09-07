// 公共定义
export const EquipmentStatus = {
  //正常
  ES_IsOk:0,
  //异常
  ES_Fault:1,
  //离线
  ES_Offline:2,
  //停用
  ES_Stop:3
};

export const PayType = {
  //微信
  PT_Wechat:0,
  //支付宝
  PT_Ali:1,
  //医保卡
  PT_MedicalInsuranceCard:2
};

export const OrderStatus = {
  //未支付
  OS_NoPay:0,
  //已支付
  OS_Paied:1,
  //已取药
  OS_Taked:2
};

export const PayStatus = {
  //未支付
  PS_NoPay:0,
  //已支付
  PS_SUCCESS:1,
  //支付中
  PS_WAITING:2,
  //支付失败
  PS_Failed:3,
  //已退款
  PS_Refunded:4
};

export const BuyWay = {
  //直接购买
  BW_Buy:0,
  //自助取药
  BW_Take:1
};

export const OrderSource = {
  //平台
  OSRC_Platform:0,
  //第三方
  OSRC_Third:1,
  //药机
  OSRC_Equipment: 2,
};

export const PickUpType = {
  //取药码
  PUP_Input_Code:0,
  //扫码
  PUP_Scan_QRCode:1
};

export const TradeType = {
  //微信JSAPI
  WX_JSAPI: 1,
  //微信原生
  WX_NATIVE: 2,
  //微信APP
  WX_APP: 3,
  // 付款码支付(暂不支持)
  WX_MICROPAY: 4,
  // H5支付(暂不支持)
  WX_MWEB: 5,

  // 阿里条码支付
  ALI_BARCODE: 10,
  // 阿里扫码支付
  ALI_NATIVE: 11,
  // 阿里移动支付
  ALI_APP: 12,
  // 阿里手机网站支付
  ALI_WAP: 13,
  // 阿里即时到账
  ALI_INSTANT: 14,
  // 阿里刷脸支付
  ALI_FACEPAY: 15,
};

export const EquipmentOperationType = {
  //补货
  EOT_Supplement:0,
  //下架
  EOT_OFF:1,
  //出货
  EOT_Pick_UP:2
};

export const LockTag = {
  // 锁定
  LT_Lock:1,
  // 不锁定
  LT_UnLock:0
};
