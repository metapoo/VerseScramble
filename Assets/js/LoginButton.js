public var loginPanel : LoginPanel;
public var curPanel : LoginPanel;
public var loginLabel : Text;
public var loginMode : boolean = true;

function ShowLogin() {
	if (!loginMode) {
		UserSession.GetUserSession().Logout();
		SyncLabel();
		return;
	}
	
	if (curPanel != null) {
		curPanel.ClosePanel();
		return;
	}
	
	var clone : LoginPanel = Instantiate(loginPanel, Vector3.zero, Quaternion.identity);
	var canvas : RectTransform = GameObject.Find("Canvas").GetComponent(RectTransform);
	clone.SetParent(canvas);
	clone.loginButton = this;
	curPanel = clone;
}

function SyncLabel() {

	if (UserSession.IsLoggedIn()) {
		loginMode = false;
		loginLabel.text = TextManager.GetText("Logout");
	} else {
		loginMode = true;
		loginLabel.text = TextManager.GetText("Login");
	}
}

function Start() {
	SyncLabel();
}