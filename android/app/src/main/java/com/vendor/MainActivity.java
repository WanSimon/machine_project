package com.vendor;
import com.facebook.react.ReactActivity;
import com.receiver.AlarmReceiver;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;

import ZtlApi.ZtlManager;

public class MainActivity extends ReactActivity {
  private ZtlManager mZtlManager = new ZtlManager(MainActivity.this);

  private AlarmReceiver msgReceiver;

  @Override
  protected String getMainComponentName() {
    return "vendor";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.mZtlManager.setCloseSystemBar();

    //开启日志处理服务
    /*Intent intent = new Intent(MainActivity.this, LogHandleService.class);
    startService(intent);*/

    //动态注册广播接收器
    msgReceiver = new AlarmReceiver();
    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction("com.receiver.AlarmReceiver");//这里面的Action可以根据你的包来,这里的包是com.raio.receiver
    registerReceiver(msgReceiver, intentFilter);//如果是在fragment，那么getActivity().registerReceiver(msgReceiver, intentFilter);

    Intent intent = new Intent("com.receiver.AlarmReceiver");  //这里的action要一致。
    sendBroadcast(intent);
  }

  @Override
  protected void onDestroy(){
    super.onDestroy();
    this.mZtlManager.setOpenSystemBar();

    unregisterReceiver(msgReceiver);
  }
}
