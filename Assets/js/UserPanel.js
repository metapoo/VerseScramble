#pragma strict

var usernameLabel : Text;
var pointsLabel : Text;

function SyncLoginStatus() {
	if (UserSession.IsLoggedIn()) {
		var us : UserSession = UserSession.GetUserSession();
		usernameLabel.text = us.username;
		pointsLabel.text = String.Format(TextManager.GetText("{0} points"), us.totalScore);
	} else {
		usernameLabel.text = TextManager.GetText("Anonymous");
		pointsLabel.text = String.Format(TextManager.GetText("{0} points"), 0);
	}
}

function Start () {
	SyncLoginStatus();
}

function Update () {

}