#pragma strict

public var button : Button;
public var verse : Verse;
public var label : Text;
public var verseIndex : int;
public var verseManager : VerseManager;
public var parentScrollContent : RectTransform;

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
	labelTransform.offsetMin.x = 0;
	labelTransform.offsetMin.y = 0;
	labelTransform.offsetMax.x = 0;
	labelTransform.offsetMax.y = 0;
	
	parentScrollContent = scrollContent;
}

function  HandleOnClick() {
	verseManager = GameObject.FindObjectOfType(VerseManager);
	verseManager.verseIndex = verseIndex;
	verseManager.Save();
	GameManager.SetChallengeModeEnabled(false);
	PlayerPrefs.SetInt("verse_scroll_content_anchored_y",
						parentScrollContent.anchoredPosition.y);
	Application.LoadLevel("scramble");
}

function Update () {

}