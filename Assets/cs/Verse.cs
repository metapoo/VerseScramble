using UnityEngine;
using System;
using System.Collections;

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

	public override int GetHashCode() {
		return SaveKey().GetHashCode();
	}

	public static bool operator == (Verse vs1, Verse vs2)
	{
		if (System.Object.ReferenceEquals(vs1, vs2)) {
			return true;
		}
		// If one is null, but not both, return false.
		if (((object)vs1 == null) || ((object)vs2 == null))
		{
			return false;
		}
		
		return vs1.SaveKey() == vs2.SaveKey();	
	}

	public override bool Equals(System.Object obj)
	{
		// If parameter is null return false.
		if (obj == null)
		{
			return false;
		}
		
		// If parameter cannot be cast to Verse return false.
		Verse vs = obj as Verse;
		if ((System.Object)vs == null)
		{
			return false;
		}
		
		// Return true if the fields match:
		return (this == vs);
	}

	public static bool operator != (Verse vs1, Verse vs2)
	{
		return !(vs1 == vs2);
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
	
	// This function will return a string with  x words (1 <= x < = n) from a specific verse.
	public string GetWords(int n) {
		string word_string = "";
		return word_string;
	}
}
