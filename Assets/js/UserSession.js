#pragma strict

var options : Hashtable;

static function GetUserSession() {
	var usGO : GameObject = GameObject.Find("UserSession");
	if (usGO == null) return null;
	
	var us : UserSession = usGO.GetComponent("UserSession");
	if (us) {
		return us;
	}
	return null;
}

function Awake() {
	DontDestroyOnLoad(this.gameObject);
	options = new Hashtable();
}

// example URL: verserain://com.hopeofglory.verserain/verse/53ebe35da2ff372bfb9b91f4
function HandleURL(url : String) {

	var parts = url.Split("/"[0]);
	var subject = parts[3];
	var idstr = parts[4];
	if (subject == "verse") {
		SetVerseId(idstr);
	} else if (subject == "verseset") {
		SetVerseSetId(idstr);
	}
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

function Start () {
}

function Update () {

}