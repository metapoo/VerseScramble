#pragma strict

import UnityEngine.UI;

public var gameManager : GameManager;
public var currentPercentage : float = 0;
public var targetPercentage : float = 0;
public var maxLength : float;

var rectTransform : RectTransform;
var image : Image;

function IsEmpty() {
	return targetPercentage == 0;
}

function IsRed() {
	return targetPercentage < 0.33f;
}

function IsYellow() {
	return targetPercentage < 0.66f;
}

function IsGreen() {
	return targetPercentage >= 0.66f;
}

function SetColor(color : Color) {
	image.color = color;
}

function GetHeight() {
	return rectTransform.sizeDelta[1];
}

function SetProgress(p : float) {
	currentPercentage = p;
	if (p > 1.0f) {
		p = 1.0f;
	}
	var newSize : Vector2 = new Vector2(maxLength*p, GetHeight());
	rectTransform.sizeDelta = newSize;
	
	if (IsRed()) {
		
		SetColor(Color.red);
	} else if (IsYellow()) {
		SetColor(Color.yellow);
	} else {
		SetColor(Color.green);
	}
}

function SetPercentage(p : float) {
	Debug.Log("set healthbar pct = " + p);
	targetPercentage = p;
	var endPercentage = targetPercentage;
	var startPercentage = currentPercentage;
	var duration = 0.5f;
	var rate = 1.0/duration;
	var t = 0.0f;
	while (t < 1.0) {
		if (endPercentage != targetPercentage) {
			// pct changed during animation, cancel it
			return;
		}
		t += Time.deltaTime * rate;
		SetProgress(startPercentage + (endPercentage-startPercentage)*t);
		yield;
	}
}

function Start () {
	rectTransform = GetComponent(RectTransform);
	image = GetComponent(Image);
	maxLength = rectTransform.sizeDelta[0];
}

function Update () {
}