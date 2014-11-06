#pragma strict

import UnityEngine.UI;

public var gameManager : GameManager;
public var currentPercentage : float = 0;
public var targetPercentage : float = 0;
public var maxLength : float;
public var healthLabel : Text;

public var rectTransform : RectTransform;
public var image : Image;

function IsEmpty() : boolean {
	return targetPercentage == 0;
}

function IsRed()  : boolean {
	return targetPercentage < 0.50f;
}

function IsYellow()  : boolean {
	return targetPercentage < 1.00f;
}

function IsGreen() : boolean  {
	return targetPercentage >= 1.00f;
}

function SetColor(color : Color) {
	image.color = color;
}

function GetHeight() : float {
	return rectTransform.sizeDelta[1];
}

function SetProgress(p : float) {
	currentPercentage = p;
	healthLabel.text = String.Format("{0}x", Mathf.RoundToInt(p*100.0));
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

function SetPercentage(p : float) : IEnumerator {
	//Debug.Log("set healthbar pct = " + p);
	targetPercentage = p;
	var endPercentage = targetPercentage;
	var startPercentage = currentPercentage;
	
	// make sure percentage is not below 0.05f for graphic purposes
	if (startPercentage < 0.05f) {
		startPercentage = 0.05f;
	}
	
	if (endPercentage == 0) {
		if (startPercentage <= 0.05f) {
			startPercentage = 0.0f;
		}
	}
	var duration = 1.0f;
	var rate = 1.0/duration;
	var t = 0.0f;
	while (t < 1.0) {
		if (endPercentage != targetPercentage) {
			// pct changed during animation, cancel it
			break;
		}
		t += Time.deltaTime * rate;
		SetProgress(startPercentage + (endPercentage-startPercentage)*t);
		yield;
	}
	SetProgress(endPercentage);
}

function Start () {
	maxLength = rectTransform.sizeDelta[0];
}

function Update () {
}