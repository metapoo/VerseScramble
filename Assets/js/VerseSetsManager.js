#pragma strict
import UnityEngine.UI;

public var verseSetScrollContent : RectTransform;
public var verseScrollContent : RectTransform;
public var verseManager : VerseManager;
public var verseSetButton : VerseSetButton;
public var verseButton : VerseButton;
public var rowPadding : float = 15;
public var verseHeaderLabel : Text;


function ShowVerseSets() {
	var children : Array = verseSetScrollContent.GetComponentsInChildren(VerseSetButton);
	for (var i=0;i<children.length;i++) {
		var vsButton : VerseSetButton = children[i];
		Destroy(vsButton.gameObject);
	}
	verseSetScrollContent.DetachChildren();
	
	var versesets : Array = verseManager.GetCurrentVerseSets();
	var clone : VerseSetButton;
	var currentButton : VerseSetButton = null;
	var vsButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vsButtonTransform : RectTransform = verseSetButton.GetComponent(RectTransform);
	var rowHeight = vsButtonTransform.sizeDelta.y;
	var currentVerseSet : VerseSet = verseManager.GetCurrentVerseSet();

	for (i=0;i<versesets.length;i++) {
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
	
	if (verses.length > 0) {
		addVerseButton(null,i);
	}
	
	verseScrollContent.sizeDelta.y = (verses.length+1)*(rowHeight+rowPadding);
	
	yield WaitForSeconds(0);
	verseScrollContent.anchoredPosition.y = 0;
	
	var currentVerseSet : VerseSet = verseManager.GetCurrentVerseSet();
	if (!Object.ReferenceEquals(currentVerseSet, null)) {
		verseHeaderLabel.text = currentVerseSet.setname;
	} else {
		verseHeaderLabel.text = TextManager.GetText("Verses");
	}
}

function GoBack () {
	Application.LoadLevel("title");
}

function Awake () {
	TextManager.LoadLanguage(VerseManager.GetLanguage());
}

function Start () {
	verseManager.LoadVerses();
	var navButtons : Array = GameObject.FindObjectsOfType(NavigationButton);
	Debug.Log("current view = " +verseManager.GetCurrentView(false));
	var currentViewNoLanguage = VerseManager.GetCurrentView(false);
	for (var i=0;i<navButtons.length;i++) {
		var navButton : NavigationButton = navButtons[i];
		if (navButton.view == currentViewNoLanguage) {
			navButton.HandleOnClick();
		}
	}
}

function Update () {

}