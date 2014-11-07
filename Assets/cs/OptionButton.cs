using UnityEngine;
using System;
using UnityEngine.UI;


public class OptionButton:MonoBehaviour{
	
	public Text labelText;
	
	public void SetLabel(string label) {
		labelText.text = label;
	}
	
	public void SetParent(RectTransform prt) {
		RectTransform rt = GetComponent<RectTransform>();
		Vector2 oldPosition = rt.anchoredPosition;
		Vector3 oldScale = rt.localScale;
		
		rt.SetParent(prt);
		
		rt.anchoredPosition = oldPosition;
		rt.localScale = oldScale;	
	}
	
	public void Start() {
	}
	
	public void Update() {
	}

}