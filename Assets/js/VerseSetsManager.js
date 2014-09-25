#pragma strict
import UnityEngine.UI;

public var scrollContent : RectTransform;
public var scrollBar : RectTransform;
public var verseManager : VerseManager;
public var verseSetButton : VerseSetButton;

function ShowVerseSets() {
	var versesets = verseManager.versesets;
	var clone : VerseSetButton;
	var vsButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vsButtonTransform : RectTransform = verseSetButton.GetComponent(RectTransform);
	
	var padding = 15;
	var rowHeight = vsButtonTransform.sizeDelta.y;
	

	for (var i=0;i<versesets.length;i++) {
		var verseset : VerseSet = versesets[i];
		clone = Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
		clone.SetVerseSet(verseset);
		clone.AddToScrollView(scrollContent, i);
		var rt = clone.GetComponent(RectTransform);
		
		rt.anchoredPosition.x = padding;
		rt.anchoredPosition.y = -i*(rowHeight + padding) - padding;	
	}
	
	scrollContent.sizeDelta.y = versesets.length*(rowHeight+padding);
	
	var scrollView = scrollContent.parent.GetComponent(RectTransform);
	Debug.Log(scrollView.sizeDelta);
	
}

function Start () {
	verseManager.LoadVerses();
	
	ShowVerseSets();
}

function Update () {

}