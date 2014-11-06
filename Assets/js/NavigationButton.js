#pragma strict

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

	var versesetsData : Array = resultData["versesets"];
	for (var i=0;i<versesetsData.length;i++) {
		var versesetData : Hashtable = versesetsData[i];
		VerseManager.LoadVerseSetData(versesetData);
	}
	verseSetsManager.ShowVerseSets();
	
}

function HandleOnClick() {
	if ((view == "popular") || (view == "new") || (view == "history") || (view == "mysets")) {
		Highlight();
		VerseManager.SetCurrentView(view);
	}
	
	var versesets : List.<VerseSet> = VerseManager.GetCurrentVerseSets();
	var apiDomain : String = ApiManager.GetApiDomain();
	var apiManager : ApiManager = ApiManager.GetInstance();
	var us : UserSession = UserSession.GetUserSession();
	var arguments : Hashtable;
	arguments = new Hashtable({"order_by":view,"page":1,"language_code":VerseManager.GetLanguage()});
	
	var handleError : Function = function() {
		apiManager.GetApiCache("verseset/list",
		arguments,
		new Hashtable({"handler":HandleApiVerseSetList}));
	};
	
	if ((view == "popular") || (view == "new")) {
		apiManager.CallApi("verseset/list",
		arguments,
		new Hashtable({"handler":HandleApiVerseSetList, "errorHandler":handleError}));
	} else if (view == "history") {
		if (UserSession.IsLoggedIn() && (!VerseManager.historyLoaded)) {
			apiManager.CallApi("profile/versesets/history",
			new Hashtable({}),
			new Hashtable({"handler":HandleApiVerseSetList}));
		}
	} else if (view == "mysets") {
		var showMySets : Function = function() {
			Debug.Log("show my sets");
			apiManager.CallApi("verseset/list",
			new Hashtable({"user_id":us.userId,"page":1,"language_code":VerseManager.GetLanguage()}),
			new Hashtable({"handler":HandleApiVerseSetList}));
			
		};
		
		if (!UserSession.IsLoggedIn()) {
			var clone : LoginPanel = LoginPanel.ShowLoginPanel(loginPanel, null);
				clone.onLogin = function() {
					showMySets();
				};
		} else {	
			showMySets();
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

