#pragma strict
import System.Collections.Generic;

public class VerseSet
{
	static var versesetBySaveKey : Hashtable = new Hashtable();
	public var onlineId : String;
	public var setname : String;
	public var language : String;
	public var verses : List.<Verse>;
	public var verseCount : int;
	public var isOnline : boolean;
	public var version : String;
	public var playCount : int;
	
	public static function GetVerseSet(saveKey : String) : VerseSet {
		if (versesetBySaveKey.Contains(saveKey)) {
			return versesetBySaveKey[saveKey];
		}
		return null;
	}
	
		
	public static function GetVerseSet(onlineId_ : String, setname_ : String, language_ : String, version_: String) : VerseSet {
		var verseset : VerseSet = GetVerseSet(onlineId_);
		if (Object.ReferenceEquals(verseset, null)) {
			return VerseSet(onlineId_, setname_, language_, version_);
		} else {
			verseset.setname = setname_;
			verseset.language = language_;
			verseset.version = version_;
			return verseset;
		}
	}
	
	public function GetVerseCount() : int {
		if (isOnline) return verseCount;
		return verses.Count;
	}

	
	public function VerseSet(onlineId_ : String, setname_ : String, language_ : String, version_: String) {
		onlineId = onlineId_;
		isOnline = true;	
		setname = setname_;
		language = language_;
		version = version_;
		verses = new List.<Verse>();
		versesetBySaveKey[SaveKey()] = this;
	}
	
	public function VerseSet(setname_ : String) {
		isOnline = false;
		setname = setname_;
		verses = new List.<Verse>();
		versesetBySaveKey[SaveKey()] = this;
	}
	
	public function HandleRemoved() {
		versesetBySaveKey.Remove(SaveKey());
	}
	
	public function AddVerse(verse_ : Verse) {
		verses.Add(verse_);
	}
	
	override public function ToString() : String {
		return String.Format("verseset: {0}", setname);
	}
	
	public function SaveKey() : String {
		if (onlineId != null) {
			return onlineId;
		}
		return String.Format("{0}_{1}",setname,language);
	}
	
	public function GetMetadata() : Hashtable {
		var key = "vs_"+SaveKey();
		var metadataJSON : String = null;
	
		if (PlayerPrefs.HasKey(key)) {
			metadataJSON = PlayerPrefs.GetString(key);
		}
	
		if (metadataJSON != null) {
			var h : Hashtable = JSONUtils.ParseJSON(metadataJSON);
			return h;		
		}
	
		var metadata : Hashtable = new Hashtable();
		metadata["high_score"] = 0;
		metadata["difficulty"] = parseInt(Difficulty.Easy);
		return metadata;
	}
	
	public function UnloadVerses() {
		verses.Clear();
	}
	
	public function LoadVersesData(versesData : List.<Object>) {
		UnloadVerses();
		
		for (var i=0;i<versesData.Count;i++) {
			var verseData : Hashtable = versesData[i];
			var verseId_ = verseData["_id"];
			var reference = verseData["reference"];
			var text = verseData["text"];
			version = verseData["version"];
			var verse : Verse = Verse(verseId_, reference, text, version, this);
			AddVerse(verse);	
		}
		verseCount = versesData.Count;
	}
	
	public function IndexOfVerseId(verseId : String) : int {
		for (var i=0;i<verses.Count;i++) {
			var verse : Verse = verses[i];
			if (verse.SaveKey() == verseId) {
				return i;
			}
		}
		return -1;
	}
	
	public function SaveMetadata(metadata : Hashtable) {
		var metadataJSON : String = JSONUtils.HashtableToJSON(metadata);
		PlayerPrefs.SetString("vs_"+SaveKey(), metadataJSON);
	}
    
    
}