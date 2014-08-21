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

function SetOption(key : String, value : String) {
	options[key] = value;
}

function SetVerseId(verse_id : String) {
	SetOption("verse_id", verse_id);
}

function SetVerseSetId(verseset_id : String) {
	SetOption("verseset_id", verseset_id);
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