package com.hopeofglory.verserain;

import com.unity3d.player.*;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;

public class Main extends UnityPlayerNativeActivity
{

        protected void checkIntent()
        {
                Intent intent = getIntent();
                String scheme = intent.getScheme();

                if ((scheme != null) && (scheme.equals("verserain"))) {
                        Uri uri = intent.getData();
                        String uriString = uri.toString();
                        UnityPlayer.UnitySendMessage("UserSession", "HandleURL", uriString);
                }
        }

        protected void onNewIntent(Intent intent)
        {
                checkIntent();
                super.onNewIntent(intent);
        }

        // Setup activity layout                                                                                                                                                                         
        protected void onCreate (Bundle savedInstanceState)
        {
                super.onCreate(savedInstanceState);
                checkIntent();
        }

        // Resume Unity                                                                                                                                                                                  
        protected void onResume()
        {
                super.onResume();
                checkIntent();
        }
}
