package com.raio;


public class Ticket {

    public static native int getType();
    public static native int printText(String str, int str_len, int align, int size, int bold, int cut);
    public static native int printImage(String image_info,int image_len,int align,int cut);
}
