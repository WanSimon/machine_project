const Conf = {
  //cloudUrl:'http://192.168.101.71:9000/api/v1',
  cloudUrl:'http://121.36.228.192:8080/api/v1',
  //token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBfaWQiOiJlcXVpcG1lbnQiLCJpYXQiOjE1NzczNTA2NTcsImV4cCI6NDczMzExMDY1N30.07xHFbB3IUAAAlcZXHXxcwahcjPUG3u3tU0Cra_nk0w',
  token:'eyJhbGciOiJSUzI1NiJ9.eyJsb2dpblR5cGUiOjEsIklEIjoiZXF1aXBtZW50IiwiZXhwIjoxMzA0NTg0NDk0MjJ9.F1_Deb2PeMld-QL4xyWzwqSTvJ-SmBezh99TvgjaRwBiGVPZNpZi4j77LSe4UHZMVKq--8ZbkeqVph3nY-OFAYAlOg-qserOLXuTQzthoHoDd1nEDdHFSzuU1GHK6t2zLJODxBq4irU094T5Fdsv1iIBELxfjVr7UXvCQRKCckpkMWef5wW0h6TlmNwGRgmnXotoC6G7uTIo6KsOItu8bzN1rlqnOg8n56IGjxXEP56INFhpA7Lcl0T83z2JbQgsJEgTGTO6zo9z2TCOR-9uJ8Ckp10k3wmNXLwMWH8w2fYyzewgIMp4nasYGrHYhDgX750Xokh3FYZHZh4W4IJhhw',
  //心跳间隔时间 单位 毫秒
  heartbeatInterval:10*1000,//5 * 1000
  heartbeatInterval_checkcustomer:10*1000,//5 * 1000
  //主题色调
  theme:'#00BFCE',
  //设备Mac地址
  mac:'2EB312D0E91E',
  //resource:'http://47.114.162.91:8000/',
  resource_oss:'https://oys-bucket-fh.oss-cn-shanghai.aliyuncs.com/',
  resource_fdfs:'http://121.36.246.250:10060/',
  //resource_fdfs:'http://192.168.101.71:8888',
  debug: false,
  sign: {
    appId: 'equipment',
    secretKey: 'xy123456'
  },
  //退款申请地址
  applyRefundUrl:"http://c.cinyou.com/pages/user/List?f=1"

};

export default Conf;
