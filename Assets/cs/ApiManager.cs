using UnityEngine;
using System;
using System.IO;
using System.Collections;
using System.Security.Cryptography;
using System.Text;
using System.Globalization;
using System.Collections.Generic;

//using System.IO;
	
public class ApiManager: MonoBehaviour {
 
    public static ApiManager instance;
 	public static string apiDomain = null;
 	public static string secretKey = "0>a-q,wYTmq%<,h$OXYg<js:h([TR/:4hSVh.vEJhq4RvWIx@_|^B|]z`b<d~kI@";
	
	public static string GetUrl(string path) {
		string sessionKeyString = "";
		if (UserSession.IsLoggedIn()) {
			UserSession us = UserSession.GetUserSession();
			if (!String.IsNullOrEmpty(us.sessionKey)) {
				if (Application.isWebPlayer) {
					sessionKeyString = "";
				} else {
					sessionKeyString = String.Format("?s={0}", us.sessionKey);
				}
			}
		}
		string url = String.Format("http://{0}{1}{2}", apiDomain, path, sessionKeyString);
		return url;
	}
	
	public static bool IsConnectedToInternet() {
		bool isConnectedToInternet = false;
		string ipAddress = Network.player.ipAddress.ToString().Trim();

		ConnectionTesterStatus result = Network.TestConnection();

		if (result == ConnectionTesterStatus.PublicIPIsConnectable) {
			isConnectedToInternet = true;
		} else if ((ipAddress == "127.0.0.1") || (ipAddress == "0.0.0.0"))
    	{
        	isConnectedToInternet = false;      
    	} else {
			isConnectedToInternet = true;
    	}

		UnityEngine.Debug.Log("Connected to the internet: " + isConnectedToInternet + " ip= " + ipAddress);
		return isConnectedToInternet;
	}
	
	public static string Md5(string strToEncrypt)
	{
		UTF8Encoding encoding = new UTF8Encoding();
		byte[] bytes = encoding.GetBytes(strToEncrypt);
 
		// encrypt bytes
		MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider();
		byte[] hashBytes = md5.ComputeHash(bytes);
 
		// Convert the encrypted bytes back to a string (base 16)
		string hashString = "";
 
		for(int i = 0; i < hashBytes.Length; i++)
		{
			hashString += System.Convert.ToString(hashBytes[i], 16).PadLeft(2, '0');
		}
 
		return hashString.PadLeft(32, '0');
	}
	
    public static ApiManager Instance()
    {
            if (instance == null) 
            {
            	GameObject notificationObject = GameObject.Find("ApiManager");
            	
                // Because the TextManager is a component, we have to create a GameObject to attach it to.
                if (notificationObject == null) {
	                notificationObject = new GameObject("ApiManager");
	                // Add the DynamicObjectManager component, and set it as the defaultCenter
    		      	instance = notificationObject.AddComponent<ApiManager>();
 				}
            }
            return instance;
    }

    public static ApiManager GetInstance()
    {
        return Instance();
    }

	public void CallApi(string apiName,Hashtable arguments) {
		StartCoroutine(CallApi(apiName, arguments, new Hashtable()));
	}
	
	public string SerializeArguments(Hashtable arguments) {
		SetFullArguments(arguments);

    	string serializedArguments = "";
    	int i = 0;
    	
    	foreach(string key in arguments.Keys) {
    		i += 1;
    		object val = arguments[key];
    		if (val == null) {
    			UnityEngine.Debug.Log("key: " + key + " value is null!");
    			continue;
    		}
    		serializedArguments += (key+"="+WWW.EscapeURL(val.ToString()));
    		if (i < arguments.Count) {
    			serializedArguments += "&";
    		}
    	}
		return serializedArguments;
	}
	
	public void SetFullArguments(Hashtable arguments) {
		if (UserSession.IsLoggedIn()) {
			string sessionKey = UserSession.GetUserSession().sessionKey;
			if (arguments.ContainsKey("session_key") ||
			    arguments.ContainsKey("s")) {
				// don't set session key if api is already doing it
				return;
			}
			if ((sessionKey != null) && (sessionKey.Length > 0)) {
				arguments["s"] = sessionKey;
			}
		}

	}
	
	public WWWForm GetWWWForm(Hashtable arguments) {
		SetFullArguments(arguments);
		WWWForm form = new WWWForm();
		
		foreach(string key in arguments.Keys) {
    		string val = "" + arguments[key];
    		if (val == null) {
    			UnityEngine.Debug.Log("key: " + key + " value is null!");
    			continue;
    		}
    		form.AddField(key, val);
    	}
    	return form;
	}
	
    public void SetApiCache(string url,Hashtable resultData) {
		if (Application.isWebPlayer) return;

    	string json = JSONUtils.HashtableToJSON(resultData);
		try {
			PlayerPrefs.SetString(url, json);
		} catch (System.Exception err) {
			Debug.Log (err);
		}
		/*
		string hash = Md5 (url);
		string realPath = String.Format ("{0}/Web/{1}.txt", Application.persistentDataPath, hash);
		string dirPath = String.Format ("{0}/Web/", Application.persistentDataPath);
		
		if (!System.IO.File.Exists(realPath))
		{
			if (!System.IO.Directory.Exists(dirPath))
			{
				System.IO.Directory.CreateDirectory(dirPath);
			}
		}

		try {
			System.IO.File.WriteAllText(realPath, json);
		} catch (System.Exception err) {
			Debug.Log(err);
			return;
		}
		Debug.Log ("saved api cache for url: " + url + " file: " + realPath);
		*/
    }

    public Hashtable GetApiCache(string url) {
		/*
		string hash = Md5 (url);
		string realPath = String.Format ("{0}/Web/{1}.txt", Application.persistentDataPath, hash);
		string json = null;
		try {
			json = System.IO.File.ReadAllText(realPath);
		} catch (System.Exception err) {
			Debug.Log (err);
			return null;
		}
		Debug.Log ("api cache hit for url: " + url);
		*/

		if (Application.isWebPlayer) return null;

		string json = null;
		try {
			json = PlayerPrefs.GetString(url);
		} catch (System.Exception err) {
			Debug.Log (err);
			return null;
		}
		Hashtable resultData = JSONUtils.ParseJSON(json);
	    return resultData;
    }
    
    public string UrlForApi(string apiName,string arguments,Hashtable options) {
    	string protocol = "http";
    	if (options.ContainsKey("protocol")) {
    		protocol = "" + options["protocol"];
    	}
    	string url = String.Format("{0}://{1}/api/{2}?{3}",protocol,GetApiDomain(),apiName,arguments);
    	return url;
    }
    
    public void GetApiCache(string apiName,Hashtable arguments,Hashtable options) {
    	string serializedArguments = SerializeArguments(arguments);
    	string url = UrlForApi(apiName, serializedArguments, options);
    	Hashtable resultData = null;
    	try {
	    	resultData = GetApiCache(url);
	    } catch (System.Exception err) {
			Debug.Log (err.ToString());
	    	return;
	    }
    	Action<Hashtable> handler = delegate( Hashtable r) {};
    	
    	if (options.ContainsKey("handler")) {
	    	handler = (Action<Hashtable>) options["handler"];
	    }
	    
    	if (resultData != null) {
    		handler(resultData);
    	}
    }
    
    
	public void ShowErrorPopup() {
		DialogManager.CreatePopupDialog(TextManager.GetText("Error"),
		TextManager.GetText("Sorry we encountered a network error. Is your network connection enabled?"));
	}
		
    public IEnumerator CallApi(string apiName,Hashtable arguments,Hashtable options) {
    	string serializedArguments = SerializeArguments(arguments);
    	string url = null;
    	string method = "get";
    	Hashtable resultData = null;
    	if (options.ContainsKey("method")) {
    		method = "" + options["method"];
    	}
    	method = method.ToLower();
    	
    	WWWForm form = new WWWForm();
		
    	WWW www = null;
		if (method == "post") {
			url = UrlForApi(apiName, "", options);
			form = GetWWWForm(arguments);
			www = new WWW(url, form);
		} else  {
			url = UrlForApi(apiName, serializedArguments, options);
			www = new WWW(url);
		} 
		UnityEngine.Debug.Log("API CALL: " + url);
		yield return www;
		bool cacheEnabled = true;
		
		if (options.ContainsKey("cacheEnabled")) {
			cacheEnabled = options["cacheEnabled"] != null;
		}
		
		Action<Hashtable> handler = delegate( Hashtable r) {};
		
		if (options.ContainsKey("handler")) {
			handler = (Action<Hashtable>) options["handler"];
		}
		
		Action errorHandler = delegate() {
			ShowErrorPopup();
		};
		
		if (options.ContainsKey("errorHandler")) {
			errorHandler = (Action)options["errorHandler"];
		}
		

		if (www.error != null) {
			UnityEngine.Debug.Log("www.error = " + www.error);
			bool handlerCalled = false;
			
			try {
				if (cacheEnabled) {
					UnityEngine.Debug.Log("Got error, trying cache..");
					resultData = GetApiCache(url);
				}
			} catch (System.Exception err) {
				UnityEngine.Debug.Log("Cache miss: " + err.ToString());
			}
			
			if (resultData != null) {
				if (handler != null) {
					UnityEngine.Debug.Log("Cache hit, calling handler");
					handler(resultData);
					handlerCalled = true;
				}
			} else if (cacheEnabled) {
				UnityEngine.Debug.Log("Cache result was null, calling error handler");
				
			}
			
			if (!handlerCalled && (errorHandler != null)) {
				errorHandler();
			}
			
			return false;
		}
		
		string data = www.text;
		//Debug.Log ("www.text = " + data);
		Hashtable apiData = null;
		try {
			apiData = JSONUtils.ParseJSON(data);
		} catch (System.Exception err) {
			Debug.Log ("parse error: " + err.ToString());
			errorHandler();
			return false;
		}
		resultData = (Hashtable)apiData["result"];

		//Debug.Log ("result = " + JSONUtils.HashtableToJSON(resultData));
		//Debug.Log ("apiData = " + JSONUtils.HashtableToJSON(apiData));

		string status = (string) apiData["status"];
		if (status == "OK") {
			resultData = (Hashtable)apiData["result"];
			SetApiCache(url, resultData);
			if (handler != null) {
				handler(resultData);
			}
		} else {
			UnityEngine.Debug.Log("API error: " + url);
			if (errorHandler != null) {
				errorHandler();
			}
		}
	
	}
    
    public static string GetApiDomain() {
    	
		UserSession us = UserSession.GetUserSession();
		if ((us != null) && (us.apiDomain != "") && (us.apiDomain != null)) {
			apiDomain = us.apiDomain;
			return apiDomain;
		} else {
			apiDomain = "www.verserain.com";
			return apiDomain;
		}
	}

	// Use this for initialization
	public void Start() {
	}
		
	// Update is called once per frame
	public void Update() {

	}
}


