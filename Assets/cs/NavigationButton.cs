using UnityEngine;
using System;
using System.Collections.Generic;
using UnityEngine.UI;
using System.Collections;


public class NavigationButton:MonoBehaviour{
	
	public Button button;
	public Text label;
	public string view;
	public VerseSetsManager verseSetsManager;
	public LoginPanel loginPanel;
	
	Color normalColor;
	public static NavigationButton selectedButton = null;
	
	public void Awake() {
		normalColor = button.colors.normalColor;
		verseSetsManager = (VerseSetsManager)GameObject.FindObjectOfType(typeof(VerseSetsManager));
	}
	
	public void Update() {
	}
	
	public void Start() {
		button = GetComponent<Button>();
		//button.onClick.AddListener(HandleOnClick);
	}
	
	public void HandleApiVerseSetList(Hashtable resultData) {
		string currentView = VerseManager.GetCurrentView(false);
		if (currentView != view) return;
		if (view == "history") {
			VerseManager.historyLoaded = true;
		}
		VerseManager.ClearVerseSets(view);
		
		List<object> versesetDatas = (List<object>)resultData["versesets"];

		for(int i=0;i<versesetDatas.Count;i++) {
			Hashtable versesetData = versesetDatas[i] as Hashtable;
			VerseManager.LoadVerseSetData(versesetData);
		}
		StartCoroutine(verseSetsManager.ShowVerseSets());
		
	}
	
	public void HandleError() {
		Hashtable arguments = new Hashtable();
		arguments.Add("order_by",view);
		arguments.Add("page",1);
		arguments.Add("language_code",VerseManager.GetLanguage());
	
		Hashtable options = new Hashtable();
		options.Add("handler",HandleApiVerseSetList as Action<Hashtable>);
		ApiManager api = ApiManager.GetInstance();
		api.GetApiCache("verseset/list",
		arguments,
		options);
	}
	
	public void ShowMySets() {
		UserSession us = UserSession.GetUserSession();
		Hashtable arguments = new Hashtable();
		ApiManager apiManager = ApiManager.GetInstance();
		arguments.Add("user_id",us.userId);
		arguments.Add("page",1);
		arguments.Add("language_code",VerseManager.GetLanguage());
		Hashtable options = new Hashtable();
		options.Add("handler",HandleApiVerseSetList as Action<Hashtable>);
		StartCoroutine(apiManager.CallApi("verseset/list",
		arguments,
		options));
	}
	
	
	public void HandleOnClick() {
		if ((view == "popular") || (view == "new") || (view == "history") || (view == "mysets")) {
			Highlight();
			VerseManager.SetCurrentView(view);
		}
		
		ApiManager apiManager = ApiManager.GetInstance();
		Hashtable arguments = null;
		Hashtable options = null;
		
		arguments = new Hashtable();
		arguments.Add("order_by",view);
		arguments.Add("page",1);
		arguments.Add("language_code",VerseManager.GetLanguage());
		
	
		if ((view == "popular") || (view == "new")) {
			options = new Hashtable();
			options.Add("handler",HandleApiVerseSetList as Action<Hashtable>);
			options.Add("errorHandler",HandleError as Action);
			
			StartCoroutine(apiManager.CallApi("verseset/list",
			arguments,
			options));
		} else if (view == "history") {
			options = new Hashtable();
			options.Add("handler",HandleApiVerseSetList as Action<Hashtable>);
			if (UserSession.IsLoggedIn() && (!VerseManager.historyLoaded)) {
				StartCoroutine(apiManager.CallApi("profile/versesets/history",
				new Hashtable(),
				options));
			}
		} else if (view == "mysets") {
			
			
			if (!UserSession.IsLoggedIn()) {
				LoginPanel clone = LoginPanel.ShowLoginPanel(loginPanel, null);
					clone.onLogin = ShowMySets;
			} else {	
				ShowMySets();
			}
		} else if (view == "profile") {
			Application.OpenURL(ApiManager.GetUrl("/profile"));
		} else if (view == "leaderboard") {
			Application.OpenURL(ApiManager.GetUrl("/leaderboard"));
		}
		
		StartCoroutine(verseSetsManager.ShowVerseSets());
		StartCoroutine(verseSetsManager.ShowVerses());
	}
	
	public void Highlight() {
		if (selectedButton != null) {
			selectedButton.UnHighlight();
		}
		selectedButton = this;
		var tmp_cs1 = button.colors;
        tmp_cs1.normalColor = button.colors.highlightedColor;
        button.colors = tmp_cs1;
	}
	
	public void UnHighlight() {
		var tmp_cs2 = button.colors;
        tmp_cs2.normalColor = normalColor;
        button.colors = tmp_cs2;
	}


}
