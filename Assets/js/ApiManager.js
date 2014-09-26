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

    public function CallApi(apiName : String, arguments : Hashtable, handler : Function) {

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

		CallApi(apiName, serializedArguments, handler);
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
    
    public function CallApi(apiName : String, arguments : String, handler : Function) {
    	var url : String = "http://"+GetApiDomain()+"/api/"+apiName+"?"+arguments;
		Debug.Log("API request " + url);
		
		var www : WWW = new WWW(url);
		yield www;	
		var resultData : Hashtable;
		
		if (www.error != null) {
			Debug.Log(www.error);
			// todo handle error
			resultData = GetApiCache(url);
			if (resultData != null) {
				handler(resultData);
			}
			return;
		}
		
		var data = www.text;
		var apiData : Hashtable = JSONUtils.ParseJSON(data);
		var status = apiData["status"];
		if (status == "OK") {
			resultData = apiData["result"];
			SetApiCache(url, resultData);
			handler(resultData);
		} else {
			Debug.Log("API error: " + url);
			// TODO: handle error
		}
    }
    
    public static function GetApiDomain() {
    	if (apiDomain != null) return apiDomain;
    	
		var us : UserSession = UserSession.GetUserSession();
		if (us) {
			apiDomain = us.ApiDomain();
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

