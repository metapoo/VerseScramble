using UnityEngine;
using System;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.SceneManagement;


public class VerseSetsManager:MonoBehaviour{
	
	public RectTransform verseSetScrollContent;
	public RectTransform verseScrollContent;
	public VerseManager verseManager;
	public VerseSetButton verseSetButton;
	public VerseButton verseButton;
	public float rowPadding = 15.0f;
	public Text verseHeaderLabel;
	
	public IEnumerator ShowVerseSets() {
		Component[] children = verseSetScrollContent.GetComponentsInChildren<VerseSetButton>();
		int i = 0;
        for(i=0;i<children.Length;i++) {
			VerseSetButton vsButton = (VerseSetButton)children[i];
			Destroy(vsButton.gameObject);
		}
		verseSetScrollContent.DetachChildren();
		
		List<VerseSet> versesets = VerseManager.GetCurrentVerseSets();
		VerseSetButton clone = null;
		VerseSetButton currentButton = null;
		RectTransform vsButtonTransform = verseSetButton.GetComponent<RectTransform>();
		float rowHeight = vsButtonTransform.sizeDelta.y;
		VerseSet currentVerseSet = VerseManager.GetCurrentVerseSet();
		string currentView = VerseManager.GetCurrentView(false);
		int numRows = versesets.Count;
		int startIndex = 0;
		RectTransform rt = null;
		
		i = 0;
		if (currentView == "mysets") {
			numRows += 1;
			startIndex = 1;
			clone = (VerseSetButton)Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
			clone.AddToScrollView(verseSetScrollContent, i);
			clone.createVerseSet = true;
			clone.label.text = TextManager.GetText("Create Verse Set");
			rt = clone.GetComponent<RectTransform>();		
			Vector3 tmp_cs1 = rt.anchoredPosition;
            tmp_cs1.x = 0.0f;
            tmp_cs1.y = (-1*i)*(rowHeight + rowPadding) - rowPadding;
            rt.anchoredPosition = tmp_cs1;	
		}
		
		for(i=startIndex;i<versesets.Count+startIndex;i++) {
			VerseSet verseset = versesets[i-startIndex];
			clone = (VerseSetButton)Instantiate(verseSetButton, Vector3.zero, Quaternion.identity);
			clone.SetVerseSet(verseset);
			clone.AddToScrollView(verseSetScrollContent, i);

			if (verseset == currentVerseSet) currentButton = clone;
			
			rt = clone.GetComponent<RectTransform>();
			
			Vector3 tmp_cs2 = rt.anchoredPosition;
            tmp_cs2.x = 0.0f;
            tmp_cs2.y = (-1*i)*(rowHeight + rowPadding) - rowPadding;
            rt.anchoredPosition = tmp_cs2;	
		}
	
		Vector3 tmp_cs3 = verseSetScrollContent.sizeDelta;
        tmp_cs3.y = numRows*(rowHeight+rowPadding);
        verseSetScrollContent.sizeDelta = tmp_cs3;
		
		if (currentButton != null) {
			currentButton.HandleOnClick();
			yield return new WaitForSeconds(0.01f);
			
			// maintain scroll position from previous when loading menu again from beginning
			float y = (float)PlayerPrefs.GetInt("verse_scroll_content_anchored_y",0);
			Vector3 tmp_cs4 = verseScrollContent.anchoredPosition;
            tmp_cs4.y = y;
            verseScrollContent.anchoredPosition = tmp_cs4;
		}	
	}
	
	public void AddVerseButton(Verse verse,int index) {
		RectTransform vButtonTransform = verseButton.GetComponent<RectTransform>();
		float rowHeight = vButtonTransform.sizeDelta.y;
		VerseButton clone = (VerseButton)Instantiate(verseButton, Vector3.zero, Quaternion.identity);
		clone.SetVerse(verse);
		clone.verseIndex = index-1;
		clone.AddToScrollView(verseScrollContent, index);
			
		RectTransform rt = clone.GetComponent<RectTransform>();
		Vector3 tmp_cs5 = rt.anchoredPosition;
        tmp_cs5.x = 0.0f;
        tmp_cs5.y = -index*(rowHeight + rowPadding) - rowPadding;
        rt.anchoredPosition = tmp_cs5;	
	}
		
	public IEnumerator ShowVerses() {
		List<Verse> verses = VerseManager.GetCurrentVerses();
		
		RectTransform vButtonTransform = verseButton.GetComponent<RectTransform>();
		float rowHeight = vButtonTransform.sizeDelta.y;
		Component[] children = verseScrollContent.GetComponentsInChildren<VerseButton>();
		for(int i=0;i<children.Length;i++) {
			VerseButton vButton = (VerseButton)children[i];
			Destroy(vButton.gameObject);
		}
		verseScrollContent.DetachChildren();
		
		if (verses.Count > 0) {
			AddVerseButton(null,0);
		}
	
		for(int i=0;i<verses.Count;i++) {
			Verse verse = verses[i];
			AddVerseButton(verse,i+1);
		}
			
		Vector3 tmp_cs6 = verseScrollContent.sizeDelta;
        tmp_cs6.y = (verses.Count+1)*(rowHeight+rowPadding);
        verseScrollContent.sizeDelta = tmp_cs6;
		
		yield return new WaitForSeconds(0.0f);
		Vector3 tmp_cs7 = verseScrollContent.anchoredPosition;
        tmp_cs7.y = 0.0f;
        verseScrollContent.anchoredPosition = tmp_cs7;
		
		VerseSet currentVerseSet = VerseManager.GetCurrentVerseSet();
		if (currentVerseSet != null) {
			string label = currentVerseSet.setname;
			if (currentVerseSet.version != null) {
				label = String.Format("{0} ({1})", label, currentVerseSet.version);
			}
			verseHeaderLabel.text = label;
		} else {
			verseHeaderLabel.text = TextManager.GetText("Verses");
		}
	}
	
	public void OnGlobeClick() {
		VerseSet verseset = VerseManager.currentVerseSet;
		if (verseset == null) {
			return;
		}
		if (verseset.onlineId == null) {
			Application.OpenURL(ApiManager.GetUrl("/"));
		}
		string url = ApiManager.GetUrl(String.Format("/verseset/show/{0}",verseset.onlineId));
		Application.OpenURL(url);
	}
	
	public void GoBack() {
		TitleManager.stayInTitleScreen = true;
		VerseSceneManager.loadTitle ();
	}
	
	public void Awake() {
		string language = VerseManager.GetLanguage();
		if (!TextManager.IsLoaded()) {
			TextManager.LoadLanguageOffline(language);
			StartCoroutine(TextManager.GetInstance().LoadLanguage(language, null));
		}
	}
	
	public void Start() {
		verseManager.LoadVerses();
		NavigationButton[] navButtons = (NavigationButton[])GameObject.FindObjectsOfType(typeof(NavigationButton));
		Debug.Log("current view = " +VerseManager.GetCurrentView(false));
		string currentViewNoLanguage = VerseManager.GetCurrentView(false);
		for(int i=0;i<navButtons.Length;i++) {
			NavigationButton navButton = navButtons[i];
			if (navButton.view == currentViewNoLanguage) {
				navButton.HandleOnClick();
			}
		}
	}
	
	public void Update() {
		
	}
}