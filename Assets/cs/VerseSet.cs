using UnityEngine;
using System;
using System.Collections.Generic;
using System.Collections;

public class VerseSet
{
	public static Hashtable versesetBySaveKey = new Hashtable();
	public string onlineId;
	public string setname;
	public string language;
	public List<Verse> verses;
	public int verseCount;
	public bool isOnline;
	public string version;
	public int playCount;

	public override bool Equals(System.Object obj)
	{
		// If parameter is null return false.
		if (obj == null)
		{
			return false;
		}
		
		// If parameter cannot be cast to Verse return false.
		VerseSet vs = obj as VerseSet;
		if ((System.Object)vs == null)
		{
			return false;
		}
		
		// Return true if the fields match:
		return (this == vs);
	}

	public static bool operator == (VerseSet vs1, VerseSet vs2)
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
	
	public static bool operator != (VerseSet vs1, VerseSet vs2)
	{
		return !(vs1 == vs2);
	}

	public static VerseSet GetVerseSet(string saveKey) {
		if (versesetBySaveKey.Contains(saveKey)) {
			return (VerseSet)versesetBySaveKey[saveKey];
		}
		return null;
	}
	
		
	public static VerseSet GetVerseSet(string onlineId_,
                                       string setname_,
                                       string language_,
                                       string version_) {
		VerseSet verseset = GetVerseSet(onlineId_);
		if (verseset == null) {
			return new VerseSet(onlineId_, setname_, language_, version_);
		} else {
			verseset.setname = setname_;
			verseset.language = language_;
			verseset.version = version_;
			return verseset;
		}
	}
	
	public int GetVerseCount() {
		if (isOnline) return verseCount;
		return verses.Count;
	}

	
	public VerseSet(string onlineId_,string setname_,string language_,string version_) {
		onlineId = onlineId_;
		isOnline = true;	
		setname = setname_;
		language = language_;
		version = version_;
		verses = new List<Verse>();
		versesetBySaveKey[SaveKey()] = this;
	}
	
	public VerseSet(string setname_) {
		isOnline = false;
		setname = setname_;
		verses = new List<Verse>();
		versesetBySaveKey[SaveKey()] = this;
	}
	
	public void HandleRemoved() {
		versesetBySaveKey.Remove(SaveKey());
	}
	
	public void AddVerse(Verse verse_) {
		verses.Add(verse_);
	}
	
	public override string ToString() {
		return String.Format("verseset: {0}", setname);
	}

	public override int GetHashCode() {
		return SaveKey().GetHashCode();
	}

	public string SaveKey() {
		if (onlineId != null) {
			return onlineId;
		}
		return String.Format("{0}_{1}",setname,language);
	}
	
	public Hashtable GetMetadata() {
		string key = "vs_"+SaveKey();
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
	
	public void UnloadVerses() {
		verses.Clear();
	}
	
	public void LoadVersesData(List<object> versesData) {
		UnloadVerses();
		
		for(int i=0;i<versesData.Count;i++) {
			Hashtable verseData = (Hashtable)versesData[i];
			object verseId_ = verseData["_id"];
			object reference = verseData["reference"];
			object text = verseData["text"];
			version = "" + verseData["version"];
			Verse verse = new Verse("" + verseId_, "" + reference, "" + text, version, this);
			AddVerse(verse);	
		}
		verseCount = versesData.Count;
	}
	
	public int IndexOfVerseId(string verseId) {
		for(int i=0;i<verses.Count;i++) {
			Verse verse = verses[i];
			if (verse.SaveKey() == verseId) {
				return i;
			}
		}
		return -1;
	}
	
	public void SaveMetadata(Hashtable metadata) {
		string metadataJSON = JSONUtils.HashtableToJSON(metadata);
		PlayerPrefs.SetString("vs_"+SaveKey(), metadataJSON);
	}
    
    
}
