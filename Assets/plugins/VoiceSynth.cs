using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class VoiceSynth{
/*Interfacetonativeimplementation*/

#if UNITY_ANDROID
private	static AndroidJavaObject androidPluginObject;
#endif

[DllImport("__Internal")]
private static extern void _SpeakUtterance(string text,string language);

//Startslookupforsomebonjourregisteredserviceinsidespecifieddomain
public static void SpeakUtterance(string text,string language)
{
#if UNITY_ANDROID
		if (Application.platform == RuntimePlatform.Android) {
			if (androidPluginObject == null) {
				androidPluginObject = new AndroidJavaObject("com.hopeofglory.verserain.VoiceSynthClient");
				androidPluginObject.Call("Init");
			}
			androidPluginObject.Call("Speak", new object[] {text, language});
		}
#endif

		if((Application.platform!=RuntimePlatform.OSXEditor)&&
		   (Application.platform!=RuntimePlatform.OSXWebPlayer)&&
		   (Application.platform!=RuntimePlatform.WindowsWebPlayer)&&(Application.platform!=RuntimePlatform.Android)){
			_SpeakUtterance(text,language);
		}
}
}