#pragma strict

public var button : Button;
public var verse : Verse;
public var label : Text;

function Start () {
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
}

function  HandleOnClick() {
}

function Update () {

}