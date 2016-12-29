using UnityEngine;
using System;
using UnityEngine.UI;
using System.Collections;

public class LoginPanel:MonoBehaviour{
	
	public InputField usernameField;
	public InputField passwordField;
	public Text feedback;
	public LoginButton loginButton;
	public Action onLogin = delegate() {};
	
	public void Start() {
	}
	
	public void Update() {
	}
	
	public void HandleRegisterClick() {
		string url = String.Format("https://{0}/login/register",ApiManager.GetApiDomain());
		Debug.Log("open url: " + url);
		Application.OpenURL(url);
	}
	
	public void SetParent(RectTransform prt) {
		RectTransform rt = GetComponent<RectTransform>();
		Vector2 oldPosition = rt.anchoredPosition;
		Vector3 oldScale = rt.localScale;
		
		rt.SetParent(prt);
		
		rt.anchoredPosition = oldPosition;
		rt.localScale = oldScale;	
	}
	
	public void HandleLogin(Hashtable resultData) {
		bool isLoggedIn = (bool) resultData["logged_in"];
		if (!isLoggedIn) {
			feedback.text = TextManager.GetText("Invalid username or password");
			return;
		} else {
			feedback.text = "Success!";
		}
		UserSession userSession = UserSession.GetUserSession();
		
		userSession.HandleLogin(resultData);
		
		if (onLogin != null) {
			Debug.Log ("Call OnLogin");
			onLogin();
		}
		
		ClosePanel();
		
	}
	
	public static LoginPanel ShowLoginPanel(LoginPanel prefab,LoginButton loginButton) {
		LoginPanel clone = (LoginPanel)Instantiate(prefab, Vector3.zero, Quaternion.identity);
		RectTransform canvas = GameObject.Find("Canvas").GetComponent<RectTransform>();
		clone.SetParent(canvas);
		clone.loginButton = loginButton;
		return clone;
	}
	
	public void ClosePanel() {
		if (loginButton != null) {
			loginButton.SyncLoginStatus();
			loginButton.curPanel = null;
		}
		Destroy(this.gameObject);
		
	}
	
	public void SubmitLogin() {
		string username = usernameField.text;
		string password = passwordField.text;
		Action<Hashtable> handleLogin = HandleLogin;
		ApiManager apiManager = ApiManager.GetInstance();
		Hashtable arguments = new Hashtable();
		arguments.Add("username",username);
		arguments.Add("password",password);
		
		Hashtable options = new Hashtable();
		options.Add("handler", handleLogin);
		options.Add("method", "post");
		options.Add("cacheEnabled", false);
		options.Add("protocol", "https");
		
		StartCoroutine(apiManager.CallApi("login/login",arguments,options));
	}


}
