package com.receiver;

import java.io.File;

public class Test {
    public static void main(String[] args){
        File f = new File("D:/rsa.pri");
        System.out.println(System.currentTimeMillis());
        System.out.println(f.lastModified());

        long oneDayMil = 30 * 86400000L;

        System.out.println(oneDayMil);
        System.out.println((System.currentTimeMillis() - f.lastModified())/(24 * 60 * 60 * 1000));
    }
}
