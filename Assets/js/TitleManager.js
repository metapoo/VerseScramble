#pragma strict

import TextManager;

public var customSkin : GUISkin;
public var disabledStyle : GUIStyle;
public var showError : boolean = false;
public var sndSelect : AudioClip;
public var background : Transform;
public var mainCam : Camera;
public var titleLabel : GUIText;
public var selectLanguageLabel : GUIText;
public var sceneSetup : SceneSetup;

private	var selectedDifficulty : Difficulty;

function OnGUI() {
	var style : GUIStyle = customSkin.button;
	var enabled : boolean = true;
	var h = Screen.height;
	var w = Screen.width;
	
	style.font = sceneSetup.GetCurrentFont();
	style.fontSize = 0.02*w;
	
	customSkin.box.font = style.font;
	customSkin.box.fontSize = style.fontSize;
	
	GUI.skin = customSkin;
	var buttonSize = new Vector2(0.1601*w,0.078125*h);
	
	var selected:boolean = false;
	var dH = h*0.7;
	
	// language buttons
	selected = false;
	style = customSkin.button;
	
	if (GUI.Button(Rect(w*0.25-buttonSize.x*0.5,h*0.55,buttonSize.x,buttonSize.y),"English", style)) {
		VerseManager.SetLanguage("en");
		selected = true;
	}

	if (GUI.Button(Rect(w*0.5-buttonSize.x*0.5,h*0.55,buttonSize.x,buttonSize.y),"中文", style)) {
		VerseManager.SetLanguage("zh-hant");
		selected = true;
	}

	if (GUI.Button(Rect(w*0.75-buttonSize.x*0.5,h*0.55,buttonSize.x,buttonSize.y),"한국어", style)) {
		VerseManager.SetLanguage("ko");
		selected = true;
	}
	
	if (selected) {
		audio.PlayOneShot(sndSelect);
		
		Application.LoadLevel("verselist");
	}
	
		
	titleLabel.fontSize = 0.07*w;
	selectLanguageLabel.fontSize = 0.035*w;

}

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
	
	var gt = TextManager.GetText;
	
	titleLabel.guiText.text = gt("Verse Rain");
	
	selectLanguageLabel.guiText.text = gt("Select Language");
	
	while (1) {
		if (CheckOption()) return;
		yield WaitForSeconds(0.1f);
	}
}

function Update () {

}