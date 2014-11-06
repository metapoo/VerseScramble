using UnityEngine;
using System;



public class SceneSetup:MonoBehaviour{
	
	public Font defaultFont;
	public static bool hiRes;
	public static bool isPhone;
	
	public bool GetIsPhone() {
		float w = (float)Screen.width;
		float h = (float)Screen.height;
		float dpi = Screen.dpi;
		if (dpi == 0) dpi = 128.0f;
		
		Debug.Log("Screen.dpi = " + dpi);
		float l = Mathf.Sqrt(w*w+h*h);
		float inches = l / dpi;
		Debug.Log("diagonal screen inches = " + inches);
		return inches < 6.0f;
	}
	
	public void Start() {
		isPhone = GetIsPhone();
	}
	
	
	public void Update() {
	
	}
}