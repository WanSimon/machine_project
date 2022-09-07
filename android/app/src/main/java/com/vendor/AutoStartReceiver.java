package com.vendor;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * 开机自启动广播接收
 */
public class AutoStartReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Intent startIntent = new Intent(context, MainActivity.class);
        startIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(startIntent);

       /* Intent i = new Intent(context, LogHandleService.class);
        context.startService(i);*/
    }
}
