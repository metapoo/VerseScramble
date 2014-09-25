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
	var firstButton : VerseSetButton = null;
	var vsButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vsButtonTransform : RectTransform = verseSetButton.GetComponent(RectTransform);
	var rowHeight = vsButtonTransform.sizeDelta.y;

	for (var i=0;i<versesets.length;i++) {
		var verseset : VerseSet = versesets[i];
		clone = Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
		clone.SetVerseSet(verseset);
		clone.AddToScrollView(verseSetScrollContent, i);
		
		if (i == 0) firstButton = clone;
		
		var rt = clone.GetComponent(RectTransform);
		
		rt.anchoredPosition.x = 0;
		rt.anchoredPosition.y = -i*(rowHeight + rowPadding) - rowPadding;	
	}
	
	verseSetScrollContent.sizeDelta.y = versesets.length*(rowHeight+rowPadding);
	
	if (firstButton != null) {
		firstButton.HandleOnClick();
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
	
	for ( i=0;i<verses.length;i++) {
		var verse: Verse = verses[i];
		clone = Instantiate(verseButton, Vector3.zero, Quaternion.identity);
		clone.SetVerse(verse);
		clone.AddToScrollView(verseScrollContent, i);
		
		var rt = clone.GetComponent(RectTransform);
		
		
		rt.anchoredPosition.x = 0;
		rt.anchoredPosition.y = -i*(rowHeight + rowPadding) - rowPadding;	
	}
	
	verseScrollContent.sizeDelta.y = verses.length*(rowHeight+rowPadding);
	
	yield WaitForSeconds(0);
	verseScrollContent.anchoredPosition.y = 0;
	
}

function Start () {
	verseManager.LoadVerses();
	ShowVerseSets();
}

function Update () {

}