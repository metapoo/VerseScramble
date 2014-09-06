#pragma strict

var options : Hashtable;
static var singleton : UserSession = null;

static function GetUserSession() {
	if (singleton) return singleton;
	
	var usGO : GameObject = GameObject.Find("UserSession");
	if (usGO == null) return null;
	
	var us : UserSession = usGO.GetComponent("UserSession");
	if (us) {
		singleton = us;
		return us;
	}
	return null;
}

function Awake() {
	DontDestroyOnLoad(this.gameObject);
	options = new Hashtable();
}

// example URL: verserain://com.hopeofglory.verserain/verse/53ebe35da2ff372bfb9b91f4/www.verserain.com
function HandleURL(url : String) {

	var parts = url.Split("/"[0]);
	var subject = parts[3];
	var idstr = parts[4];
	var apiDomain = parts[5];
	
	if (subject == "verse") {
		SetVerseId(idstr);
	} else if (subject == "verseset") {
		SetVerseSetId(idstr);
	}
	
	var us = GetUserSession();
	
	if (us) {
		us.SetApiDomain(apiDomain);
	}
	
	var gameManager : GameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	if (gameManager) {
		gameManager.Cleanup();
	}
	Application.LoadLevel("scramble");
}

function SetOption(key : String, value : String) {
	options[key] = value;
}

function SetVerseId(verse_id : String) {
	SetOption("verse_id", verse_id);
}

function SetVerseSetId(verseset_id : String) {
	SetOption("verseset_id", verseset_id);
}

function ClearOptions() {
	options.Clear();
}

function VerseId() : String {
	if (options.ContainsKey("verse_id")) {
		return options["verse_id"];
	}
	return null;
}

function VerseSetId() : String {
	if (options.ContainsKey("verseset_id")) {
		return options["verseset_id"];
	}
	return null;
}

function ApiDomain() : String {
	if (options.ContainsKey("api_domain")) {
		return options["api_domain"];
	} else {
		return "dev.verserain.com";
	}
}

function SetApiDomain(api_domain : String) {
	SetOption("api_domain", api_domain);
}

function Start () {
//	SetApiDomain("www.verserain.com");
//    SetVerseSetId("540a149f3f7ab072f26e3489");
}

function Update () {

}