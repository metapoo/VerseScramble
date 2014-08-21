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
	options.Add(key, value);
}

function VerseId() {
	if (options.ContainsKey("verse_id")) {
		return options["verse_id"];
	}
	return null;
}

function VerseSetId() {
	if (options.ContainsKey("verseset_id")) {
		return options["verseset_id"];
	}
	return null;
}

function Start () {
}

function Update () {

}