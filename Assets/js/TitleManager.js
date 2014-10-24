#pragma strict

import TextManager;

public var showError : boolean = false;
public var sndSelect : AudioClip;
public var background : Transform;
static public var stayInTitleScreen : boolean;

private	var selectedDifficulty : Difficulty;

function Awake() {
	Application.targetFrameRate = 60;
	var language : String = VerseManager.GetLanguage();
	if (!TextManager.IsLoaded()) {
		TextManager.LoadLanguageOffline(language);
		TextManager.GetInstance().LoadLanguage(language, null);
	}
}

function Start () {
	if (PlayerPrefs.HasKey("language") && !stayInTitleScreen) {
		var language : String = VerseManager.GetLanguage();
		var onFinish : Function = function() {
			Application.LoadLevel("versesets");
		};
		VerseManager.GetInstance().SwitchLanguage(language, onFinish);
		
	}
}

function Update () {

}