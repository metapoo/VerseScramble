namespace CSDEP
{
using UnityEngine;
using System;
using UnityEngine.UI;


public class LocalizeText:MonoBehaviour{
	
	public string originalText;
	public Text text;
	
	public void Awake() {
		text = GetComponent<Text>() as Text;
		originalText = text.text;
	}
	
	public void Start() {
		text.text = TextManager.GetText(originalText);
		Debug.Log(originalText + " -> " + text.text);
	}
	
	public void Update() {
	
	}
}
}
