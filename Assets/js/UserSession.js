#pragma strict

public var options : Hashtable;
static var started : boolean = false;

static function GetUserSession() {
	
	var usGO : GameObject = GameObject.Find("UserSession");
	if (usGO == null) {
		usGO = new GameObject("UserSession");
		usGO.AddComponent(typeof(UserSession));
	}
	
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

// example URL: verserain://com.hopeofglory.verserain/verse/53ebe35da2ff372bfb9b91f4/www.verserain.com
function HandleURL(url : String) {
	ClearOption("verse_id");
	ClearOption("verseset_id");
	
	var parts = url.Split("/"[0]);
	var subject = parts[3];
	var idstr = parts[4];
	var apiDomain = parts[5];
	
	if (subject == "verse") {
		SetVerseId(idstr);
	} else if (subject == "verseset") {
		SetVerseSetId(idstr);
	}
	
	SetApiDomain(apiDomain);
	
	var gmObject = GameObject.Find("GameManager");	
	
	if (gmObject) {
		var gameManager : GameManager = gmObject.GetComponent("GameManager");
		gameManager.Cleanup();
	}
	
	VerseManager.loaded = false;
	Application.LoadLevel("scramble");
}

function SetOption(key : String, value : String) {
	options[key] = value;
}

function ClearOption(key : String) {
	options.Remove(key);
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
		return ApiManager.GetApiDomain();
	}
}

function ClearUrlOptions() {
	ClearOption("verse_id");
	ClearOption("verseset_id");
}

function SetApiDomain(api_domain : String) {
	SetOption("api_domain", api_domain);
}

function HandleLogin(userData : Hashtable) {
	SetOption("user_id", userData["_id"]);
	SetOption("session_key", userData["session_key"]);
	SetOption("username", userData["username"]);
	SetOption("email", userData["email"]);
	
	var json : String = HashtableToJSON(userData);
	PlayerPrefs.SetString("user_data", json);
}

function LoadUserLogin() {
	var json : String = PlayerPrefs.GetString("user_data");
	if (json != null) {
		var userData : Hashtable = ParseJSON(json);
		HandleLogin(userData);
	}
}

function Logout() {
	ClearOption("user");
	PlayerPrefs.DeleteKey("user_data");
}

function Start () {
    // we're ready to pass in parameters from web client to user session
	if (Application.isWebPlayer && !started) {
		Application.ExternalEval(
    	"u.start_verserain();"
		);
		started = true;
	}
	LoadUserLogin();
/*
	SetApiDomain("www.verserain.com");
	SetVerseSetId("540a149f3f7ab072f26e3489");
    SetVerseId("540a180c3f7ab072f26e3495");
*/
}

function Update () {

}