using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class VoiceSynth {
       /* Interface to native implementation */
       
       [DllImport ("__Internal")]
       private static extern void _SpeakUtterance (string text, string language);

       // Starts lookup for some bonjour registered service inside specified domain
       public static void SpeakUtterance(string text, string language)
       {
		// Call plugin only when running on real device
		if ((Application.platform != RuntimePlatform.OSXEditor) &&
                    (Application.platform != RuntimePlatform.OSXWebPlayer) &&
                    (Application.platform != RuntimePlatform.WindowsWebPlayer)) {
		  _SpeakUtterance(text, language);
                }
       }
} 