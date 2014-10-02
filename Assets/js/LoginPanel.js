var usernameField : InputField;
var passwordField : InputField;
var feedback : Text;

function Start() {
}

function Update() {
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
	Destroy(this.gameObject);
}

function SubmitLogin() {
	var username = usernameField.value;
	var password = passwordField.value;
	ApiManager.GetInstance().CallApi("login/login",
	new Hashtable({"username":username,"password":password}),HandleLogin);
}

