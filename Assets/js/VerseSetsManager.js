#pragma strict
import UnityEngine.UI;

public var verseSetScrollContent : RectTransform;
public var verseScrollContent : RectTransform;
public var verseManager : VerseManager;
public var verseSetButton : VerseSetButton;
public var verseButton : VerseButton;
public var rowPadding : float = 15;

function ShowVerseSets() {
	var versesets = verseManager.versesets;
	var clone : VerseSetButton;
	var currentButton : VerseSetButton = null;
	var vsButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vsButtonTransform : RectTransform = verseSetButton.GetComponent(RectTransform);
	var rowHeight = vsButtonTransform.sizeDelta.y;
	var currentVerseSet : VerseSet = verseManager.GetCurrentVerseSet();

	for (var i=0;i<versesets.length;i++) {
		var verseset : VerseSet = versesets[i];
		clone = Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
		clone.SetVerseSet(verseset);
		clone.AddToScrollView(verseSetScrollContent, i);
		
		if (Object.ReferenceEquals(verseset, currentVerseSet)) currentButton = clone;
		
		var rt = clone.GetComponent(RectTransform);
		
		rt.anchoredPosition.x = 0;
		rt.anchoredPosition.y = -i*(rowHeight + rowPadding) - rowPadding;	
	}
	
	verseSetScrollContent.sizeDelta.y = versesets.length*(rowHeight+rowPadding);
	
	if (currentButton != null) {
		currentButton.HandleOnClick();
		yield WaitForSeconds(0.01f);
		
		// maintain scroll position from previous when loading menu again from beginning
		var y : float = PlayerPrefs.GetInt("verse_scroll_content_anchored_y",0);
		verseScrollContent.anchoredPosition.y = y;

	}
}

function ShowVerses() {
	var verses = verseManager.GetCurrentVerses();
	var clone : VerseButton;
	var verseButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vButtonTransform : RectTransform = verseButton.GetComponent(RectTransform);
	var rowHeight = vButtonTransform.sizeDelta.y;
	var children : Array = verseScrollContent.GetComponentsInChildren(VerseButton);
	for (var i=0;i<children.length;i++) {
		var vButton : VerseButton = children[i];
		Destroy(vButton.gameObject);
	}
	verseScrollContent.DetachChildren();
	
	var addVerseButton = function(verse : Verse, index: int) {
		clone = Instantiate(verseButton, Vector3.zero, Quaternion.identity);
		clone.SetVerse(verse);
		clone.verseIndex = index;
		clone.AddToScrollView(verseScrollContent, index);
		
		var rt = clone.GetComponent(RectTransform);
		rt.anchoredPosition.x = 0;
		rt.anchoredPosition.y = -index*(rowHeight + rowPadding) - rowPadding;	
	};
	
	for ( i=0;i<verses.length;i++) {
		var verse : Verse = verses[i];
		addVerseButton(verse,i);
	}
	addVerseButton(null,i);
	verseScrollContent.sizeDelta.y = (verses.length+1)*(rowHeight+rowPadding);
	
	yield WaitForSeconds(0);
	verseScrollContent.anchoredPosition.y = 0;
	
}

function Awake () {
	TextManager.LoadLanguage(VerseManager.GetLanguage());
}

function Start () {
	verseManager.LoadVerses();
	ShowVerseSets();
}

function Update () {

}