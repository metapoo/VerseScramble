using UnityEngine;
using System;
using UnityEngine.UI;
using UnityEngine.Events;
using UnityEngine.SceneManagement;


public class VerseButton:MonoBehaviour{
	
	public Button button;
	public Verse verse;
	public Text label;
	public int verseIndex;
	public VerseManager verseManager;
	public RectTransform parentScrollContent;

	public void Awake() {
		button = GetComponent<Button>();
		button.onClick.AddListener(() => {HandleOnClick(); });
		verseManager = (VerseManager)GameObject.FindObjectOfType(typeof(VerseManager));
	}
	
	public Color GetColorForDifficulty(int difficultyInt) {
		switch(difficultyInt) {
			case 1:
				return new Color(0.5f,1.0f,0.5f,1.0f);
			case 2:
				return new Color(1.0f,1.0f,0.5f);
			case 3:
				return new Color(1.0f,0.5f,0.5f);
			default:
				return Color.white;	
		}
	}
	
	public void SetVerse(Verse v) {
		verse = v;
		
		int highScore = 0;
		
		if (v == null) {
			VerseSet verseset = VerseManager.GetCurrentVerseSet();
			if (verseset == null) return;
			highScore = (int)verseset.GetMetadata()["high_score"];
			label.text = String.Format("{0} - {1}: {2}",
				TextManager.GetText("Play Challenge"),
				TextManager.GetText("High"),
				highScore); //this is what will be written in the rows
			int versesetDifficulty = (int)verseset.GetMetadata()["difficulty"];
			var tmp_cs1 = button.colors;
            tmp_cs1.normalColor = GetColorForDifficulty(versesetDifficulty);
            button.colors = tmp_cs1;
			
		} else {
			highScore = (int)verse.GetMetadata()["high_score"];
		
	//		label.text = String.Format("{0} (high: {1})", verse.reference, 
	//		highScore);
			label.text = verse.reference;
			int verseDifficulty = (int)v.GetMetadata()["difficulty"];
			var tmp_cs2 = button.colors;
            tmp_cs2.normalColor = GetColorForDifficulty(verseDifficulty);
            button.colors = tmp_cs2;
		}
	}
	
	public void AddToScrollView(RectTransform scrollContent,int index) {
		RectTransform rt = GetComponent<RectTransform>();
		
		rt.SetParent(scrollContent, false);
		RectTransform labelTransform = label.GetComponent<RectTransform>();
		var tmp_cs3 = labelTransform.offsetMin;
        tmp_cs3.x = 0.0f;
        tmp_cs3.y = 0.0f;
        labelTransform.offsetMin = tmp_cs3;
		var tmp_cs4 = labelTransform.offsetMax;
        tmp_cs4.x = 0.0f;
        tmp_cs4.y = 0.0f;
        labelTransform.offsetMax = tmp_cs4;
		
		parentScrollContent = scrollContent;
	}
	
	public void HandleOnClick() {
		LoginPanel loginPanel = (LoginPanel)GameObject.FindObjectOfType(typeof(LoginPanel));
		if (loginPanel != null) {
			return;
		}
		GameManager.needToRecordPlay = true;
		
		Action playVerse = delegate() {
			if (verse == null) {
				StartChallenge();
				return;
			}
		
			VerseManager.verseIndex = verseIndex;
			verseManager.Save();
			GameManager.SetChallengeModeEnabled(false);
			PlayerPrefs.SetInt("verse_scroll_content_anchored_y",
							(int)parentScrollContent.anchoredPosition.y);
		
			VerseSceneManager.loadScramble ();
		};
	
		playVerse();
	}
	
	
	public void StartChallenge() {
		GameManager.StartChallenge();
	}
	
	public void Update() {
	
	}
}
