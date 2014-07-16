#pragma strict

public var zhFont : Font;
public var enFont : Font;

function resizeBackground(mainCam : Camera, background : SpriteRenderer) {
	if (background.sprite == null) return;
	var w = background.sprite.bounds.size.x;
	var h = background.sprite.bounds.size.y;
	var camW = mainCam.pixelWidth;
	var camH = mainCam.pixelHeight;
	var camX = 2*mainCam.ScreenToWorldPoint(new Vector3(camW, 0f, 0f)).x;
	var camY = 2*mainCam.ScreenToWorldPoint(new Vector3(0f, camH, 0f)).y;
	background.transform.localScale.x = camX/w;
	background.transform.localScale.y = camY/h;
}

function SetFontsAccordingToLanguage() {
	var guitexts : GUIText[] = FindObjectsOfType(GUIText) as GUIText[];
	var font : Font = enFont;
	var language = VerseManager.GetLanguage();
	
	if (language == 'en') {
		font = enFont;
	} else {
		font = zhFont;
	}
	
	for (var guitext : GUIText in guitexts) {
		Debug.Log(guitext);
		guitext.font = font;
	}
}

function OnGUI() {
/*
	if (Screen.width > 1500) {
		Screen.SetResolution(Screen.width * 0.5f, Screen.height * 0.5f, false);
	} else if (Screen.width < 700) {
		Screen.SetResolution(Screen.width * 1.5f, Screen.height * 1.5f, false);
	}
*/	
}

function Start () {
	var background : GameObject = GameObject.Find("BG");
	var mainCam : GameObject = GameObject.Find("Main Camera");
	if ((background != null) && (mainCam != null)) {
		resizeBackground(mainCam.camera, background.GetComponent("SpriteRenderer"));
	}
	SetFontsAccordingToLanguage();
}

function Update () {

}