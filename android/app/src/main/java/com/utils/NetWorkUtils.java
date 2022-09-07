package com.utils;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.util.Log;
import android.widget.Toast;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

/**
 * 获取网络ip
 */
public class NetWorkUtils {
    /**
     * 检查网络是否可用
     *
     * @param paramContext
     * @return
     */
    public static boolean checkEnable(Context paramContext) {
        boolean i = false;
        NetworkInfo localNetworkInfo = ((ConnectivityManager) paramContext.getSystemService(Context.CONNECTIVITY_SERVICE)).getActiveNetworkInfo();

        if ((localNetworkInfo != null) && (localNetworkInfo.isAvailable()))
            return true;
        return false;
    }

    /**
     * 将ip的整数形式转换成ip形式
     *
     * @param ipInt
     * @return
     */
    public static String int2ip(int ipInt) {
        StringBuilder sb = new StringBuilder();
        sb.append(ipInt & 0xFF).append(".");
        sb.append((ipInt >> 8) & 0xFF).append(".");
        sb.append((ipInt >> 16) & 0xFF).append(".");
        sb.append((ipInt >> 24) & 0xFF);
        return sb.toString();
    }

    /**
     * 获取当前ip地址
     * 获取wifi地址
     *
     * @param context
     * @return
     */
    private static String getWifiIpAddress(Context context) {
        try {
            WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            int i = wifiInfo.getIpAddress();
            return int2ip(i);
        } catch (Exception ex) {
            /*LogUtils logUtils = LogUtils.getInstant(context, true, true);
            try {
                logUtils.e("network", "获取IP出错鸟!!!!请保证是WIFI,或者请重新打开网络!\n" + ex.getMessage());
            } catch (IOException e) {
                e.printStackTrace();
            }*/
            Log.e("network-ip", "获取IP出错了!!!!请保证是WIFI,或者请重新打开网络!\n" + ex.getMessage());
        }
        return null;
    }

    //GPRS连接下的ip
    private static String getLocalIpAddress() {
        try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements(); ) {
                NetworkInterface intf = en.nextElement();
                for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements(); ) {
                    InetAddress inetAddress = enumIpAddr.nextElement();
                    if (!inetAddress.isLoopbackAddress() && inetAddress instanceof Inet4Address) {
                        return inetAddress.getHostAddress().toString().replace("/", "");
                    }
                }
            }
        } catch (SocketException ex) {
            Log.e("network-ip", ex.toString());
        }
        return null;
    }

    /**
     * 获取ip
     * @param paramContext
     * @return
     */
    public static String getIp(Context paramContext) {
        String ip = "";
        ConnectivityManager conMann = (ConnectivityManager) paramContext.getSystemService(Context.CONNECTIVITY_SERVICE);

        NetworkInfo wifiNetworkInfo = conMann.getNetworkInfo(ConnectivityManager.TYPE_WIFI);
        if (wifiNetworkInfo.isConnected()) {
            ip = getWifiIpAddress(paramContext);
        } else {
            NetworkInfo mobileNetworkInfo = conMann.getNetworkInfo(ConnectivityManager.TYPE_MOBILE);
            if (mobileNetworkInfo.isConnected()){
                ip = getLocalIpAddress();
            }
        }
        //Toast.makeText(paramContext, ip, Toast.LENGTH_SHORT).show();
        return ip;
    }
}
