package com.utils;

import org.apache.commons.lang3.StringEscapeUtils;

public class Test {
    public static void main(String[] args){
        //{"getEquipmentProductByCode":"无效的取药码 input\u003c-\u003eequipment_id\u003d5e66e4a8-2b9f-4eec-92a8-b6bfdf9eaaac,pick_up_code\u003d123569 "}
        String sss = "\u003c-\u003e";
        System.out.println(StringEscapeUtils.unescapeJava(sss));
    }
}
