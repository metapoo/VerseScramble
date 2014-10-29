import System.IO;//using System.IO;
import UnityEngine;
import System.Collections;
 
// originally found in: http://forum.unity3d.com/threads/35617-TextManager-Localization-Script
 
/// <summary>
/// TextManager
/// 
/// Reads PO files in the Assets\Resources\Languages directory into a Hashtable.
/// Look for "PO editors" as that's a standard for translating software.
/// 
/// Example:
/// 
/// load the language file:
///   TextManager.LoadLanguage("helptext-pt-br");
/// 
/// which has to contain at least two lines as such:
///   msgid "HELLO WORLD"
///   msgstr "OLA MUNDO"
/// 
/// then we can retrieve the text by calling:
///   TextManager.GetText("HELLO WORLD");
/// </summary>
class TextManager extends MonoBehaviour {
 
    static var instance:TextManager ;
    static var textTable:Hashtable ;
 	static var currentFilename : String = "";
 	static var loading : boolean = false;
 	
 	static function IsLoaded() {
 		return (textTable != null);
 	}
 	
    static function Instance() 
    {
 
            if (instance == null) 
            {
            	var notificationObject:GameObject = GameObject.Find("TextManager");
            	
                // Because the TextManager is a component, we have to create a GameObject to attach it to.
                if (notificationObject == null) {
	                notificationObject = new GameObject("TextManager");
	                // Add the DynamicObjectManager component, and set it as the defaultCenter
    		      	instance = notificationObject.AddComponent(typeof(TextManager));
 				}
            }
            return instance;
 
    }
 
    public static function GetInstance ()
    {
        return Instance();
    }   
 
 	static public function LoadLanguageOffline(language : String) : boolean {
 		var saveKey : String = String.Format("languages/{0}.txt",language);
 		var text : String = PlayerPrefs.GetString(saveKey, null);
 		
 		// try to load it immediately
 		if (text != null) {
 			Debug.Log("loading language from disk: " + saveKey);
 			return LoadLanguageText(text);
 		} else {
 			Debug.Log("loading language resource file: " + language);
 			return LoadLanguageFile(language);
 		}
 	}
 	
 	public function LoadLanguage(language : String, finishHandler : Function) : IEnumerator
 	{
 		var saveKey : String = String.Format("languages/{0}.txt",language);
 		var apiDomain : String = ApiManager.GetApiDomain();
 		var url = String.Format("http://{0}/languages/{1}.txt", apiDomain, language);
 		var text : String = PlayerPrefs.GetString(saveKey, null);
  		
  		loading = true;
  	
  		Debug.Log("loading " + url);	
 		var www : WWW = new WWW(url);
 		yield www;
 		
 		loading = false;
 		
 		if (www.error != null) {
 			Debug.Log("Couldn't load " + url);
 		} else {
	 		Debug.Log("Loaded online translation " + url);
	 		LoadLanguageText(www.text);
	 		PlayerPrefs.SetString(saveKey, www.text);
 		}	
 		
 		if (finishHandler != null) {
 			finishHandler(language);
 		}
 	}
 	 	
    public static function LoadLanguageFile (filename:String) : boolean
    {
    	if (filename == currentFilename) return;
    	
    	currentFilename = filename;
    	
        GetInstance();
 
        if (filename == null)
        {
            Debug.Log("[TextManager] loading default language.");
            textTable = null; // reset to default
            return false; // this means: call LoadLanguage with null to reset to default
        }
 
        var fullpath:String = "Languages/" +  filename ; // the file is actually ".txt" in the end
 
        var textAsset:TextAsset =  Resources.Load(fullpath, typeof(TextAsset));
        if (textAsset == null) 
        {
            Debug.Log("[TextManager] "+ fullpath +" file not found.");
            return false;
        }
 
        if (textTable == null) 
        {
            textTable = new Hashtable();
        }
 
        textTable.Clear();
        var success : boolean = LoadLanguageText(textAsset.text);
        Debug.Log("[TextManager] loaded: "+ fullpath);
		return success;
 	}
 
 	public static function LoadLanguageText(text : String) : boolean {
 	    if (textTable == null) 
        {
            textTable = new Hashtable();
        }
		textTable.Clear();
		
        var reader:StringReader  = new StringReader(text);
        var key:String = null;
        var val:String = null;
        var line:String;
        line = reader.ReadLine();
        while ( (line ) != null)
        { 
 
            if (line.StartsWith("msgid \""))
            {
                key = line.Substring(7, line.Length - 8).ToLower();
            }
            else if (line.StartsWith("msgstr \""))
            {
                val = line.Substring(8, line.Length - 9);
            }
 
            if (key != null && val != null) 
            {
					if (textTable.ContainsKey(key)) {
						Debug.Log("duplicate key: " + key);
					}
					textTable[key] = val;

                    key = val = null;
            } 
 
            line = reader.ReadLine();
        }
 
        reader.Close();

        return true;
    }
 
 
    public static function GetText (key:String)
    {
    	var originalKey:String = key;
    	
        if (key != null && textTable != null)
        {
        	key = key.ToLower();
        	
            if (textTable.ContainsKey(key))
            {
                var result:String = textTable[key];
                if (result.Length > 0)
                {
                	return result;
                }
            }
        }
        return originalKey;
    }
    
    function Awake() {
    	DontDestroyOnLoad(this.gameObject);
	}
}