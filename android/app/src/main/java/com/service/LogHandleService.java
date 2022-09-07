package com.service;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.os.SystemClock;
import android.util.Log;

import com.utils.LogUtils;

import java.io.IOException;

public class LogHandleService extends Service {

    public static final String TAG = "LogHandleService";
    private static final long log_interval = 1 * 24 * 60 * 60 * 1000;//1天

    public LogHandleService() {
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
        //throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public int onStartCommand(Intent intent,  int flags, int startId)
    {
        new Thread(new Runnable()
        {
            @Override
            public void run()
            {
                //Log.i(TAG, "5秒后 run() 方法执行了！");
                LogUtils.delExpireFiles();
            }
        }).start();

        AlarmManager alarmManager = (AlarmManager)getSystemService(Context.ALARM_SERVICE);
        //30天秒的时间
        //int time = 1000 * 5;

        //获取系统开机至今所经历的毫秒
        long startTime = SystemClock.elapsedRealtime() + log_interval;
        Intent in  = new Intent(this, LogHandleService.class);
        //自身服务的intend
        PendingIntent pendingIntent = PendingIntent.getService(this,0, in,0);
        //下次执行时间
        alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, startTime, pendingIntent);

        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, " ---------------LogHandleService------------ ！");
        super.onDestroy();
    }
}
