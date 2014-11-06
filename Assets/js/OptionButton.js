#pragma strict

public var labelText : UnityEngine.UI.Text;

function SetLabel(label : String) {
	labelText.text = label;
}

function SetParent(prt : RectTransform) {
	var rt : RectTransform = GetComponent(RectTransform);
	var oldPosition = rt.anchoredPosition;
	var oldScale = rt.localScale;
	
	rt.SetParent(prt);
	
	rt.anchoredPosition = oldPosition;
	rt.localScale = oldScale;	
}

function Start() {
}

function Update() {
}
