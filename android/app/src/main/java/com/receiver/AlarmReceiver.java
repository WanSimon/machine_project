package com.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.service.LogHandleService;

public class AlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        // an Intent broadcast.
        //throw new UnsupportedOperationException("Not yet implemented");
        Intent i = new Intent(context, LogHandleService.class);
        context.startService(i);
    }
}
