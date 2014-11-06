#pragma strict

import JSONUtils;

public var verseId : String = null;
public var versesetId : String = null;
public var apiDomain : String = null;
public var userId : String = null;
public var sessionKey : String = null;
public var username : String = null;
public var email : String = null;
public var fbUid : String = null;
public var _name : String = null;
public var fbPicUrl : String = null;

public var totalScore : int = 0;
public var isLoggedIn : boolean = false;

public static var started : boolean = false;

static function GetUserSession() : UserSession {
	
	var usGO : GameObject = GameObject.Find("UserSession");
	if (usGO == null) {
		usGO = new GameObject("UserSession");
		usGO.AddComponent(UserSession);
	}
	
	var us : UserSession = usGO.GetComponent(UserSession);
	if (us) {
		return us;
	}
	return null;
}

function Awake() {
	DontDestroyOnLoad(this.gameObject);
	LoadUserLogin();
}

function HandleFbLogin(parameters : Hashtable) {
	var accessToken = parameters["accessToken"];
	var fbUid = parameters["fbUid"];
	var fbPicUrl = parameters["fbPicUrl"];
	
	var onLogin = function(userData:Hashtable) {
		HandleLogin(userData);	
		var loginPanel : LoginPanel = GameObject.FindObjectOfType(LoginPanel);
		if (loginPanel != null) {
			Destroy(loginPanel.gameObject);
		}
	};
	
	var arguments : Hashtable = new Hashtable();
	arguments.Add("access_token",accessToken);
	arguments.Add("fb_uid",fbUid);
	arguments.Add("fb_pic_url",fbPicUrl);
	
	var options : Hashtable = new Hashtable();
	options.Add("cacheEnabled",false);
	options.Add("protocol","https");
	options.Add("method","post");
	options.Add("handler",onLogin);
	
	ApiManager.GetInstance().CallApi("fb/login", 
	arguments,
	options);
}

// example URL: verserain://com.hopeofglory.verserain/verse/53ebe35da2ff372bfb9b91f4/www.verserain.com
function HandleURL(url : String) {
	verseId = null;
	versesetId = null;
	
	var parts : String[] = url.Split("/"[0]);
	var subject : String = parts[3];
	var idstr : String = parts[4];
	var apiDom : String = parts[5];
	var sessionKey : String = parts[6];

	if ((idstr == "None") || (idstr == "null")) {
		idstr = null;
	}	
	
	if (subject == "verse") {
		verseId = idstr;
	} else if (subject == "verseset") {
		versesetId = idstr;
	}

	apiDomain = apiDom;	
	Debug.Log("api domain set to " + apiDom);
	
	if (!IsLoggedIn() && (sessionKey != "None")) {
		if (idstr != null) {
			DoLogin(sessionKey, StartGame);
		} else {
			DoLogin(sessionKey, null);
		}
	} else {
		if (idstr != null) {
			StartGame();
		}
	}
}

var StartGame = function() {
	var gmObject = GameObject.Find("GameManager");	
	
	if (gmObject) {
		var gameManager : GameManager = gmObject.GetComponent(GameManager);
		gameManager.Cleanup();
	}
	
	VerseManager.loaded = false;
	Application.LoadLevel("scramble");
};

function DoLogin(sessionKey : String) {
	DoLogin(sessionKey, null);
}

function DoLogin(sessionKey : String, afterLogin : Function) {
	var onLogin = function(userData:Hashtable) {
		HandleLogin(userData);
		if (afterLogin != null) {
			afterLogin();
		}
	};
	
	var apiManager : ApiManager = ApiManager.GetInstance();
	var arguments : Hashtable = new Hashtable();
	arguments.Add("session_key",sessionKey);
	var options : Hashtable = new Hashtable();
	options.Add("handler",onLogin);
	options.Add("errorHandler",null);
	options.Add("cacheEnabled",false);
	options.Add("protocol","https");
	options.Add("method","post");
					   
	apiManager.CallApi("login/login",
		arguments, 
		options);
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
	if (userData.ContainsKey("total_score")) {
		totalScore = userData["total_score"];
	} else {
		totalScore = 0;
	}
	if (userData.ContainsKey("fb_uid")) {
		fbUid = userData["fb_uid"];
	}
	if (userData.ContainsKey("fb_pic_url")) {
		fbPicUrl = userData["fb_pic_url"];
	}
	if (userData.ContainsKey("name")) {
		_name = userData["name"];
	}
	isLoggedIn = true;
	
	var json : String = HashtableToJSON(userData);
	PlayerPrefs.SetString("user_data", json);
	
	var loginButton : LoginButton = GameObject.FindObjectOfType(LoginButton);
	if (loginButton != null) {
		loginButton.SyncLoginStatus();
	}
}

function Save() {
	
	var userData : Hashtable = new Hashtable();
	userData.Add("email",email);
	userData.Add("username",username);
	userData.Add("_id",userId);
	userData.Add("session_key",sessionKey);
	userData.Add("total_score",totalScore);
	userData.Add("logged_in",isLoggedIn);
	userData.Add("fb_uid",fbUid);
	userData.Add("name",_name);
	userData.Add("fb_pic_url",fbPicUrl);
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
		// refresh by logging in again
		var sessionKey = userData["session_key"];
		DoLogin(sessionKey);
	}
}

static function IsLoggedIn() : boolean {
	var us : UserSession = GetUserSession();
	//Debug.Log("user logged in: " + us.isLoggedIn);
	return (us.isLoggedIn);
}

function Logout() {
	isLoggedIn = false;
	userId = null;
	sessionKey = null;
	username = null;
	email = null;
	_name = null;
	fbPicUrl = null;
	fbUid = null;
	totalScore = 0;
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
    //HandleURL("verserain://com.hopeofglory.verserain/verse/None/www.verserain.com/bb70d2a9cd8ff9a226b74af7b61d231f151a7cb2-53e42f6da2ff374cfa320f32");
    //HandleURL("verserain://com.hopeofglory.verserain/verse/544a600b3f7ab063b3c5839b/www.verserain.com/bb70d2a9cd8ff9a226b74af7b61d231f151a7cb2-53e42f6da2ff374cfa320f32");
	//HandleURL("verserain://com.hopeofglory.verserain/verse/542afb763f7ab0224bd53e33/www.verserain.com/bb70d2a9cd8ff9a226b74af7b61d231f151a7cb2-53e42f6da2ff374cfa320f32");
}

function Update () {

}