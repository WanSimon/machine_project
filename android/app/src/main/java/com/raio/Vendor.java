package com.raio;

import com.vendor.Api;

public class Vendor {
    private static Vendor Instance;
    public Vendor() {
    }

    public static Vendor getInstance(){
        if (Instance == null){
            Instance = new Vendor();
        }
        return Instance;
    }

    public int runOut(int container_num,int columns,int row,int reserved){
        return out(this, container_num, columns, row, reserved);
    }

    public int lighting(int op,int type){
        return operate(this,op,type);
    }

    public static native int operate(Vendor vendor,int operate,int type);
    public static native int out(Vendor vendor,int container_num, int columns, int row, int reserved);
    public static native int getStatus(int container_num);

    public void RAIO_Vendor_operate_callback(int operate,int type){

    }

    public void RAIO_Vendor_out_callback(int type,int container_num, int x,int y,int reserved){
        Api.sendOutResponse(type,container_num,x,y,reserved);
    }
}
