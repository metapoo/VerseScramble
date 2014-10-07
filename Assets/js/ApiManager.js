import System.IO;//using System.IO;
import UnityEngine;
import System.Collections;
import JSONUtils;

class ApiManager extends MonoBehaviour {
 
    static var instance:ApiManager;
 	static var apiDomain:String = null;
 	
    static function Instance() 
    {
            if (instance == null) 
            {
            	var notificationObject:GameObject = GameObject.Find("Default ApiManager");
            	
                // Because the TextManager is a component, we have to create a GameObject to attach it to.
                if (notificationObject == null) {
	                notificationObject = new GameObject("Default ApiManager");
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
		var handler : Function = function() {};
		CallApi(apiName, arguments, handler);
	}

	public function CallApi(apiName : String, arguments : Hashtable, handler : Function) {
		var errorHandler : Function = function() {
			var gt : Function = TextManager.GetText;
			DialogManager.CreatePopupDialog(gt("Error"),gt("Sorry we encountered a network error."));
		};
		CallApi(apiName, arguments, handler, errorHandler);
	}	
	
    public function CallApi(apiName : String, arguments : Hashtable, handler : Function, errorHandler : Function) {
		if (UserSession.IsLoggedIn()) {
			var sessionKey : String = UserSession.GetUserSession().sessionKey;
			if (sessionKey != null) {
				arguments["session_key"] = sessionKey;
			}
		}
    	var serializedArguments : String = "";
    	var i = 0;
    	
    	for (var key:String in arguments.Keys) {
    		i += 1;
    		var val = arguments[key];
    		serializedArguments += (key+"="+val);
    		if (i < arguments.Count) {
    			serializedArguments += "&";
    		}
    	}

		CallApi(apiName, serializedArguments, handler, errorHandler);
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
    
    public function CallApi(apiName : String, arguments : String, handler : Function, errorHandler : Function) {
    	var url : String = "http://"+GetApiDomain()+"/api/"+apiName+"?"+arguments;
		Debug.Log("API request " + url);
		
		var www : WWW = new WWW(url);
		yield www;	
		var resultData : Hashtable = null;

		if (www.error != null) {
				
			try {
				resultData = GetApiCache(url);
			} catch (err) {
				
			}
			
			if (resultData != null) {
				handler(resultData);
			} else {
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
			errorHandler();
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

