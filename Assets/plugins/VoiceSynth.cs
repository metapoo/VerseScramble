using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class VoiceSynth{
/*Interfacetonativeimplementation*/

private	static AndroidJavaObject androidPluginObject;
[DllImport("__Internal")]
private static extern void _SpeakUtterance(string text,string language);

//Startslookupforsomebonjourregisteredserviceinsidespecifieddomain
public static void SpeakUtterance(string text,string language)
{
		//Callpluginonlywhenrunningonrealdevice
		if (Application.platform == RuntimePlatform.Android) {
			androidPluginObject = new AndroidJavaObject("com.hopeofglory.verserain.VoiceSynthClient");
			androidPluginObject.Call("Init");
			androidPluginObject.Call("Speak", text);
		//	Debug.Log("************************** it works");	
		}


		if((Application.platform!=RuntimePlatform.OSXEditor)&&
		   (Application.platform!=RuntimePlatform.OSXWebPlayer)&&
		   (Application.platform!=RuntimePlatform.WindowsWebPlayer)&&(Application.platform!=RuntimePlatform.Android)){
			_SpeakUtterance(text,language);
		}
}
}