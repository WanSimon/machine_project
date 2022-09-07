package com.utils;

import android.content.Context;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;

/**
 * UdpUtils
 */
public class UdpUtils {

    private static String mac = null;
    private static Context context;

    private InetAddress inetAddress;
    private DatagramSocket datagramSocket = null;

    /*private static String serverIp = "e3418317h4.wicp.vip";
    private static int serverPort = 54707;*/
    private static String serverIp = "192.168.101.71";
    private static int serverPort = 4444;
    private byte[] dataBuf;

    private static final UdpUtils udpUtils = null;

    private UdpUtils() {
    }

    public static UdpUtils getInstant() {
        if (null == udpUtils) {
            return new UdpUtils();
        }
        return udpUtils;
    }

    /**
     * serverUrl 格式要求 ip:port
     * @param context
     * @param serverUrl
     * @return
     */
    public static UdpUtils getInstant(Context context, String serverUrl) {
        UdpUtils.context = context;

        if(!TextUtils.isEmpty(serverUrl)){
            String[] serverArr = serverUrl.split(":");
            if(serverArr.length == 0){
                Toast.makeText(context, "日志服务器格式错误", Toast.LENGTH_SHORT).show();
                return null;
            }

            UdpUtils.serverIp = serverArr[0];
            UdpUtils.serverPort = Integer.valueOf(serverArr[1]);
        }

        return getInstant();
    }

    //牺牲性能，保证udp 尽量包按顺序发送
    public synchronized  void sendUDPMessage(String msg) {

        try {
            datagramSocket = new DatagramSocket();
            inetAddress = InetAddress.getByName(serverIp);
        } catch (UnknownHostException e) {
            Toast.makeText(context, e.getMessage(), Toast.LENGTH_SHORT).show();
            e.printStackTrace();
        } catch (SocketException e) {
            Toast.makeText(context, e.getMessage(), Toast.LENGTH_SHORT).show();
            e.printStackTrace();
        } catch (Exception e) {
            Toast.makeText(context, e.getMessage(), Toast.LENGTH_SHORT).show();
            e.printStackTrace();
        }

        /*ThreadPoolManager.getSingleInstance().executeTask(new Runnable() {
            @Override
            public void run() {*/
                try {
                    dataBuf = msg.getBytes("utf-8");
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
                DatagramPacket recvPacket = new DatagramPacket(dataBuf, dataBuf.length, inetAddress, serverPort);
                try {
                    //datagramSocket.setSendBufferSize(1024 * 1024 * 1024);
                    //datagramSocket.setReceiveBufferSize(1024 * 1024 * 1024);
                    datagramSocket.send(recvPacket);
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    datagramSocket.close();
                }
       /*     }
        });*/

    }

    public static void main(String[] args){
        try {
            String msg = "{\"mac\":\"23AF45AE9912\",\"client_ip\":\"192.168.101.12\",\"datetime\":\"2021-12 - 21 10:03:23.45\",\"log_level\":\"info\",\"thread_id\":\"34354565656\",\"method\":\"getAddr\",\"msg\":\"12,\\\"x_aisle_count\\\":1,\\\"x\\\":4,\\\"y\\\":1,\\\"colspan\\\":1},{\\\"slot_no\\\":13,\\\"x_aisle_count\\\":1,\\\"x\\\":5,\\\"y\\\":1,\\\"colspan\\\":1},{\\\"slot_no\\\":14,\\\"x_aisle_count\\\":1,\\\"x\\\":6,\\\"y\\\":1,\\\"colspan\\\":1},{\\\"slot_no\\\":15,\\\"x_aisle_count\\\":1,\\\"x\\\":0,\\\"y\\\":2,\\\"colspan\\\":1},{\\\"slot_no\\\":16,\\\"x_aisle_count\\\":1,\\\"x\\\":1,\\\"y\\\":2,\\\"colspan\\\":1},{\\\"slot_no\\\":17,\\\"x_aisle_count\\\":1,\\\"x\\\":2,\\\"y\\\":2,\\\"colspan\\\":1},{\\\"slot_no\\\":18,\\\"x_aisle_count\\\":1,\\\"x\\\":3,\\\"y\\\":2,\\\"colspan\\\":1},{\\\"slot_no\\\":19,\\\"x_aisle_count\\\":1,\\\"x\\\":4,\\\"y\\\":2,\\\"colspan\\\":1},{\\\"slot_no\\\":20,\\\"x_aisle_count\\\":1,\\\"x\\\":5,\\\"y\\\":2,\\\"colspan\\\":1},{\\\"slot_no\\\":21,\\\"x_aisle_count\\\":1,\\\"x\\\":6,\\\"y\\\":2,\\\"colspan\\\":1},{\\\"slot_no\\\":22,\\\"x_aisle_count\\\":1,\\\"x\\\":0,\\\"y\\\":3,\\\"colspan\\\":1},{\\\"slot_no\\\":23,\\\"x_aisle_count\\\":1,\\\"x\\\":1,\\\"y\\\":3,\\\"colspan\\\":1},{\\\"slot_no\\\":24,\\\"x_aisle_count\\\":1,\\\"x\\\":2,\\\"y\\\":3,\\\"colspan\\\":1},{\\\"slot_no\\\":25,\\\"x_aisle_count\\\":1,\\\"x\\\":3,\\\"y\\\":3,\\\"colspan\\\":1},{\\\"slot_no\\\":26,\\\"x_aisle_count\\\":1,\\\"x\\\":4,\\\"y\\\":3,\\\"colspan\\\":1},{\\\"slot_no\\\":27,\\\"x_aisle_count\\\":1,\\\"x\\\":5,\\\"y\\\":3,\\\"col4444444444444444444444444444444444444444444444444444444444444443333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333399999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999998888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888877777777777777777777777777777777777777777777777777777777777777777777777777777777777777555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555588888888888888888888888555555555555555555555555555555555555555555555555555555555555555555555span\\\":1},{\\\"slot_no\\\":2\"}";
            byte[] sssss = msg.getBytes();
            System.out.println(sssss.length);
            UdpUtils.getInstant().sendUDPMessage(msg);
            //String sss = "123";
            //System.out.println(sss.substring(0, 5));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
