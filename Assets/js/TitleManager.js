#pragma strict

import TextManager;

static public var stayInTitleScreen : boolean;

function Awake() {
	Application.targetFrameRate = 60;
	var language : String = VerseManager.GetLanguage();
	if (!TextManager.IsLoaded()) {
		TextManager.LoadLanguageOffline(language);
		var tm : TextManager = TextManager.GetInstance();
		tm.LoadLanguage(language, null);
	}
}

function LoadVerseSetsMenu() {
	var us: UserSession = UserSession.GetUserSession();
	if ((!us.verseId) && (!us.versesetId)) {			
		Application.LoadLevel("versesets");
	}
}

function Start () {
	if (PlayerPrefs.HasKey("language") && !stayInTitleScreen) {
		var language : String = VerseManager.GetLanguage();
		var vm : VerseManager = VerseManager.GetInstance();
		vm.SwitchLanguage(language, LoadVerseSetsMenu);
	}
}

function Update () {

}