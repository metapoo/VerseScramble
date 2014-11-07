using UnityEngine;
using System;
using UnityEngine.UI;


public class LoginButton:MonoBehaviour{
	public LoginPanel loginPanel;
	public LoginPanel curPanel;
	public Text loginLabel;
	public bool loginMode = true;
	public UserPanel userPanel;
	
	public void ShowLogin() {
		if (!loginMode) {
			UserSession.GetUserSession().Logout();
			SyncLoginStatus();
			return;
		}
		
		if (curPanel != null) {
			curPanel.ClosePanel();
			return;
		}
		
		LoginPanel clone = LoginPanel.ShowLoginPanel(loginPanel, this);
		curPanel = clone;
	}
	
	public void SyncLoginStatus() {
	
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
	
	public void Start() {
		SyncLoginStatus();
	}

}
