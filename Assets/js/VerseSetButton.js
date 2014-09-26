#pragma strict
import UnityEngine.UI;

public var button : Button;
public var verseset : VerseSet;
public var label : Text;
public var normalColor : Color;
static var selectedButton : VerseSetButton = null;

function Awake() {
	normalColor = button.colors.normalColor;
}

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

function Highlight() {
	var rt : RectTransform = GetComponent(RectTransform);	
	Debug.Log("selected button = " + selectedButton);
	if (selectedButton != null) {
		selectedButton.UnHighlight();
	}
	
	button.colors.normalColor = button.colors.highlightedColor;
	selectedButton = this;
	
}

function UnHighlight() {
	button.colors.normalColor = normalColor;
	
}

function HandleOnClick() {
	VerseManager.verseIndex = 0;
	VerseManager.SetCurrentVerseSet(verseset);
	Highlight();
	
	var manager : VerseSetsManager = GameObject.Find("VerseSetsManager").GetComponent(VerseSetsManager);
	manager.ShowVerses();
}

function Update () {

}