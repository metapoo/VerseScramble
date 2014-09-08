#pragma strict

public var defaultFont : Font;
static var hiRes : boolean;

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

function GetCurrentFont() {
	var language = VerseManager.GetLanguage();
	var font : Font = defaultFont;
	return font;
}

function ApplyCurrentFont() {
	var guitexts : GUIText[] = FindObjectsOfType(GUIText) as GUIText[];
	var font : Font = GetCurrentFont();
	
	for (var guitext : GUIText in guitexts) {
		guitext.font = font;
	}
}

function OnGUI() {
	if (Screen.width > 1500) {
		hiRes = true;
		//Screen.SetResolution(Screen.width * 0.5f, Screen.height * 0.5f, false);
	} else if (Screen.width < 700) {
		hiRes = false;
		//Screen.SetResolution(Screen.width * 1.5f, Screen.height * 1.5f, false);
	}
}

function Start () {
	var background : GameObject = GameObject.Find("BG");
	var mainCam : GameObject = GameObject.Find("Main Camera");
	if ((background != null) && (mainCam != null)) {
		resizeBackground(mainCam.camera, background.GetComponent("SpriteRenderer"));
	}
	ApplyCurrentFont();
}

function Update () {

}