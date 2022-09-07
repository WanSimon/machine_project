package com.vendor;

import android.os.Build;
import android.text.TextUtils;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.toast.ToastModule;
import com.raio.Core;
import com.raio.Vendor;
import com.raio.Ticket;
import com.utils.LogUtils;

import java.util.Map;
import java.util.HashMap;

import java.io.File;
import java.io.FilenameFilter;
import java.io.DataOutputStream;
import java.io.IOException;
import ZtlApi.ZtlManager;


public class Api extends ReactContextBaseJavaModule {

    static ReactApplicationContext mReactContext;

    public Api(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    private final String[] devAddress = new String[]{
            "/dev/ttyS0", "/dev/ttyS1", "/dev/ttyS2", "/dev/ttyS3",
            "/dev/ttyS4", "/dev/ttyUSB0", "/dev/ttyUSB1", "/dev/ttyUSB2", "/data/local/tmp", "/data/siyoo/log"
    };

    @Override
    public String getName() {
        return "RaioApi";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    @ReactMethod
    public void init(Callback response) {
        //Toast.makeText(mReactContext, "", Toast.LENGTH_SHORT).show();
        initJniToSo();
        String res = Core.init();
        //Toast.makeText(mReactContext, res, Toast.LENGTH_LONG).show();
        response.invoke(res);
    }

    @ReactMethod
    public void version(Callback response) {
        String res = Core.version();
        response.invoke(res);
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @ReactMethod
    public void getStatus(int container_num,Callback response) {
        try {
            int res = Vendor.getStatus(container_num);
            MainApplication.getInstance().toast("getStatus response:"+res );
            response.invoke(res);
        }
        catch (Exception e){
            try {
                LogUtils.getInstant(mReactContext, null, null, null).e("Api", "getStatus fail reason is" + e.getMessage());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
            MainApplication.getInstance().toast("getStatus fail reason is" + e.getMessage());
        }
    }

    @ReactMethod
    public void getType(Callback response) {
        int res = Ticket.getType();
        response.invoke(res);
    }

    @ReactMethod
    public void getMac(Callback response) {
        ZtlManager mZtlManager = new ZtlManager(mReactContext);
        String mac = mZtlManager.getMacAddress();
        response.invoke(mac);
    }

    @ReactMethod
    public void printText(String str, int align, int size, int bold, int cut,Callback response) {
        int res = Ticket.printText(str, str.getBytes().length, align, size, bold, cut);
        response.invoke(res);
    }

    @ReactMethod
    public void printImage(String image_info,int align,int cut,Callback response) {
         int res = Ticket.printImage(image_info, image_info.getBytes().length, align, cut);
         response.invoke(res);
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @ReactMethod
    public void out(int container_num,int x,int y,Callback response) {
        try {
            int res = Vendor.getInstance().runOut(container_num,x,y,0);
            //MainApplication.getInstance().toast("out response:"+res );
            response.invoke(res);
        }
        catch (Exception e){
            try {
                LogUtils.getInstant(mReactContext, null, null, null).e("Api", "out fail reason is" + e.getMessage());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
            MainApplication.getInstance().toast("out fail reason is" + e.getMessage());
        }
    }

    /**
     * level: v,d,i,w,e
     * @param
     * @param
     * @param
     */
    @ReactMethod
    public void logObj(String tag, ReadableMap body, String level) throws IOException {
        if(null == body){
            return;
        }
        if(TextUtils.isEmpty(tag)){
            tag = "buss";
        }
        if(TextUtils.isEmpty(level)){
            level = "i";
        }

        if("v".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, null).v(tag, body);
        } else if("d".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, null).d(tag, body);
        } else if("i".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, null).i(tag, body);
        } else if("w".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, null).w(tag, body);
        }  else if("e".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, null).e(tag, body);
        }

    }

    @ReactMethod
    public void logO(ReadableMap body, String level, String serverUrl) throws IOException {
        if(null == body){
            return;
        }

        if(TextUtils.isEmpty(level)){
            level = "i";
        }
        String tag = "buss";

        if("v".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).v(tag, body);
        } else if("d".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).d(tag, body);
        } else if("i".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).i(tag, body);
        } else if("w".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).w(tag, body);
        }  else if("e".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).e(tag, body);
        }

    }

    @ReactMethod
    public void error(ReadableMap body, String serverUrl) throws IOException {
        if(null == body){
            return;
        }
        String tag = "buss";
        LogUtils.getInstant(mReactContext, null, null, serverUrl).e(tag, body);
    }

    @ReactMethod
    public void info(ReadableMap body, String serverUrl) throws IOException {
        if(null == body){
            return;
        }
        String tag = "buss";
        LogUtils.getInstant(mReactContext, null, null, serverUrl).i(tag, body);
    }

    @ReactMethod
    public void debug(ReadableMap body, String serverUrl) throws IOException {
        if(null == body){
            return;
        }
        String tag = "buss";
        LogUtils.getInstant(mReactContext, null, null, serverUrl).d(tag, body);
    }

    @ReactMethod
    public void logT(String _log, String level, String serverUrl) throws IOException {
        if(TextUtils.isEmpty(_log)){
            return;
        }
        String tag = "buss";
        if(TextUtils.isEmpty(level)){
            level = "i";
        }

        if("v".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).v(tag, _log);
        } else if("d".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).d(tag, _log);
        } else if("i".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).i(tag, _log);
        } else if("w".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).w(tag, _log);
        }  else if("e".equalsIgnoreCase(level)){
            LogUtils.getInstant(mReactContext, null, null, serverUrl).e(tag, _log);
        }

    }

    //初始化之前 要删除部分文件
    private void initJniToSo() {
        for (String address : devAddress) {
            File file = new File(address);
            if (file.exists() && (!file.canRead() || !file.canWrite())) {
                boolean updateRootPermission = updateRootPermission(file.getAbsolutePath());
            }
        }
        File file = new File("/data/local/tmp");
        if (file.exists() && file.isDirectory()) {
            File[] files = file.listFiles(new FilenameFilter() {
                @Override
                public boolean accept(File dir, String name) {
                    return name.startsWith("LCK");
                }
            });
            if(null != files && files.length >0 ){
              for (File it : files) {
                            if (it.isFile() && it.exists()) {
                                it.delete();
                            }
                        }
            }

        }
    }

    private boolean updateRootPermission(String path) {
        Process process = null;
        DataOutputStream dataOutputStream = null;
        try {
            String cmd = "chmod 777 " + path;
            process = Runtime.getRuntime().exec("/system/xbin/su");
            dataOutputStream = new DataOutputStream(process.getOutputStream());
            dataOutputStream.writeBytes(cmd + "\n");
            dataOutputStream.writeBytes("exit\n");
            dataOutputStream.flush();
            process.waitFor();
        } catch (Exception ignore) {
            return false;
        } finally {
            if (process != null) {
                process.destroy();
            }
            if (dataOutputStream != null) {
                try {
                    dataOutputStream.close();
                } catch (IOException ignore) {
                }
            }
        }
        return true;
    }

    public static void sendOutResponse(int type,int container_num,int x,int y,int reserved) {
        WritableMap event = Arguments.createMap();
        //传递的参数
        event.putInt("type",type);
        event.putInt("container_num",container_num);
        event.putInt("x",x);
        event.putInt("y",y);
        event.putInt("reserved",reserved);
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("out_callback", event);
    }

}
