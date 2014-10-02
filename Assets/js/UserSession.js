#pragma strict

var verseId : String = null;
var versesetId : String = null;
var apiDomain : String = null;
var userId : String = null;
var sessionKey : String = null;
var username : String = null;
var email : String = null;

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
}

// example URL: verserain://com.hopeofglory.verserain/verse/53ebe35da2ff372bfb9b91f4/www.verserain.com
function HandleURL(url : String) {
	verseId = null;
	versesetId = null;
	
	var parts = url.Split("/"[0]);
	var subject = parts[3];
	var idstr = parts[4];
	var apiDom = parts[5];
	
	if (subject == "verse") {
		verseId = idstr;
	} else if (subject == "verseset") {
		versesetId = idstr;
	}

	apiDomain = apiDom;	
	
	var gmObject = GameObject.Find("GameManager");	
	
	if (gmObject) {
		var gameManager : GameManager = gmObject.GetComponent("GameManager");
		gameManager.Cleanup();
	}
	
	VerseManager.loaded = false;
	Application.LoadLevel("scramble");
}

function SetVerseId(verseId_ : String) {
	verseId = verseId_;
}

function SetVerseSetId(versesetId_ : String) {
	versesetId = versesetId_;
}

function SetApiDomain(apiDomain_ : String) {
	apiDomain = apiDomain_;
}

function ApiDomain() : String {
	if (apiDomain) {
		return apiDomain;
	} else {
		return ApiManager.GetApiDomain();
	}
}

function ClearUrlOptions() {
	verseId = null;
	versesetId = null;
}

function HandleLogin(userData : Hashtable) {
	userId = userData["_id"];
	sessionKey = userData["session_key"];
	username = userData["username"];
	email = userData["email"];
	
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
	userId = null;
	sessionKey = null;
	username = null;
	email = null;
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

//	SetApiDomain("www.verserain.com");
	//SetVerseSetId("542af9923f7ab0224bd53e2f");
//    SetVerseId("542afb763f7ab0224bd53e33");

}

function Update () {

}