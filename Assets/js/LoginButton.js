#pragma strict
public var loginPanel : LoginPanel;
public var curPanel : LoginPanel;
public var loginLabel : Text;
public var loginMode : boolean = true;
public var userPanel : UserPanel;

function ShowLogin() {
	if (!loginMode) {
		UserSession.GetUserSession().Logout();
		SyncLoginStatus();
		return;
	}
	
	if (curPanel != null) {
		curPanel.ClosePanel();
		return;
	}
	
	var clone : LoginPanel = LoginPanel.ShowLoginPanel(loginPanel, this);
	curPanel = clone;
}

function SyncLoginStatus() {

	if (UserSession.IsLoggedIn()) {
		loginMode = false;
		loginLabel.text = TextManager.GetText("Logout");
	} else {
		loginMode = true;
		loginLabel.text = TextManager.GetText("Login");
	}
	
	if (userPanel != null) {
		userPanel.SyncLoginStatus();
	}
}

function Start() {
	SyncLoginStatus();
}
