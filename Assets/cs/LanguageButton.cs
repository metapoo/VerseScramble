using UnityEngine;
using System;
using UnityEngine.UI;
using UnityEngine.SceneManagement;


public class LanguageButton:MonoBehaviour{
	
	public Text labelText;
	public string languageDescription;
	public string languageCode;
	
	public void HandleOnClick() {
		Action<string> onFinish = delegate( string language) {
			VerseSceneManager.loadVersesets ();
		};
		VerseManager.GetInstance().SwitchLanguage(languageCode, onFinish);
	}
	
	public void SetCodeAndLanguage(string code,string language) {
		languageCode = code;
		languageDescription = language;
		SetLabel(languageDescription);
	}
	
	public void SetLabel(string label) {
		labelText.text = label;
	}
	
	public void SetParent(RectTransform prt) {
		RectTransform rt = GetComponent<RectTransform>();
		Vector2 oldAPosition = rt.anchoredPosition;
		
		Vector3 oldScale = rt.localScale;
		//Vector2 oldMin = rt.offsetMin;
		//Vector2 oldMax = rt.offsetMax;
		
	//	Debug.Log("offset min = " + oldMin);
	//	Debug.Log("offset max = " + oldMax);
		
		rt.SetParent(prt);
		
		rt.anchoredPosition = oldAPosition;
		rt.localScale = oldScale;	
		
	//	rt.offsetMin = oldMin;
	//rt.offsetMax = oldMax;
	
		var tmp_cs1 = rt.offsetMin;
        tmp_cs1.x = 0.0f;
        rt.offsetMin = tmp_cs1;
		var tmp_cs2 = rt.offsetMax;
        tmp_cs2.x = -60.0f;
        rt.offsetMax = tmp_cs2;
		
	}
	
	public void Awake() {
		SetLabel(languageDescription);
	}
	
	public void Start() {
	}
	
	public void Update() {
	}

}
