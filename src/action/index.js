export const ActionType = {
  ACTION_UPGRADE_EQUIPMENT_INFO: 'action_upgrade_equipment_info',
  ACTION_UPGRADE_PICKUP_STATUS: 'action_upgrade_pickup_status',
  ACTION_UPGRADE_STATUS_FLAG: 'action_upgrade_status_flag',
  ACTION_UPGRADE_CART: 'action_upgrade_cart',
  ACTION_CLEAR_CART: 'action_clear_cart',
  ACTION_UPGRADE_ORDER: 'action_upgrade_order',
  // ACTION_UPGRADE_CODE_ORDER: 'action_upgrade_code_order',
  ACTION_UPDATE_SCENE_STR: 'action_update_scene_str',
  ACTION_UPDATE_TOKEN: 'action_update_token',
  ACTION_UPDATE_LOGIN_STATUS: 'action_update_login_status',
  ACTION_UPDATE_USER_ID: 'action_update_user_id',
  ACTION_UPDATE_MOBILE: 'action_update_mobile',
  ACTION_UPDATE_SERIAL_NO: 'action_update_serial_no',
  ACTION_UPDATE_ORDER_ID: 'action_update_order_id',
  ACTION_UPDATE_LOGGED: 'action_update_logged',
  ACTION_UPDATE_SLOT_NO: 'action_update_slot_no',
  ACTION_UPDATE_ADMIN_DATA: 'action_update_admin_data',
  ACTION_UPDATE_PRODUCT_ID: 'action_update_product_id',
};

//更新设备信息
export function upgradeEquipmentInfo(equipmentInfo) {
  //合并各槽道的同品类药品
  let productInfoList = [];
  if (
    equipmentInfo.equipmentProductInfo &&
    equipmentInfo.equipmentProductInfo.slotProductInfoList
  ) {
    let slotProductInfoList =
      equipmentInfo.equipmentProductInfo.slotProductInfoList;
    for (let i = 0; i < slotProductInfoList.length; ++i) {
      let slotProductInfo = slotProductInfoList[i];
      let bFound = false;
      for (let j = i + 1; j < slotProductInfoList.length; ++j) {
        if (
          slotProductInfo.orgProductInfo.orgProductId ===
          slotProductInfoList[j].orgProductInfo.orgProductId
        ) {
          slotProductInfoList[j].realStock =
            slotProductInfoList[j].realStock + slotProductInfo.realStock;
          slotProductInfoList[j].lockStock =
            slotProductInfoList[j].lockStock + slotProductInfo.lockStock;
          bFound = true;
          break;
        }
      }
      if (!bFound) {
        productInfoList.push({
          orgProductInfo: slotProductInfo.orgProductInfo,
          realStock: slotProductInfo.realStock,
          lockStock: slotProductInfo.lockStock,
        });
      }
    }
  }
  equipmentInfo.productList = productInfoList;
  return {
    type: ActionType.ACTION_UPGRADE_EQUIPMENT_INFO,
    payload: equipmentInfo,
  };
}

//更新取药状态
export function upgradePickupStatus(status) {
  return {
    type: ActionType.ACTION_UPGRADE_PICKUP_STATUS,
    payload: status,
  };
}

//更新设备状态码
export function upgradeStatusFlag(status) {
  return {
    type: ActionType.ACTION_UPGRADE_STATUS_FLAG,
    payload: status,
  };
}

//更新购物车
export function upgradeCart(data) {
  return {
    type: ActionType.ACTION_UPGRADE_CART,
    payload: data,
  };
}

//清空购物车
export function clearCart() {
  return {
    type: ActionType.ACTION_CLEAR_CART,
    payload: {},
  };
}
//更新订单
export function upgradeOrder(data) {
  return {
    type: ActionType.ACTION_UPGRADE_ORDER,
    payload: data,
  };
}
//更新场景标识信息
export function updateSceneStr(data) {
  return {
    type: ActionType.ACTION_UPDATE_SCENE_STR,
    payload: data,
  };
}

//更新token信息
export function updateToken(data) {
  return {
    type: ActionType.ACTION_UPDATE_TOKEN,
    payload: data,
  };
}

export function updateLoginStatus(data) {
  return {
    type: ActionType.ACTION_UPDATE_LOGIN_STATUS,
    payload: data,
  };
}

export function updateUserId(data) {
  return {
    type: ActionType.ACTION_UPDATE_USER_ID,
    payload: data,
  };
}

export function updateMobile(mobile) {
  return {
    type: ActionType.ACTION_UPDATE_MOBILE,
    payload: mobile,
  };
}

export function updateOrderId(orderId) {
  return {
    type: ActionType.ACTION_UPDATE_ORDER_ID,
    payload: orderId,
  };
}

export function updateSerialNo(serialNo) {
  return {
    type: ActionType.ACTION_UPDATE_SERIAL_NO,
    payload: serialNo,
  };
}

export function updateLogged(user) {
  return {
    type: ActionType.ACTION_UPDATE_LOGGED,
    payload: user,
  };
}

export function updateSlotNo(slotNo) {
  return {
    type: ActionType.ACTION_UPDATE_SLOT_NO,
    payload: slotNo,
  };
}

export function updateAdminData(adminData) {
  return {
    type: ActionType.ACTION_UPDATE_ADMIN_DATA,
    payload: adminData,
  };
}

export function updateProductId(productId) {
  return {
    type: ActionType.ACTION_UPDATE_PRODUCT_ID,
    payload: productId,
  };
}
