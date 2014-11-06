using UnityEngine;
using System;
using System.Collections;

[System.Serializable]
public class Verse
{
	public string onlineId;
	public string reference;
	public string text;
	public string version;
	public bool isOnline;
	public VerseSet verseset;
	
	public Verse(string onlineId_,
                 string reference_,
                 string text_,
                 string version_,
                 VerseSet verseset_) {
		onlineId = onlineId_;
		if (onlineId != null) {
			isOnline = true;
		} else {
			isOnline = false;
		}
		reference = reference_;
		text = text_;
		version = version_;
		verseset = verseset_;
	}
	
	public override string ToString() {
		return String.Format("{0} - {1}", reference, text);
	}
	
	public Verse(string reference_,string text_,VerseSet verseset_) {
		isOnline = false;
		reference = reference_;
		text = text_;
		verseset = verseset_;
	}
	
	public string SaveKey() {
		if (isOnline) {
			return onlineId;
		} else {
			return String.Format("{0}_{1}", reference, verseset.language);
		}
	}
	
	public void SaveMetadata(Hashtable metadata) {
		string metadataJSON = JSONUtils.HashtableToJSON(metadata);
		PlayerPrefs.SetString("vm_"+SaveKey(), metadataJSON);
	}

	public Hashtable GetMetadata() {
		string key = "vm_"+SaveKey();
		string metadataJSON = null;
	
		if (PlayerPrefs.HasKey(key)) {
			metadataJSON = PlayerPrefs.GetString(key);
		}
	
	
		if (metadataJSON != null) {
			Hashtable h = JSONUtils.ParseJSON(metadataJSON);
			return h;		
		}
	
		Hashtable metadata = new Hashtable();
		metadata["high_score"] = 0;
		metadata["difficulty"] =(int)Difficulty.Easy;
		return metadata;
	}
}
