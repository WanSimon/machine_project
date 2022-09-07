package com.utils;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableMap;

import org.apache.commons.lang3.StringEscapeUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import ZtlApi.ZtlManager;

/**
 * VERBOSE,DEBUG,INFO,WARN,ERROR
 */
public class LogUtils {

    private static Boolean LOG_SWITCH = true; // 日志文件总开关
    private static Boolean LOG_WRITE_TO_FILE = true;// 日志写入文件开关
    private static char LOG_TYPE = 'v';// 输入日志类型，w代表只输出告警信息等，v代表输出所有信息
    private static String LOG_PATH_SDCARD_DIR = "/data/siyoo/log";//"/sdcard/siyoo/log";// 日志文件在sdcard中的路径
    private static int SDCARD_LOG_FILE_SAVE_DAYS = 30;// sd卡中日志文件的最多保存天数
    private static float SDCARD_LOG_FILE_SIZE = 50f;// sd卡中日志文件大小 m
    private static int MAX_MSGCONTENT_LENGTH = 1000;// msg 字段udp最长限制
    private static String LOGFILEName = "log.log";// 本类输出的日志文件名称
    private static SimpleDateFormat LogSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");// 日志的输出格式
    private static SimpleDateFormat logfile = new SimpleDateFormat("yyyy-MM-dd");// 日志文件格式
    private static String mac = null;
    private static String serverUrl = null;

    private static Context context;

    private static final LogUtils logUtils = null;

    private LogUtils() {
    }

    public static LogUtils getInstant() {
        if (null == logUtils) {
            return new LogUtils();
        }
        return logUtils;
    }

    public static LogUtils getInstant(Context context, Boolean logSwitch, Boolean logWriteToFile, String serverUrl) {
        LogUtils.context = context;
        LogUtils.serverUrl = serverUrl;

        if (null != logSwitch) {
            LogUtils.LOG_SWITCH = logSwitch;
        }
        if (null != logWriteToFile) {
            LogUtils.LOG_WRITE_TO_FILE = logWriteToFile;
        }

        if (null == logUtils) {
            return new LogUtils();
        }
        return logUtils;
    }

    public void v(String tag, ReadableMap text) throws IOException {
        log(tag, text, 'v');
    }

    public void w(String tag, ReadableMap text) throws IOException {
        log(tag, text, 'w');
    }

    public void e(String tag, ReadableMap text) throws IOException {
        log(tag, text, 'e');
    }

    public void d(String tag, ReadableMap text) throws IOException {
        log(tag, text, 'd');
    }

    public void i(String tag, ReadableMap text) throws IOException {
        log(tag, text, 'i');
    }

    //log string
    public void v(String tag, String _log) throws IOException {
        log(tag, _log, 'v');
    }

    public void w(String tag, String _log) throws IOException {
        log(tag, _log, 'w');
    }

    public void e(String tag, String _log) throws IOException {
        log(tag, _log, 'e');
    }

    public void d(String tag, String _log) throws IOException {
        log(tag, _log, 'd');
    }

    public void i(String tag, String _log) throws IOException {
        log(tag, _log, 'i');
    }

    /**
     * 根据tag, msg和等级，输出日志
     *
     * @param tag
     * @param msg
     * @param level
     */
    public void log(String tag, ReadableMap msg, char level) throws IOException {

        if (LOG_SWITCH) {//日志文件总开关

            String datetime = LogSdf.format(new Date());
            if (null == mac) {
                try {
                    ZtlManager mZtlManager = new ZtlManager(context);
                    mac = mZtlManager.getMacAddress();
                } catch (Exception e) {

                }
            }
            String ip = NetWorkUtils.getIp(context);
            ReadableNativeMap logNativeMap = (ReadableNativeMap) msg;
            //Map logMap = logNativeMap.toHashMap();
            LinkedHashMap logMap = new LinkedHashMap<>();
            logMap.put("mac", mac);
            logMap.put("client_ip", ip);
            logMap.put("datetime", datetime);

            String logLevel = "";
            if ('e' == level && ('e' == LOG_TYPE || 'v' == LOG_TYPE)) { // 输出错误信息
                logLevel = "error";
            } else if ('w' == level && ('w' == LOG_TYPE || 'v' == LOG_TYPE)) {
                logLevel = "warn";
            } else if ('d' == level && ('d' == LOG_TYPE || 'v' == LOG_TYPE)) {
                logLevel = "debug";
            } else if ('i' == level && ('d' == LOG_TYPE || 'v' == LOG_TYPE)) {
                logLevel = "info";
            } else {
                logLevel = "verbose";
            }
            logMap.put("log_level", logLevel);
            logMap.put("thread_id", Thread.currentThread().getId());
            if (logNativeMap.hasKey("method")) {
                logMap.put("method", logNativeMap.getString("method"));
            } else {
                logMap.put("method", "");
            }

            if (logNativeMap.hasKey("msg")) {
                logMap.put("msg", logNativeMap.getString("msg"));
            } else {
                logMap.put("msg", "");
            }

            //String _log = new JSONObject(logNativeMap.toHashMap()).toString();
            String _log = new JSONObject(logMap).toString();
            if ('e' == level && ('e' == LOG_TYPE || 'v' == LOG_TYPE)) { // 输出错误信息
                Log.e(tag, _log);
            } else if ('w' == level && ('w' == LOG_TYPE || 'v' == LOG_TYPE)) {
                Log.w(tag, _log);
            } else if ('d' == level && ('d' == LOG_TYPE || 'v' == LOG_TYPE)) {
                Log.d(tag, _log);
            } else if ('i' == level && ('d' == LOG_TYPE || 'v' == LOG_TYPE)) {
                Log.i(tag, _log);
            } else {
                Log.v(tag, _log);
            }

            //日志写入文件开关
            if (LOG_WRITE_TO_FILE) {
                writeLogtoFile(String.valueOf(level), tag, logMap);
            }
        }
    }

    /**
     * log string only
     *
     * @param tag
     * @param _log
     * @param level
     * @throws IOException
     */
    public void log(String tag, String _log, char level) throws IOException {

        if (LOG_SWITCH) {//日志文件总开关
            if ('e' == level && ('e' == LOG_TYPE || 'v' == LOG_TYPE)) { // 输出错误信息
                Log.e(tag, _log);
            } else if ('w' == level && ('w' == LOG_TYPE || 'v' == LOG_TYPE)) {
                Log.w(tag, _log);
            } else if ('d' == level && ('d' == LOG_TYPE || 'v' == LOG_TYPE)) {
                Log.d(tag, _log);
            } else if ('i' == level && ('d' == LOG_TYPE || 'v' == LOG_TYPE)) {
                Log.i(tag, _log);
            } else {
                Log.v(tag, _log);
            }

            //日志写入文件开关
            if (LOG_WRITE_TO_FILE) {
                //writeLogtoFile(String.valueOf(level), tag, _log);
            }
        }
    }

    /**
     * 打开日志文件并写入日志
     *
     * @param mylogtype
     * @param tag
     * @param
     */
   /* public void writeLogtoFile(String mylogtype, String tag, String _log) throws IOException {

        Date nowtime = new Date();
        String needWriteFile = logfile.format(nowtime);
        if (null != _log) {
            _log = StringEscapeUtils.unescapeJava(_log);
        }

        try {
            JSONObject logJson = new JSONObject(_log);
            String msgContent = logJson.getString("msg");
            int msgSectioniCount = (msgContent.length() + MAX_MSGCONTENT_LENGTH) / MAX_MSGCONTENT_LENGTH;
            String oneMsgSection;
            for(int i=0; i< msgSectioniCount; i++){
                oneMsgSection = msgContent.substring(i * MAX_MSGCONTENT_LENGTH, (i +1)*MAX_MSGCONTENT_LENGTH);
                logJson.put("msg", oneMsgSection);
                UdpUtils.getInstant(context, LogUtils.serverUrl).sendUDPMessage(logJson.toString());
                try {
                    Thread.sleep(500l);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }

        File dirPath = Environment.getExternalStorageDirectory();//.getExternalStorageDirectory();
        File dirsFile = new File(dirPath.getAbsolutePath() + LOG_PATH_SDCARD_DIR);
        if (!dirsFile.exists()) {
            dirsFile.mkdirs();
        }
        File file = new File(dirsFile.toString(), needWriteFile + "-" + LOGFILEName);// MYLOG_PATH_SDCARD_DIR

        if (!file.exists()) {
            try {
                file.createNewFile();
            } catch (Exception e) {

            }
        } else {
            FileInputStream fis = null;
            try {
                fis = new FileInputStream(file);
                if (fis.available() > SDCARD_LOG_FILE_SIZE * 1024 * 1024) {
                    fis.close();
                    file.createNewFile();
                }
            } catch (FileNotFoundException e) {

            } finally {
                if (null != fis) {
                    fis.close();
                }
            }
        }

        try {
            FileWriter filerWriter = new FileWriter(file, true);// 后面这个参数代表是不是要接上文件中原来的数据，不进行覆盖
            BufferedWriter bufWriter = new BufferedWriter(filerWriter);
            bufWriter.write(_log);
            bufWriter.newLine();
            bufWriter.close();
            filerWriter.close();
        } catch (IOException e) {

            if (null != context) {
                //Toast.makeText(context, e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }
    }*/

    public void writeLogtoFile(String mylogtype, String tag, LinkedHashMap logMap) throws IOException {

        Date nowtime = new Date();
        String needWriteFile = logfile.format(nowtime);

        try {
            String msgContent = replaceBlank(StringEscapeUtils.unescapeJava((String)logMap.get("msg")));
            int msgSectioniCount = (msgContent.length() + MAX_MSGCONTENT_LENGTH) / MAX_MSGCONTENT_LENGTH;
            String oneMsgSection;

            if(msgContent.length() <= MAX_MSGCONTENT_LENGTH){
                UdpUtils.getInstant(context, LogUtils.serverUrl).sendUDPMessage(new JSONObject(logMap).toString());
            } else {
                //System.out.println("-------------------------:" + msgContent);
                int i=0;
                for(i=0; i< msgSectioniCount -1; i++){
                    oneMsgSection = msgContent.substring(i * MAX_MSGCONTENT_LENGTH, (i +1)*MAX_MSGCONTENT_LENGTH);
                    //System.out.println("*********************:" + oneMsgSection);
                    logMap.put("msg", oneMsgSection);
                    UdpUtils.getInstant(context, LogUtils.serverUrl).sendUDPMessage(new JSONObject(logMap).toString());
               /* try {
                    Thread.sleep(500l);//防止udp无序
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }*/
                }
                //最后一条
                oneMsgSection = msgContent.substring(i * MAX_MSGCONTENT_LENGTH);
                //System.out.println("*********************:" + oneMsgSection);
                logMap.put("msg", oneMsgSection);
                UdpUtils.getInstant(context, LogUtils.serverUrl).sendUDPMessage(new JSONObject(logMap).toString());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        File dirPath = Environment.getExternalStorageDirectory();//.getExternalStorageDirectory();
        File dirsFile = new File(dirPath.getAbsolutePath() + LOG_PATH_SDCARD_DIR);
        if (!dirsFile.exists()) {
            dirsFile.mkdirs();
        }
        File file = new File(dirsFile.toString(), needWriteFile + "-" + LOGFILEName);// MYLOG_PATH_SDCARD_DIR

        if (!file.exists()) {
            try {
                file.createNewFile();
                //String cmd = "logcat -d-f " + file.getAbsolutePath();
                //Runtime.getRuntime().exec(cmd);
            } catch (Exception e) {
                /*sendExceptionLogEventContext(context, e);
                e.printStackTrace();
                if(null != context){
                    Toast.makeText(context, e.getMessage(), Toast.LENGTH_SHORT).show();
                }*/
            }
        } else {
            FileInputStream fis = null;
            try {
                fis = new FileInputStream(file);
                if (fis.available() > SDCARD_LOG_FILE_SIZE * 1024 * 1024) {
                    fis.close();
                    file.createNewFile();
                }
            } catch (FileNotFoundException e) {

            } finally {
                if (null != fis) {
                    fis.close();
                }
            }
        }

        try {
            String _log = new JSONObject(logMap).toString();
            if (null != _log) {
                _log = StringEscapeUtils.unescapeJava(_log);
            }
            FileWriter filerWriter = new FileWriter(file, true);// 后面这个参数代表是不是要接上文件中原来的数据，不进行覆盖
            BufferedWriter bufWriter = new BufferedWriter(filerWriter);
            bufWriter.write(_log);
            bufWriter.newLine();
            bufWriter.close();
            filerWriter.close();
        } catch (IOException e) {

            if (null != context) {
                //sendExceptionLogEventContext(context, e);
                //Toast.makeText(context, e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }
    }

    private String replaceBlank(String src) {
        String dest = "";
        if (src != null) {
            Pattern pattern = Pattern.compile("\t|\r|\n|\\s*");
            Matcher matcher = pattern.matcher(src);
            dest = matcher.replaceAll("");
        }
        return dest;
    }

    /**
     * 删除制定的日志文件
     */
    public static void delFile() {
        String needDelFiel = logfile.format(getDateBefore());
        File dirPath = Environment.getExternalStorageDirectory();
        File file = new File(dirPath + LOG_PATH_SDCARD_DIR, needDelFiel + "  " + LOGFILEName);// MYLOG_PATH_SDCARD_DIR
        if (file.exists()) {
            file.delete();
        }
    }

    /**
     * 删除过期文件
     */
    public static void delExpireFiles() {
        //过期的文件
        Date invalidDate = getDateBefore();
        long currntTime = System.currentTimeMillis();
        File dirPath = Environment.getExternalStorageDirectory();
        File file = new File(dirPath + LOG_PATH_SDCARD_DIR);
        if (file.exists()) {
            File[] logFiles = file.listFiles();
            long oneDayMil = 86400000L;
            for (File _file : logFiles) {
                if ((currntTime - _file.lastModified()) > SDCARD_LOG_FILE_SAVE_DAYS * oneDayMil) {
                    _file.delete();
                }
            }
        }
    }

    /**
     * 得到现在时间前的几天日期，用来得到需要删除的日志文件名
     */
    private static Date getDateBefore() {
        Date nowtime = new Date();
        Calendar now = Calendar.getInstance();
        now.setTime(nowtime);
        now.set(Calendar.DATE, now.get(Calendar.DATE) - SDCARD_LOG_FILE_SAVE_DAYS);

        return now.getTime();
    }

    /**
     * 接收log事件
     *
     * @param eventName
     * @param logs
     */
    private void sendLogEventContext(Context context, String eventName, @NonNull String logs) {
        ReactApplicationContext mReactContext = (ReactApplicationContext) context;
        WritableMap logMap = Arguments.createMap();
        if (null == eventName) {
            eventName = "appLog";
        }

        logMap.putString(eventName, logs);
       /* mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, logMap);*/
    }

    private void sendExceptionLogEventContext(Context context, Exception e) {
        StackTraceElement[] stacks = e.getStackTrace();
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        StringBuffer sb = new StringBuffer("[e] " + format.format(new Date()) + " " + e.getMessage()).append("\n");
        for (StackTraceElement _stack : stacks) {
            sb.append(_stack.toString()).append("\n");
        }
        sendLogEventContext(context, null, sb.toString());
    }
}
