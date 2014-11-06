#pragma strict

public var usernameField : InputField;
public var passwordField : InputField;
public var feedback : Text;
public var loginButton : LoginButton;
public var onLogin = function() {};

function Start() {
}

function Update() {
}

function HandleRegisterClick() {
	var url : String = String.Format("https://{0}/login/register",ApiManager.GetApiDomain());
	Debug.Log("open url: " + url);
	Application.OpenURL(url);
}

function SetParent(prt : RectTransform) {
	var rt : RectTransform = GetComponent(RectTransform);
	var oldPosition = rt.anchoredPosition;
	var oldScale = rt.localScale;
	
	rt.SetParent(prt);
	
	rt.anchoredPosition = oldPosition;
	rt.localScale = oldScale;	
}

function HandleLogin(resultData : Hashtable) {
	if (!resultData["logged_in"]) {
		feedback.text = TextManager.GetText("Invalid username or password");
		return;
	} else {
		feedback.text = "Success!";
	}
	var userSession : UserSession = UserSession.GetUserSession();
	
	userSession.HandleLogin(resultData);
	
	if (onLogin != null) {
		onLogin();
	}
	
	ClosePanel();
	
}

static function ShowLoginPanel(prefab : LoginPanel, loginButton : LoginButton) : LoginPanel {
	var clone : LoginPanel = Instantiate(prefab, Vector3.zero, Quaternion.identity);
	var canvas : RectTransform = GameObject.Find("Canvas").GetComponent(RectTransform);
	clone.SetParent(canvas);
	clone.loginButton = loginButton;
	return clone;
}

function ClosePanel() {
	if (loginButton != null) {
		loginButton.SyncLoginStatus();
		loginButton.curPanel = null;
	}
	Destroy(this.gameObject);
	
}

function SubmitLogin() {
	var username = usernameField.value;
	var password = passwordField.value;
	var apiManager : ApiManager = ApiManager.GetInstance();
	var arguments : Hashtable = new Hashtable();
	arguments.Add("username",username);
	arguments.Add("password",password);
	
	var options : Hashtable = new Hashtable();
	options.Add("handler",HandleLogin);
	options.Add("method","post");
	options.Add("cacheEnabled",false);
	options.Add("protocol","https");
	
	apiManager.CallApi("login/login",arguments,options);
}

