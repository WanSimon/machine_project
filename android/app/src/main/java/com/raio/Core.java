package com.raio;

import com.vendor.MainApplication;

public class Core {
    static {
        try {
            System.loadLibrary("RAIO_CS");
            //MainApplication.getInstance().toast("load library");
        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
            MainApplication.getInstance().toast("load library fail reason is" + e.getMessage());
        }
    }

    public static native String init();
    public static native int loop();
    public static native String version();
    public static native int uninit();

}
