using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class VoiceSynth{
/*Interfacetonativeimplementation*/

[DllImport("__Internal")]
private static extern void _SpeakUtterance(string text,string language);

//Startslookupforsomebonjourregisteredserviceinsidespecifieddomain
public static void SpeakUtterance(string text,string language)
{
		//Callpluginonlywhenrunningonrealdevice
		if((Application.platform!=RuntimePlatform.OSXEditor)&&
(Application.platform!=RuntimePlatform.OSXWebPlayer)&&
(Application.platform!=RuntimePlatform.WindowsWebPlayer)){
		_SpeakUtterance(text,language);
}
}
}