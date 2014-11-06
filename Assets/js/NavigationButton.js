#pragma strict

import System.Collections.Generic;

public var button : Button;
public var label : Text;
public var view : String;
public var verseSetsManager : VerseSetsManager;
public var loginPanel : LoginPanel;

private var normalColor : Color;
static var selectedButton : NavigationButton = null;

function Awake() {
	normalColor = button.colors.normalColor;
	verseSetsManager = GameObject.FindObjectOfType(VerseSetsManager);
}

function Update () {
}

function Start () {
	button = GetComponent(Button);
	//button.onClick.AddListener(HandleOnClick);
}

function HandleApiVerseSetList(resultData : Hashtable) {
	var currentView = VerseManager.GetCurrentView(false);
	if (currentView != view) return;
	if (view == "history") {
		VerseManager.historyLoaded = true;
	}
	VerseManager.ClearVerseSets(view);
	
	var versesetDatas : List.<Object> = resultData["versesets"];
	
	for (var i=0;i<versesetDatas.Count;i++) {
		var versesetData : Hashtable = versesetDatas[i] as Hashtable;
		VerseManager.LoadVerseSetData(versesetData);
	}
	verseSetsManager.ShowVerseSets();
	
}

function HandleError() {
	var arguments : Hashtable = new Hashtable();
	arguments.Add("order_by",view);
	arguments.Add("page",1);
	arguments.Add("language_code",VerseManager.GetLanguage());

	var options : Hashtable = new Hashtable();
	options.Add("handler",HandleApiVerseSetList);
	var api : ApiManager = ApiManager.GetInstance();
	api.GetApiCache("verseset/list",
	arguments,
	options);
};

function ShowMySets() {
	var us : UserSession = UserSession.GetUserSession();
	var arguments : Hashtable = new Hashtable();
	var apiManager : ApiManager = ApiManager.GetInstance();
	arguments.Add("user_id",us.userId);
	arguments.Add("page",1);
	arguments.Add("language_code",VerseManager.GetLanguage());
	var options : Hashtable = new Hashtable();
	options.Add("handler",HandleApiVerseSetList);
	apiManager.CallApi("verseset/list",
	arguments,
	options);
};


function HandleOnClick() {
	if ((view == "popular") || (view == "new") || (view == "history") || (view == "mysets")) {
		Highlight();
		VerseManager.SetCurrentView(view);
	}
	
	var versesets : List.<VerseSet> = VerseManager.GetCurrentVerseSets();
	var apiDomain : String = ApiManager.GetApiDomain();
	var apiManager : ApiManager = ApiManager.GetInstance();
	var arguments : Hashtable;
	var options : Hashtable;
	
	arguments = new Hashtable();
	arguments.Add("order_by",view);
	arguments.Add("page",1);
	arguments.Add("language_code",VerseManager.GetLanguage());
	

	if ((view == "popular") || (view == "new")) {
		options = new Hashtable();
		options.Add("handler",HandleApiVerseSetList);
		options.Add("errorHandler",HandleError);
		
		apiManager.CallApi("verseset/list",
		arguments,
		options);
	} else if (view == "history") {
		options = new Hashtable();
		options.Add("handler",HandleApiVerseSetList);
		if (UserSession.IsLoggedIn() && (!VerseManager.historyLoaded)) {
			apiManager.CallApi("profile/versesets/history",
			new Hashtable(),
			options);
		}
	} else if (view == "mysets") {
		
		
		if (!UserSession.IsLoggedIn()) {
			var clone : LoginPanel = LoginPanel.ShowLoginPanel(loginPanel, null);
				clone.onLogin = ShowMySets;
		} else {	
			ShowMySets();
		}
	} else if (view == "profile") {
		Application.OpenURL(ApiManager.GetUrl("/profile"));
	} else if (view == "leaderboard") {
		Application.OpenURL(ApiManager.GetUrl("/leaderboard"));
	}
	
	verseSetsManager.ShowVerseSets();
	verseSetsManager.ShowVerses();
}

function Highlight() {
	var rt : RectTransform = GetComponent(RectTransform);	
	if (selectedButton != null) {
		selectedButton.UnHighlight();
	}
	selectedButton = this;
	button.colors.normalColor = button.colors.highlightedColor;
}

function UnHighlight() {
	button.colors.normalColor = normalColor;
}

