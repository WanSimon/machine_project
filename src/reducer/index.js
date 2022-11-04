import {ActionType} from '../action/index';

const initialState = {
  equipmentInfo: {},
  //取药状态 true:取消中 false:非取药中
  pickupStatus: false,
  //设备状态码
  statusFlag: '',
  //购物车数据
  cart: {
    cartList: {},
    productNum: 0,
    totalPrice: 0,
  },
  //订单数据
  orderInfo: {},

  token: '',
  //场景标识，发送给后端判断用户是否登录。
  sceneStr: '',
  loginStatus: false,
  // userId: 'd6575b3825c24c26a7ee2b1ad385e411',
  userId: '',
  mobile: '',
  serialNo: '',
  orderId: '',
  logged: {
    userId: '',
    mobile: '',
  },
};

let homeReducer = (state = initialState, action) => {
  if (action.payload === undefined) {
    return state;
  }
  if (action.type === ActionType.ACTION_UPGRADE_EQUIPMENT_INFO) {
    return {
      ...state,
      equipmentInfo: action.payload,
    };
  }
  if (action.type === ActionType.ACTION_UPGRADE_PICKUP_STATUS) {
    return {
      ...state,
      pickupStatus: action.payload,
    };
  }
  if (action.type === ActionType.ACTION_UPGRADE_STATUS_FLAG) {
    return {
      ...state,
      statusFlag: action.payload,
    };
  }
  if (action.type === ActionType.ACTION_UPGRADE_CART) {
    return {
      ...state,
      cart: action.payload,
    };
  }
  if (action.type === ActionType.ACTION_CLEAR_CART) {
    return {
      ...state,
      cart: {
        cartList: {},
        productNum: 0,
        totalPrice: 0,
      },
      orderInfo: {},
    };
  }

  if (action.type === ActionType.ACTION_UPGRADE_ORDER) {
    return {
      ...state,
      orderInfo: action.payload,
    };
  }

  // if (action.type === ActionType.ACTION_UPGRADE_CODE_ORDER) {
  //   return {
  //     ...state,
  //     codeOrder: action.payload,
  //   };
  // }

  if (action.type === ActionType.ACTION_UPDATE_SCENE_STR) {
    return {
      ...state,
      sceneStr: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPDATE_TOKEN) {
    return {
      ...state,
      token: action.payload,
    };
  }
  if (action.type === ActionType.ACTION_UPDATE_LOGIN_STATUS) {
    return {
      ...state,
      loginStatus: action.payload,
    };
  }
  if (action.type === ActionType.ACTION_UPDATE_USER_ID) {
    return {
      ...state,
      userId: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPDATE_MOBILE) {
    return {
      ...state,
      mobile: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPDATE_ORDER_ID) {
    return {
      ...state,
      orderId: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPDATE_SERIAL_NO) {
    return {
      ...state,
      serialNo: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPDATE_LOGGED) {
    return {
      ...state,
      logged: action.payload,
    };
  }
};

export default homeReducer;
