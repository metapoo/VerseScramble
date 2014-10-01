#pragma strict

import UnityEngine.UI;

var originalText : Text;
var thisText : Text;

function Awake () {
	var rt : RectTransform = GetComponent(RectTransform);
	originalText = rt.parent.GetComponent(Text);
	thisText = GetComponent(Text);
}

function Start () {
}

function Update () {
	if (originalText.enabled != thisText.enabled) {
		thisText.enabled = originalText.enabled;
	}
	
	if (originalText.text != thisText.text) {
		thisText.text = originalText.text;
	}
	
	if (originalText.color.a != thisText.color.a) {
		thisText.color.a = originalText.color.a;
	}
}
