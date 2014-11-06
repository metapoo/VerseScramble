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
	var children : Component[] = verseSetScrollContent.GetComponentsInChildren(VerseSetButton);
	for (var i=0;i<children.Length;i++) {
		var vsButton : VerseSetButton = children[i];
		Destroy(vsButton.gameObject);
	}
	verseSetScrollContent.DetachChildren();
	
	var versesets : List.<VerseSet> = VerseManager.GetCurrentVerseSets();
	var clone : VerseSetButton;
	var currentButton : VerseSetButton = null;
	var vsButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vsButtonTransform : RectTransform = verseSetButton.GetComponent(RectTransform);
	var rowHeight = vsButtonTransform.sizeDelta.y;
	var currentVerseSet : VerseSet = VerseManager.GetCurrentVerseSet();
	var currentView = VerseManager.GetCurrentView(false);
	var numRows = versesets.Count;
	var startIndex : int = 0;
	var rt : RectTransform;
	
	i = 0;
	if (currentView == "mysets") {
		numRows += 1;
		startIndex = 1;
		clone = Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
		clone.AddToScrollView(verseSetScrollContent, i);
		clone.createVerseSet = true;
		clone.label.text = TextManager.GetText("Create Verse Set");
		rt = clone.GetComponent(RectTransform);		
		rt.anchoredPosition.x = 0;
		rt.anchoredPosition.y = -(i)*(rowHeight + rowPadding) - rowPadding;	
	}
	
	for (i=startIndex;i<versesets.Count+startIndex;i++) {
		var verseset : VerseSet = versesets[i-startIndex];
		clone = Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
		clone.SetVerseSet(verseset);
		clone.AddToScrollView(verseSetScrollContent, i);
		
		if (Object.ReferenceEquals(verseset, currentVerseSet)) currentButton = clone;
		
		rt = clone.GetComponent(RectTransform);
		
		rt.anchoredPosition.x = 0;
		rt.anchoredPosition.y = -(i)*(rowHeight + rowPadding) - rowPadding;	
	}

	verseSetScrollContent.sizeDelta.y = numRows*(rowHeight+rowPadding);
	
	if (currentButton != null) {
		currentButton.HandleOnClick();
		yield WaitForSeconds(0.01f);
		
		// maintain scroll position from previous when loading menu again from beginning
		var y : float = PlayerPrefs.GetInt("verse_scroll_content_anchored_y",0);
		verseScrollContent.anchoredPosition.y = y;
	}	
}

function AddVerseButton(verse : Verse, index: int) {
	var vButtonTransform : RectTransform = verseButton.GetComponent(RectTransform);
	var rowHeight = vButtonTransform.sizeDelta.y;
	var clone : VerseButton = Instantiate(verseButton, Vector3.zero, Quaternion.identity) as VerseButton;
	clone.SetVerse(verse);
	clone.verseIndex = index-1;
	clone.AddToScrollView(verseScrollContent, index);
		
	var rt : RectTransform = clone.GetComponent(RectTransform);
	rt.anchoredPosition.x = 0;
	rt.anchoredPosition.y = -index*(rowHeight + rowPadding) - rowPadding;	
};
	
function ShowVerses() {
	var verses : List.<Verse> = VerseManager.GetCurrentVerses();
	
	var verseButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vButtonTransform : RectTransform = verseButton.GetComponent(RectTransform);
	var rowHeight = vButtonTransform.sizeDelta.y;
	var children : Component[] = verseScrollContent.GetComponentsInChildren(VerseButton);
	for (var i=0;i<children.Length;i++) {
		var vButton : VerseButton = children[i];
		Destroy(vButton.gameObject);
	}
	verseScrollContent.DetachChildren();
	
	if (verses.Count > 0) {
		AddVerseButton(null,0);
	}

	for ( i=0;i<verses.Count;i++) {
		var verse : Verse = verses[i];
		AddVerseButton(verse,i+1);
	}
		
	verseScrollContent.sizeDelta.y = (verses.Count+1)*(rowHeight+rowPadding);
	
	yield WaitForSeconds(0);
	verseScrollContent.anchoredPosition.y = 0;
	
	var currentVerseSet : VerseSet = VerseManager.GetCurrentVerseSet();
	if (!Object.ReferenceEquals(currentVerseSet, null)) {
		var label : String = currentVerseSet.setname;
		if (currentVerseSet.version != null) {
			label += String.Format(" ({0})", currentVerseSet.version);
		}
		verseHeaderLabel.text = label;
	} else {
		verseHeaderLabel.text = TextManager.GetText("Verses");
	}
}

function OnGlobeClick() {
	var verseset : VerseSet = VerseManager.currentVerseSet;
	var apiDomain : String = ApiManager.GetApiDomain();
	if (Object.ReferenceEquals(verseset, null)) {
		return;
	}
	if (verseset.onlineId == null) {
		Application.OpenURL(ApiManager.GetUrl("/"));
	}
	var url : String = ApiManager.GetUrl(String.Format("/verseset/show/{0}",verseset.onlineId));
	Application.OpenURL(url);
}

function GoBack () {
	TitleManager.stayInTitleScreen = true;
	Application.LoadLevel("title");
}

function Awake () {
	var language : String = VerseManager.GetLanguage();
	if (!TextManager.IsLoaded()) {
		TextManager.LoadLanguageOffline(language);
		TextManager.GetInstance().LoadLanguage(language, null);
	}
}

function Start () {
	verseManager.LoadVerses();
	var navButtons : NavigationButton[] = GameObject.FindObjectsOfType(NavigationButton);
	Debug.Log("current view = " +VerseManager.GetCurrentView(false));
	var currentViewNoLanguage = VerseManager.GetCurrentView(false);
	for (var i=0;i<navButtons.Length;i++) {
		var navButton : NavigationButton = navButtons[i];
		if (navButton.view == currentViewNoLanguage) {
			navButton.HandleOnClick();
		}
	}
}

function Update () {
	
}