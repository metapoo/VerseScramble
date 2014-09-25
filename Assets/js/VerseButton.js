#pragma strict

public var button : Button;
public var verse : Verse;
public var label : Text;

function Start () {
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
}

function SetVerse(verse : Verse) {
	verse = verse;
	
	label.text = String.Format("{0} (high: {1})", verse.reference, 
	verse.GetMetadata()["high_score"]);
}

function AddToScrollView(scrollContent : RectTransform, index : int) {
	var rt : RectTransform = GetComponent(RectTransform);
	
	rt.SetParent(scrollContent, false);
	var labelTransform : RectTransform = label.GetComponent(RectTransform);
	labelTransform.offsetMin.x = 30;
	labelTransform.offsetMin.y = 10;
	labelTransform.offsetMax.x = -30;
	labelTransform.offsetMax.y = -10;
}

function  HandleOnClick() {
}

function Update () {

}