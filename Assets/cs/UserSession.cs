using UnityEngine;
using System;
using System.Collections;


public class UserSession:MonoBehaviour{
	
	public string verseId = null;
	public string versesetId = null;
	public string apiDomain = null;
	public string userId = null;
	public string sessionKey = null;
	public string username = null;
	public string email = null;
	public string fbUid = null;
	public string _name = null;
	public string fbPicUrl = null;
	
	public int totalScore = 0;
	public bool isLoggedIn = false;
	
	public static bool started = false;
	
	public static UserSession GetUserSession() {
		
		GameObject usGO = GameObject.Find("UserSession");
		if (usGO == null) {
			usGO = new GameObject("UserSession");
			usGO.AddComponent<UserSession>();
		}
		
		UserSession us = usGO.GetComponent<UserSession>();
		if (us != null) {
			return us;
		}
		Debug.Log ("UserSession = " + us);
		return null;
	}
	
	public void Awake() {
		DontDestroyOnLoad(this.gameObject);
		LoadUserLogin();
	}

	public bool IsUrlDirected() {
		return !(String.IsNullOrEmpty(verseId) && String.IsNullOrEmpty(versesetId));
	}

	public void HandleFbLogin(Hashtable parameters) {
		string accessToken = parameters["accessToken"] as String;
		string fbUid = parameters["fbUid"] as String;
		string fbPicUrl = parameters["fbPicUrl"] as String;

		if (String.IsNullOrEmpty(fbUid)) {
			Debug.Log ("No FB UID, FB login failed");
			return;
		}

		Action<Hashtable> onLogin = delegate( Hashtable userData) {
			HandleLogin(userData);	
			LoginPanel loginPanel = (LoginPanel)GameObject.FindObjectOfType(typeof(LoginPanel));
			if (loginPanel != null) {
				Destroy(loginPanel.gameObject);
			}
		};
		
		Hashtable arguments = new Hashtable();
		arguments.Add("access_token",accessToken);
		arguments.Add("fb_uid",fbUid);
		arguments.Add("fb_pic_url",fbPicUrl);
		
		Hashtable options = new Hashtable();
		options.Add("cacheEnabled",false);
		options.Add("protocol","https");
		options.Add("method","post");
		options.Add("handler",onLogin);
		
		StartCoroutine(ApiManager.GetInstance().CallApi("fb/login", 
		arguments,
		options));
	}
	
	// example URL: verserain://com.hopeofglory.verserain/verse/53ebe35da2ff372bfb9b91f4/www.verserain.com
	public void HandleURL(string url) {
		verseId = null;
		versesetId = null;
		
		string[] parts = url.Split('/');
		string subject = parts[3];
		string idstr = parts[4];
		string apiDom = parts[5];
		string sessionKey = parts[6];
	
		if ((idstr == "None") || (idstr == "null")) {
			idstr = null;
		}	
		
		if (subject == "verse") {
			verseId = idstr;
		} else if (subject == "verseset") {
			versesetId = idstr;
		}
	
		apiDomain = apiDom;	
		UnityEngine.Debug.Log("api domain set to " + apiDom);
		
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
	
	public Action StartGame = delegate() {
		GameObject gmObject = GameObject.Find("GameManager");	
		
		if (gmObject != null) {
			GameManager gameManager = gmObject.GetComponent<GameManager>();
			gameManager.Cleanup();
		}
		
		VerseManager.loaded = false;
		Application.LoadLevel("scramble");
	};
	
	public void DoLogin(string sessionKey) {
		DoLogin(sessionKey, null);
	}
	
	public IEnumerator DoLogin(string sessionKey,Action afterLogin) {
		Action<Hashtable> onLogin = delegate( Hashtable userData) {
			HandleLogin(userData);
			if (afterLogin != null) {
				afterLogin();
			}
		};
		
		ApiManager apiManager = ApiManager.GetInstance();
		Hashtable arguments = new Hashtable();
		arguments.Add("session_key",sessionKey);
		Hashtable options = new Hashtable();
		options.Add("handler",onLogin);
		options.Add("errorHandler",null);
		options.Add("cacheEnabled",false);
		options.Add("protocol","https");
		options.Add("method","post");

		yield return new WaitForSeconds(0.5f);

		StartCoroutine(apiManager.CallApi("login/login",
			arguments, 
			options));
	}
	
	public void SetVerseId(string verseId_) {
		verseId = verseId_;
	}
	
	public void SetVerseSetId(string versesetId_) {
		versesetId = versesetId_;
	}
	
	public void SetApiDomain(string apiDomain_) {
		apiDomain = apiDomain_;
	}
	
	public string ApiDomain() {
		if (apiDomain != null) {
			return apiDomain;
		} else {
			return ApiManager.GetApiDomain();
		}
	}
	
	public void ClearUrlOptions() {
		verseId = null;
		versesetId = null;
	}
	
	public void HandleLogin(Hashtable userData) {
		isLoggedIn = (bool) userData["logged_in"];

		if (!isLoggedIn) {
			return;
		}
		
		userId = userData["_id"].ToString();
		sessionKey = userData["session_key"].ToString();
		username = userData["username"].ToString();
		email = userData["email"].ToString();
		if (userData.ContainsKey("total_score")) {
			totalScore = (int)userData["total_score"];
		} else {
			totalScore = 0;
		}
		if (userData.ContainsKey("fb_uid")) {
			fbUid = "" + userData["fb_uid"];
		}
		if (userData.ContainsKey("fb_pic_url")) {
			fbPicUrl = "" + userData["fb_pic_url"];
		}
		if (userData.ContainsKey("name")) {
			_name = "" + userData["name"];
		}
		isLoggedIn = true;
		
		string json = JSONUtils.HashtableToJSON(userData);
		PlayerPrefs.SetString("user_data", json);
		
		LoginButton loginButton = (LoginButton)GameObject.FindObjectOfType(typeof(LoginButton));
		if (loginButton != null) {
			loginButton.SyncLoginStatus();
		}

	}
	
	public void Save() {
		
		Hashtable userData = new Hashtable();
		userData.Add("email",email);
		userData.Add("username",username);
		userData.Add("_id",userId);
		userData.Add("session_key",sessionKey);
		userData.Add("total_score",totalScore);
		userData.Add("logged_in",isLoggedIn);
		userData.Add("fb_uid",fbUid);
		userData.Add("name",_name);
		userData.Add("fb_pic_url",fbPicUrl);
		string json = JSONUtils.HashtableToJSON(userData);
		PlayerPrefs.SetString("user_data", json);
	}
	
	public void LoadUserLogin() {
		if (!String.IsNullOrEmpty(sessionKey) && !String.IsNullOrEmpty(userId)) return;
		string json = PlayerPrefs.GetString("user_data");
		if (!String.IsNullOrEmpty(json)) {
			UnityEngine.Debug.Log("loaded user json = " + json);
			Hashtable userData = JSONUtils.ParseJSON(json);
			Debug.Log (userData);
			HandleLogin(userData);
			// refresh by logging in again
			sessionKey = (string)userData["session_key"];
			DoLogin("" + sessionKey);
		}
	}
	
	public static bool IsLoggedIn() {
		UserSession us = GetUserSession();
		//Debug.Log("user logged in: " + us.isLoggedIn);
		return (us.isLoggedIn);
	}
	
	public void Logout() {
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
	
	public void Start() {
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
		//HandleURL("verserain://com.hopeofglory.verserain/verseset/5458332e3f7ab05c7847c25b/www.verserain.com/bb70d2a9cd8ff9a226b74af7b61d231f151a7cb2-53e42f6da2ff374cfa320f32");
		//HandleURL("verserain://com.hopeofglory.verserain/verse/542afb763f7ab0224bd53e33/www.verserain.com/bb70d2a9cd8ff9a226b74af7b61d231f151a7cb2-53e42f6da2ff374cfa320f32");
	}
	
	public void Update() {
	
	}
}
