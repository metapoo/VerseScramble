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

function  HandleOnClick() {
}

function Update () {

}