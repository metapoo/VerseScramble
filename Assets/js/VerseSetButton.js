#pragma strict
import UnityEngine.UI;

public var button : Button;
public var verseset : VerseSet;
public var label : Text;

function Start () {
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
}

function Metadata() : Hashtable {
	return verseset.GetMetadata(); 
}

function SetVerseSet(vs : VerseSet) {
	verseset = vs;
	label.text = String.Format("{0} (high: {1})", vs.setname, Metadata()["high_score"]);
}

function HandleOnClick() {
	VerseManager.verseIndex = 0;
	VerseManager.SetCurrentVerseSet(verseset);
}

function Update () {

}