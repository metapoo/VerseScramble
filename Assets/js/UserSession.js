#pragma strict

var verseId : String = null;
var versesetId : String = null;
var apiDomain : String = null;
var userId : String = null;
var sessionKey : String = null;
var username : String = null;
var email : String = null;
var isLoggedIn : boolean = false;

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
	LoadUserLogin();
}

// example URL: verserain://com.hopeofglory.verserain/verse/53ebe35da2ff372bfb9b91f4/www.verserain.com
function HandleURL(url : String) {
	verseId = null;
	versesetId = null;
	
	var parts = url.Split("/"[0]);
	var subject = parts[3];
	var idstr = parts[4];
	var apiDom = parts[5];
	var sessionKey = parts[6];
	
	if (subject == "verse") {
		verseId = idstr;
	} else if (subject == "verseset") {
		versesetId = idstr;
	}

	apiDomain = apiDom;	
	Debug.Log("api domain set to " + apiDom);
	
	var startGame = function() {
		Debug.Log("Start game");
		var gmObject = GameObject.Find("GameManager");	
	
		if (gmObject) {
			var gameManager : GameManager = gmObject.GetComponent("GameManager");
			gameManager.Cleanup();
		}
	
		VerseManager.loaded = false;
		Application.LoadLevel("scramble");
	};
	
	var onLogin = function(userData:Hashtable) {
		HandleLogin(userData);
		startGame();
	};
	
	if (!IsLoggedIn() && (sessionKey != "None")) {
		ApiManager.GetInstance().CallApi("login/login",
				new Hashtable({"session_key":sessionKey}), onLogin);
	} else {
		startGame();
	}
	

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
	if (!userData["logged_in"]) {
		return;
	}
	
	userId = userData["_id"];
	sessionKey = userData["session_key"];
	username = userData["username"];
	email = userData["email"];
	isLoggedIn = true;
	
	var json : String = HashtableToJSON(userData);
	PlayerPrefs.SetString("user_data", json);
}

function LoadUserLogin() {
	if (sessionKey && userId) return;
	var json : String = PlayerPrefs.GetString("user_data");
	if (json) {
		Debug.Log("loaded user json = " + json);
		var userData : Hashtable = ParseJSON(json);
		HandleLogin(userData);
	}
}

static function IsLoggedIn() {
	var us : UserSession = GetUserSession();
	Debug.Log("user logged in: " + us.isLoggedIn);
	return (us.isLoggedIn);
}

function Logout() {
	isLoggedIn = false;
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
/*
	SetApiDomain("www.verserain.com");
	SetVerseSetId("542af9923f7ab0224bd53e2f");
    SetVerseId("542afb763f7ab0224bd53e33");
    */
    HandleURL("verserain://com.hopeofglory.verserain/verseset/542af9923f7ab0224bd53e2f/www.verserain.com/bb70d2a9cd8ff9a226b74af7b61d231f151a7cb2-53e42f6da2ff374cfa320f32");

}

function Update () {

}