import {Dimensions, NativeModules, PixelRatio} from 'react-native';
const designWidth = 1080;
const designHeight = 1920;
export const width = Dimensions.get('window').width;
export const height = Dimensions.get('window').height;
export const p2dWidth = px => {
  return px * (width / designWidth);
};
export const p2dHeight = px => {
  return px * (height / designHeight);
};
export const px2dp = px => PixelRatio.roundToNearestPixel(px);

export const parseCent = cent =>{
  if(!cent) return 0;
  else return (cent/100).toFixed(2);
};

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export const parseTime = (time, cFormat) =>{
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if(new Date(time)){
    date = new Date(time);
  }
  else if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  });
  return time_str
};


import Sound from 'react-native-sound'
//语音播报
export const loadSound = (mp3)=>{
  let sound = new Sound(mp3,(error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    sound.play((success) => {
      sound.release();
    });
  });
};


export const getBase64 = (imgUrl)=> {
  return new Promise((resolve, reject)=>{
    let timer = setTimeout(()=>{reject()},5000);
    let xhr = new XMLHttpRequest();
    xhr.open("get", imgUrl, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (this.status === 200) {
        let blob = this.response;
        let oFileReader = new FileReader();
        oFileReader.onloadend = function (e) {
          let base64 = e.target.result;
          let index = base64.indexOf('base64');
          base64 = base64.slice(index);
          resolve(base64);
        };
        oFileReader.readAsDataURL(blob);
      }
      else {
        reject();
        clearTimeout(timer);
      }
    };
    xhr.send();
  });
};

import md5 from 'react-native-md5';
export const getSign = (params, opt) => {
  let keys = ['appId'];
  for (let key in params){
    if('appId' == key) continue;
    keys.push(key);
  }
  keys.sort();
  let ret = '';
  params.appId = opt.appId;
  for (let i = 0; i < keys.length; ++i){
    let key = keys[i];
    if (i !== 0) ret += '&';
    let value = params[key];
    if (typeof value == "string"){
      ret  += key + '=' + encodeURIComponent(value);
    }else{
      ret += key + '=' + encodeURIComponent(JSON.stringify(value));
    }
  }
  ret += opt.secretKey;
  return md5.hex_md5(ret).toLowerCase();
}
