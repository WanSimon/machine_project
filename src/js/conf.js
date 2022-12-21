const Conf = {
  // cloudUrl: 'http://192.168.101.71:15000/api/v1/tonsil',
  cloudUrl: 'https://tonsil.cinyou.cn/api/v1/tonsil',
  // cloudUrl: 'http://121.36.228.192:8080/api/v1',
  // cloudUrl: 'http://192.168.101.168:15000/api/v1/tonsil',
  weixinUrl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=',
  //心跳间隔时间 单位 毫秒
  heartbeatInterval: 10 * 100000, //5 * 1000
  //主题色调
  theme: '#00BFCE',
  //设备Mac地址
  mac: '3473D850893F',
  //resource:'http://47.114.162.91:8000/',
  resource_oss: 'https://oys-bucket-fh.oss-cn-shanghai.aliyuncs.com/',
  // resource_fdfs: 'http://121.36.246.250:10060/',
  resource_fdfs: 'http://192.168.101.71:1010/view/',
  debug: true,
  payUrl: 'https://tonsil.cinyou.cn/api/v1/tonsil/order/qrCodeUrl',
  sign: {
    appId: '1', //equipment
    secretKey: 'xy123456',
  },
  //退款申请地址
  applyRefundUrl: 'https://tonsil.cinyou.cn/client',
};

export default Conf;
