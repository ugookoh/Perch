package com.perch;

import com.facebook.react.ReactActivity;
import android.os.Bundle;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState){
    setTheme(R.style.AppTheme); // Now set the theme from Splash to App before setContentView
    setContentView(R.layout.launch_screen); // Then inflate the new view
    SplashScreen.show(this,true);
    super.onCreate(savedInstanceState);
  }
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   *
   */
  @Override
  protected String getMainComponentName() { return "Perch"; }
}
