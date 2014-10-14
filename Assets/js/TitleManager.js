#pragma strict

import TextManager;

public var showError : boolean = false;
public var sndSelect : AudioClip;
public var background : Transform;

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
}

function Update () {

}