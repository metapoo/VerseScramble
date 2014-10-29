import System.IO;//using System.IO;
import UnityEngine;
import System.Collections;
import JSONUtils;

class ApiManager extends MonoBehaviour {
 
    static var instance:ApiManager;
 	static var apiDomain:String = null;
 	static var secretKey:String = "0>a-q,wYTmq%<,h$OXYg<js:h([TR/:4hSVh.vEJhq4RvWIx@_|^B|]z`b<d~kI@";
	
	public static function IsConnectedToInternet() : boolean {
		var isConnectedToInternet = false;
		var ipAddress : String = Network.player.ipAddress.ToString().Trim();

#if UNITY_IPHONE
    	if (iPhoneSettings.internetReachability != iPhoneNetworkReachability.NotReachable)
    	{
        	isConnectedToInternet = true;
    	} 
#endif
#if UNITY_ANDROID
    	if (iPhoneSettings.internetReachability != iPhoneNetworkReachability.NotReachable)
    	{
        	isConnectedToInternet = true;
    	}
#endif
    	if ((ipAddress == "127.0.0.1") || (ipAddress == "0.0.0.0"))
    	{
        	isConnectedToInternet = false;      
    	} else {
    		isConnectedToInternet = true;
    	}

		Debug.Log("Connected to the internet: " + isConnectedToInternet + " ip= " + ipAddress);
		return isConnectedToInternet;
	}
	
	static function Md5(strToEncrypt: String)
	{
		var encoding = System.Text.UTF8Encoding();
		var bytes = encoding.GetBytes(strToEncrypt);
 
		// encrypt bytes
		var md5 = System.Security.Cryptography.MD5CryptoServiceProvider();
		var hashBytes:byte[] = md5.ComputeHash(bytes);
 
		// Convert the encrypted bytes back to a string (base 16)
		var hashString = "";
 
		for (var i = 0; i < hashBytes.Length; i++)
		{
			hashString += System.Convert.ToString(hashBytes[i], 16).PadLeft(2, "0"[0]);
		}
 
		return hashString.PadLeft(32, "0"[0]);
	}
	
    static function Instance() 
    {
            if (instance == null) 
            {
            	var notificationObject:GameObject = GameObject.Find("ApiManager");
            	
                // Because the TextManager is a component, we have to create a GameObject to attach it to.
                if (notificationObject == null) {
	                notificationObject = new GameObject("ApiManager");
	                // Add the DynamicObjectManager component, and set it as the defaultCenter
    		      	instance = notificationObject.AddComponent(typeof(ApiManager));
 				}
            }
            return instance;
    }

    public static function GetInstance()
    {
        return Instance();
    }

	public function CallApi(apiName : String, arguments : Hashtable) {
		CallApi(apiName, arguments, new Hashtable({}));
	}
	
	public function SerializeArguments(arguments : Hashtable) {
		SetFullArguments(arguments);

    	var serializedArguments : String = "";
    	var i = 0;
    	
    	for (var key:String in arguments.Keys) {
    		i += 1;
    		var val = arguments[key];
    		if (val == null) {
    			Debug.Log("key: " + key + " value is null!");
    		}
    		serializedArguments += (key+"="+WWW.EscapeURL(val.ToString()));
    		if (i < arguments.Count) {
    			serializedArguments += "&";
    		}
    	}
		return serializedArguments;
	}
	
	public function SetFullArguments(arguments : Hashtable) {
		if (UserSession.IsLoggedIn()) {
			var sessionKey : String = UserSession.GetUserSession().sessionKey;
			if (sessionKey != null) {
				arguments["session_key"] = sessionKey;
			}
		}

	}
	
	public function GetWWWForm(arguments : Hashtable) {
		SetFullArguments(arguments);
		var form : WWWForm = new WWWForm();
		
		for (var key:String in arguments.Keys) {
    		var val : String = arguments[key];
    		if (val == null) {
    			Debug.Log("key: " + key + " value is null!");
    		}
    		form.AddField(key, val);
    	}
    	return form;
	}
	
    public function SetApiCache(url : String, resultData : Hashtable) {
    	var json : String = HashtableToJSON(resultData);
    	PlayerPrefs.SetString(url, json);
    }

    public function GetApiCache(url : String) {
    	var json : String = PlayerPrefs.GetString(url);
    	if (json == null) return null;
    	var resultData : Hashtable = ParseJSON(json);
    	return resultData;
    }
    
    public function UrlForApi(apiName : String, arguments : String, options : Hashtable) {
    	var protocol : String = "http";
    	if (options.ContainsKey("protocol")) {
    		protocol = options["protocol"];
    	}
    	var url : String = String.Format("{0}://{1}/api/{2}?{3}",protocol,GetApiDomain(),apiName,arguments);
    	return url;
    }
    
    public function GetApiCache(apiName: String, arguments : Hashtable, options : Hashtable) : void {
    	var serializedArguments : String = SerializeArguments(arguments);
    	var url : String = UrlForApi(apiName, serializedArguments, options);
    	var resultData : Hashtable = GetApiCache(url);
    	var handler : Function = options["handler"];
    	if (resultData != null) {
    		handler(resultData);
    	}
    }
    
    public function CallApi(apiName : String, arguments : Hashtable, options : Hashtable) : IEnumerator {
    	var serializedArguments : String = SerializeArguments(arguments);
    	var url : String;
    	var method : String = "get";
    	var resultData : Hashtable;
    	
    	if (options.ContainsKey("method")) {
    		method = options["method"];
    	}
    	method = method.ToLower();
    	
    	var form : WWWForm = new WWWForm();
		
    	if (method == "get") {
			url = UrlForApi(apiName, serializedArguments, options);
		} else if (method == "post") {
			url = UrlForApi(apiName, "", options);
			form = GetWWWForm(arguments);
		}
		
		Debug.Log("api call: " + url);
		var www : WWW = new WWW(url, form);
		yield www;
		var cacheEnabled = true;
		
		if (options.ContainsKey("cacheEnabled")) {
			cacheEnabled = options["cacheEnabled"];
		}
		
		var handler : Function = function() {};
		if (options.ContainsKey("handler")) {
			handler = options["handler"];
		}
		
		var errorHandler : Function = function() {
			var gt : Function = TextManager.GetText;
			DialogManager.CreatePopupDialog(gt("Error"),gt("Sorry we encountered a network error. Is your network connection enabled?") + "\nAPI: " + apiName);
		};
		
		if (options.ContainsKey("errorHandler")) {
			errorHandler = options["errorHandler"];
		}
		

		if (www.error != null) {
			Debug.Log("www.error = " + www.error);
			var handlerCalled : boolean = false;
			
			try {
				if (cacheEnabled) {
					Debug.Log("Got error, trying cache..");
					resultData = GetApiCache(url);
				}
			} catch (err) {
				Debug.Log("Cache miss");
			}
			
			if (resultData != null) {
				if (handler != null) {
					Debug.Log("Cache hit, calling handler");
					handler(resultData);
					handlerCalled = true;
				}
			} else if (cacheEnabled) {
				Debug.Log("Cache result was null, calling error handler");
				
			}
			
			if (!handlerCalled && (errorHandler != null)) {
				errorHandler();
			}
			
			return;
		}
		
		var data = www.text;
		var apiData : Hashtable = JSONUtils.ParseJSON(data);
		var status = apiData["status"];
		if (status == "OK") {
			resultData = apiData["result"];
			SetApiCache(url, resultData);
			if (handler != null) {
				handler(resultData);
			}
		} else {
			Debug.Log("API error: " + url);
			if (errorHandler != null) {
				errorHandler();
			}
		}
	
    }
    
    public static function GetApiDomain() : String {
    	
		var us : UserSession = UserSession.GetUserSession();
		if (us && (us.apiDomain)) {
			apiDomain = us.apiDomain;
			return apiDomain;
		} else {
			apiDomain = "www.verserain.com";
			return apiDomain;
		}
	}
}

// Use this for initialization
function Start () {
}

// Update is called once per frame
function Update () {
}

