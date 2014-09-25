#pragma strict
import UnityEngine.UI;

public var button : Button;
public var verseset : VerseSet;
public var label : Text;

function Start () {
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
}

function SetVerseSet(vs : VerseSet) {
	verseset = vs;
	label.text = vs.setname;
}

function HandleOnClick() {
}

function Update () {

}