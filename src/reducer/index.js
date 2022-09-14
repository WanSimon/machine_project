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
    // totalCustomerPrice: 0,
  },
  //是否为会员
  // customerFlag: true,
  //订单数据
  orderInfo: {},

  //取药码订单
  codeOrder: {
    cartList: {},
    orderInfo: {},
    productNum: 0,
  },

  token: '',
  //场景标识，发送给后端判断用户是否登录。
  sceneStr: '123',
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
        // totalCustomerPrice: 0,
      },
      orderInfo: {},
      // customerFlag: false,
      codeOrder: {
        cartList: {},
        orderInfo: {},
        productNum: 0,
      },
    };
  }
  // if (action.type === ActionType.ACTION_ADD_CUSTOMER) {
  //   return {
  //     ...state,
  //     customerFlag: true,
  //   };
  // }

  if (action.type === ActionType.ACTION_UPGRADE_ORDER) {
    return {
      ...state,
      orderInfo: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPGRADE_CODE_ORDER) {
    return {
      ...state,
      codeOrder: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPDATE_SCENE_STR) {
    return {
      ...state,
      sceneStr: action.payload,
    };
  }

  if (action.type === ActionType.ACTION_UPDATE_TOKEN) {
    return {
      ...state,
      token: action.token,
    };
  }
};

export default homeReducer;
