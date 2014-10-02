var labelText : Text;
var languageDescription : String;
var languageCode : String;

function HandleOnClick() {
	VerseManager.SwitchLanguage(languageCode);
	Application.LoadLevel("versesets");
}

function SetCodeAndLanguage(code : String, language : String) {
	languageCode = code;
	languageDescription = language;
	SetLabel(languageDescription);
}

function SetLabel(label : String) {
	labelText.text = label;
}

function SetParent(prt : RectTransform) {
	var rt : RectTransform = GetComponent(RectTransform);
	var oldAPosition = rt.anchoredPosition;
	
	var oldScale = rt.localScale;
	var oldMin = rt.offsetMin;
	var oldMax = rt.offsetMax;
	
//	Debug.Log("offset min = " + oldMin);
//	Debug.Log("offset max = " + oldMax);
	
	rt.SetParent(prt);
	
	rt.anchoredPosition = oldAPosition;
	rt.localScale = oldScale;	
	
//	rt.offsetMin = oldMin;
//rt.offsetMax = oldMax;

	rt.offsetMin.x = 0;
	rt.offsetMax.x = -60;
	
}

function Awake() {
	SetLabel(languageDescription);
}

function Start() {
}

function Update() {
}
