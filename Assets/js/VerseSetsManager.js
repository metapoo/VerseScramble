#pragma strict
import UnityEngine.UI;

public var scrollContent : RectTransform;
public var verseManager : VerseManager;
public var verseSetButton : VerseSetButton;

function Start () {
	verseManager.LoadVerses();
	var versesets = verseManager.versesets;
	var clone : VerseSetButton;
	var vsButtonLabel : RectTransform = verseSetButton.label.GetComponent(RectTransform);
	var vsButtonTransform : RectTransform = verseSetButton.GetComponent(RectTransform);
	var position = 0;
	var padding = 10;
	var rowHeight = vsButtonTransform.rect.height;
	
	for (var i=0;i<versesets.length;i++) {
		var verseset : VerseSet = versesets[i];
		clone = Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
		clone.SetVerseSet(verseset);
		var rt : RectTransform = clone.GetComponent(RectTransform);
		rt.SetParent(scrollContent, false);
		rt.localPosition.y = -i*(rowHeight + padding);	
		var cloneLabel : RectTransform = clone.label.GetComponent(RectTransform);
		cloneLabel.offsetMin.y = 0;
		cloneLabel.offsetMax.y = 0;
		
	}
}

function Update () {

}