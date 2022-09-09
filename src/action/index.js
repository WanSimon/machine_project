export const ActionType = {
  ACTION_UPGRADE_EQUIPMENT_INFO: 'action_upgrade_equipment_info',
  ACTION_UPGRADE_PICKUP_STATUS: 'action_upgrade_pickup_status',
  ACTION_UPGRADE_STATUS_FLAG: 'action_upgrade_status_flag',
  ACTION_UPGRADE_CART: 'action_upgrade_cart',
  ACTION_CLEAR_CART: 'action_clear_cart',
  ACTION_ADD_CUSTOMER: 'action_add_customer',
  ACTION_UPGRADE_ORDER: 'action_upgrade_order',
  ACTION_UPGRADE_CODE_ORDER: 'action_upgrade_code_order',
};

//更新设备信息
export function upgradeEquipmentInfo(equipmentInfo) {
  //合并各槽道的同品类药品
  let slot_product_list_info = [];
  if (
    equipmentInfo.equipment_product_info &&
    equipmentInfo.equipment_product_info.slot_product_list_info
  ) {
    let slotProductList =
      equipmentInfo.equipment_product_info.slot_product_list_info;
    for (let i = 0; i < slotProductList.length; ++i) {
      let slotProductInfo = slotProductList[i];
      let bFound = false;
      for (let j = 0; j < slot_product_list_info.length; ++j) {
        if (
          slotProductInfo.merchant_product_info.merchant_product_id ===
          slot_product_list_info[j].merchant_product_info.merchant_product_id
        ) {
          slot_product_list_info[j].real_stock =
            slot_product_list_info[j].real_stock + slotProductInfo.real_stock;
          slot_product_list_info[j].lock_stock =
            slot_product_list_info[j].lock_stock + slotProductInfo.lock_stock;
          bFound = true;
          break;
        }
      }
      if (!bFound) {
        slot_product_list_info.push({
          merchant_product_info: slotProductInfo.merchant_product_info,
          real_stock: slotProductInfo.real_stock,
          lock_stock: slotProductInfo.lock_stock,
        });
      }
    }
  }
  equipmentInfo.product_list = slot_product_list_info;
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

//添加会员标识
export function addCustomer() {
  return {
    type: ActionType.ACTION_ADD_CUSTOMER,
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

//更新取药码订单
export function upgradeCodeOrder(data) {
  return {
    type: ActionType.ACTION_UPGRADE_CODE_ORDER,
    payload: data,
  };
}
