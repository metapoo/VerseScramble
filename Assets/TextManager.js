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
 
    static function Instance() 
    {
 
            if (instance == null) 
            {
                // Because the TextManager is a component, we have to create a GameObject to attach it to.
                var notificationObject:GameObject  = new GameObject("Default TextManager");
 
                // Add the DynamicObjectManager component, and set it as the defaultCenter
          	instance = notificationObject.AddComponent(typeof(TextManager));
            }
            return instance;
 
    }
 
    public static function GetInstance ()
    {
        return Instance();
    }   
 
    public static function LoadLanguage (filename:String)
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
 
        Debug.Log("[TextManager] loading: "+ fullpath);
 
        if (textTable == null) 
        {
            textTable = new Hashtable();
        }
 
        textTable.Clear();
 
        var reader:StringReader  = new StringReader(textAsset.text);
        var key:String = null;
        var val:String = null;
        var line:String;
        line = reader.ReadLine();
        while ( (line ) != null)
        { 
 
            if (line.StartsWith("msgid \""))
            {
                key = line.Substring(7, line.Length - 8);
            }
            else if (line.StartsWith("msgstr \""))
            {
                val = line.Substring(8, line.Length - 9);
            }
 
            if (key != null && val != null) 
            {
                    // TODO: add error handling here in case of duplicate keys
                    textTable.Add(key, val);
 
                    key = val = null;
            } 
 
            line = reader.ReadLine();
        }
 
        reader.Close();
 
        return true;
    }
 
 
    public static function GetText (key:String)
    {
        if (key != null && textTable != null)
        {
            if (textTable.ContainsKey(key))
            {
                var result:String = textTable[key];
                if (result.Length > 0)
                {
                    key = result;
                }
            }
        }
        return key;
    }
}