var usernameField : InputField;
var passwordField : InputField;
var feedback : Text;
var loginButton : LoginButton;

function Start() {
}

function Update() {
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
	ClosePanel();
	
}

function ClosePanel() {
	loginButton.SyncLabel();
	Destroy(this.gameObject);
	loginButton.curPanel = null;
}

function SubmitLogin() {
	var username = usernameField.value;
	var password = passwordField.value;
	ApiManager.GetInstance().CallApi("login/login",
	new Hashtable({"username":username,"password":password}),HandleLogin);
}

