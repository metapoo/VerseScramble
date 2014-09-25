#pragma strict
import UnityEngine.UI;

public var button : Button;
public var verseset : VerseSet;
public var label : Text;

function Start () {
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
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

function Metadata() : Hashtable {
	return verseset.GetMetadata(); 
}

function SetVerseSet(vs : VerseSet) {
	verseset = vs;
	label.text = String.Format("{0}", vs.setname);
}

function HandleOnClick() {
	VerseManager.verseIndex = 0;
	VerseManager.SetCurrentVerseSet(verseset);
}

function Update () {

}