#pragma strict

var okayButton : Button;
var title : String;
var description : String;
var titleText : Text;
var descriptionText : Text;
var OnClose = function() {};

function HandleOkayButtonClick() {
	OnClose();
	Destroy(this.gameObject);
}

function SetParent(prt : RectTransform) {
	var rt : RectTransform = GetComponent(RectTransform);
	var oldPosition = rt.anchoredPosition;
	var oldScale = rt.localScale;
	
	rt.SetParent(prt);
	
	rt.anchoredPosition = oldPosition;
	rt.localScale = oldScale;	
}

function SetTitle(_title : String) {
	titleText.text = _title;
	title = _title;
}

function SetDescription(_description : String) {
	descriptionText.text = _description;
	description = _description;
}

function SetHeight(height : float) {
	var rt : RectTransform = GetComponent(RectTransform);
	rt.sizeDelta.y = height;
}

function CenterOnScreen() {
	var rt : RectTransform = GetComponent(RectTransform);
	rt.anchorMax.y = 0.5f;
	rt.anchorMin.y = 0.5f;
}

function Start () {
	okayButton.onClick.AddListener(HandleOkayButtonClick);
	CenterOnScreen();
}

function Update () {

}