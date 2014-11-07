using UnityEngine;
using System;
using UnityEngine.UI;


public class UserPanel:MonoBehaviour{
	
	public Text usernameLabel;
	public Text pointsLabel;
	
	public void SyncLoginStatus() {
		if (UserSession.IsLoggedIn()) {
			UserSession us = UserSession.GetUserSession();
			usernameLabel.text = us.username;
			pointsLabel.text = String.Format(TextManager.GetText("{0} points"), us.totalScore);
		} else {
			usernameLabel.text = TextManager.GetText("Anonymous");
			pointsLabel.text = String.Format(TextManager.GetText("{0} points"), 0);
		}
	}
	
	public void Start() {
		SyncLoginStatus();
	}
	
	public void Update() {
	
	}
}
