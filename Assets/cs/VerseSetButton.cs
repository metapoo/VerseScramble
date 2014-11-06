using UnityEngine;
using System;
using UnityEngine.UI;
using UnityEngine.Events;
using System.Collections;
using System.Collections.Generic;


public class VerseSetButton:MonoBehaviour{
	
	private Button button;
	private VerseSet verseset;
	private VerseSetsManager verseSetsManager;

	public Text label;
	public Color normalColor;
	public bool createVerseSet = false;
	public static VerseSetButton selectedButton = null;
	
	public void Awake() {
		button = GetComponent<Button>();
		button.onClick.AddListener(() => {HandleOnClick();});
		normalColor = button.colors.normalColor;
		verseSetsManager = GameObject.Find("VerseSetsManager").GetComponent<VerseSetsManager>();			
	}
	
	public void Start() {
	}
	
	public void AddToScrollView(RectTransform scrollContent,int index) {
		RectTransform rt = GetComponent<RectTransform>();
		
		rt.SetParent(scrollContent, false);
		RectTransform labelTransform = label.GetComponent<RectTransform>();
		var tmp_cs1 = labelTransform.offsetMin;
        tmp_cs1.x = 30.0f;
        tmp_cs1.y = 10.0f;
        labelTransform.offsetMin = tmp_cs1;
		var tmp_cs2 = labelTransform.offsetMax;
        tmp_cs2.x = -30.0f;
        tmp_cs2.y = -10.0f;
        labelTransform.offsetMax = tmp_cs2;
	}
	
	public Hashtable Metadata() {
		return verseset.GetMetadata(); 
	}
	
	public void SetVerseSet(VerseSet vs) {
		verseset = vs;
		label.text = String.Format("{0} ({1})", vs.setname, vs.GetVerseCount());
	}
	
	public void Highlight() {
		//Debug.Log("selected button = " + selectedButton);
		if (selectedButton != null) {
			selectedButton.UnHighlight();
		}
		
		var tmp_cs3 = button.colors;
        tmp_cs3.normalColor = button.colors.highlightedColor;
        button.colors = tmp_cs3;
		selectedButton = this;
		
	}
	
	public void UnHighlight() {
		var tmp_cs4 = button.colors;
        tmp_cs4.normalColor = normalColor;
        button.colors = tmp_cs4;
		
	}
	
	public void HandleApiVerseSetShow(Hashtable resultData) {
		if (this == null) return;
		
		Hashtable versesetData = (Hashtable)resultData["verseset"];
		List<object> versesData = (List<object>)resultData["verses"];
		int highScore = 0;
		int difficulty = 0;
		bool mastered = false;
	
		if (resultData.ContainsKey("high_score")) {
			highScore = (int)resultData["high_score"];
		}
		if (resultData.ContainsKey("difficulty")) {
			difficulty = (int)resultData["difficulty"];
		}
		if (resultData.ContainsKey("mastered")) {
			mastered = resultData["mastered"] != null;
		}
		
		Hashtable metadata = verseset.GetMetadata();
		int currentHighScore = (int)metadata["high_score"];
		int currentDifficulty = (int)metadata["difficulty"];
		
		if (mastered) difficulty += 1;
		
		bool changed = false;
		
		if (highScore >= currentHighScore) {
			metadata["high_score"] = highScore;
			changed = true;
		}
		
		if (difficulty > currentDifficulty) {
			metadata["difficulty"] = difficulty;
			changed = true;
		}
		
		if (changed) {
			verseset.SaveMetadata(metadata);
		}
		
		VerseManager.LoadVerseSetData(versesetData);
		verseset.LoadVersesData(versesData);
		StartCoroutine(verseSetsManager.ShowVerses());
		
	}
	
	public void HandleError() {
		ApiManager apiManager = ApiManager.GetInstance();
		Hashtable arguments = new Hashtable();
		arguments.Add("verseset_id",verseset.onlineId);
		Hashtable options = new Hashtable();
		options.Add("handler",HandleApiVerseSetShow as Action<Hashtable>);
		apiManager.GetApiCache("verseset/show",
		arguments,
		options);
	}
	
	public void HandleOnClick() {
		if (createVerseSet) {
			string url = ApiManager.GetUrl("/verseset/create");
			Application.OpenURL(url);
			return;
		}
		
		VerseManager.verseIndex = 0;
		VerseManager.SetCurrentVerseSet(verseset);
		Highlight();
		ApiManager apiManager = ApiManager.GetInstance();
		Hashtable arguments = new Hashtable();
		arguments.Add("verseset_id",verseset.onlineId);
		Hashtable options = new Hashtable();
		options.Add("handler",HandleApiVerseSetShow as Action<Hashtable>);
		options.Add("errorHandler",HandleError as Action);
		
		if (verseset.isOnline && (verseset.verses.Count == 0)) {
			StartCoroutine(apiManager.CallApi("verseset/show",
			arguments,
			options));
		} else {
			StartCoroutine(verseSetsManager.ShowVerses());
		}
	}
	
	public void Update() {
	
	}
}
