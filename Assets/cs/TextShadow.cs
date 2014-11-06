using UnityEngine;
using System;
using UnityEngine.UI;


public class TextShadow:MonoBehaviour{
	
	public Text originalText;
	public Text thisText;
	
	public void Awake() {
		RectTransform rt = GetComponent<RectTransform>();
		originalText = rt.parent.GetComponent<Text>() as Text;
		thisText = GetComponent<Text>() as Text;
	}
	
	public void Start() {
	}
	
	public void Update() {
		if (originalText.enabled != thisText.enabled) {
			thisText.enabled = originalText.enabled;
		}
		
		if (originalText.text != thisText.text) {
			thisText.text = originalText.text;
		}
		
		if (originalText.color.a != thisText.color.a) {
			var tmp_cs1 = thisText.color;
            tmp_cs1.a = originalText.color.a;
            thisText.color = tmp_cs1;
		}
	}

}