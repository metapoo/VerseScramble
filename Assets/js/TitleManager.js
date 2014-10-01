#pragma strict

import TextManager;

public var showError : boolean = false;
public var sndSelect : AudioClip;
public var background : Transform;

private	var selectedDifficulty : Difficulty;

function CheckOption() {
	
	var us : UserSession = UserSession.GetUserSession();
	
	if (us) {
		var verseId = us.VerseId();
		var versesetId = us.VerseSetId();
		if (verseId || versesetId) {
			Application.LoadLevel("scramble");
			return true;
		}
	}
	return false;
}

function Start () {

	
	Application.targetFrameRate = 60;
	TextManager.LoadLanguage(VerseManager.GetLanguage());
		
	while (1) {
		if (CheckOption()) return;
		yield WaitForSeconds(0.1f);
	}
}

function Update () {

}