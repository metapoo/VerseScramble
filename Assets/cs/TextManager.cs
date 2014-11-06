using UnityEngine;
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;

//using System.IO;

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
[System.Serializable]
public class TextManager: MonoBehaviour {
 
    public static TextManager instance ;
    public static Hashtable textTable ;
 	public static string currentFilename = "";
 	public static bool loading = false;
 	
 	public static bool IsLoaded() {
 		return (textTable != null);
 	}
 	
    public static TextManager Instance()
    {
 
            if (instance == null) 
            {
            	GameObject notificationObject = GameObject.Find("TextManager");
            	
                // Because the TextManager is a component, we have to create a GameObject to attach it to.
                if (notificationObject == null) {
	                notificationObject = new GameObject("TextManager");
	                // Add the DynamicObjectManager component, and set it as the defaultCenter
    		      	instance = notificationObject.AddComponent<TextManager>();
 				}
            }
            return instance;
 
    }
 
    public static TextManager GetInstance()
    {
        return Instance();
    }   
 
 	public static bool LoadLanguageOffline(string language) {
 		string saveKey = String.Format("languages/{0}.txt",language);
 		string text = PlayerPrefs.GetString(saveKey, null);
 		
 		// try to load it immediately
 		if (text != null) {
 			Debug.Log("loading language from disk: " + saveKey);
 			return LoadLanguageText(text);
 		} else {
 			Debug.Log("loading language resource file: " + language);
 			return LoadLanguageFile(language);
 		}
 	}
 	
 	public IEnumerator LoadLanguage(string language,
                                    Action<string> finishHandler)
 	{
 		string saveKey = String.Format("languages/{0}.txt",language);
 		string apiDomain = ApiManager.GetApiDomain();
 		string url = String.Format("http://{0}/languages/{1}.txt", apiDomain, language);
  		
  		loading = true;
  	
  		Debug.Log("loading " + url);	
 		WWW www = new WWW(url);
 		yield return www;
 		
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
 	 	
    public static bool LoadLanguageFile(string filename)
    {
    	if (filename == currentFilename) return false;
    	
    	currentFilename = filename;
    	
        GetInstance();
 
        if (filename == null)
        {
            Debug.Log("[TextManager] loading default language.");
            textTable = null; // reset to default
            return false; // this means: call LoadLanguage with null to reset to default
        }
 
        string fullpath = "Languages/" +  filename ; // the file is actually ".txt" in the end
 
        TextAsset textAsset =  (TextAsset)Resources.Load(fullpath, typeof(TextAsset));
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
        bool success = LoadLanguageText(textAsset.text);
        Debug.Log("[TextManager] loaded: "+ fullpath);
		return success;
 	}
 
 	public static bool LoadLanguageText(string text) {
 	    if (textTable == null) 
        {
            textTable = new Hashtable();
        }
		textTable.Clear();
		
        StringReader reader  = new StringReader(text);
        string key = null;
        string val = null;
        string line = null;
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
 
 
    public static string GetText(string key)
    {
    	string originalKey = key;
    	
        if (key != null && textTable != null)
        {
        	key = key.ToLower();
        	
            if (textTable.ContainsKey(key))
            {
                string result = "" + textTable[key];
                if (result.Length > 0)
                {
                	return result;
                }
            }
        }
        return originalKey;
    }
    
    public void Awake() {
    	DontDestroyOnLoad(this.gameObject);
	}
}
