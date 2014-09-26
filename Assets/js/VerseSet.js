public class VerseSet extends MonoBehaviour
{
	public var onlineId : String;
	public var setname : String;
	public var language : String;
	public var verses : Array;
	public var isOnline : boolean;
	public var version : String;
	public var playCount : int;
	
	public function VerseSet(onlineId_ : String, setname_ : String, language_ : String, version_: String) {
		onlineId = onlineId_;
		isOnline = true;	
		setname = setname_;
		language = language_;
		version = version_;
		verses = new Array();
	}
	
	public function VerseSet(setname_ : String) {
		isOnline = false;
		setname = setname_;
		verses = new Array();
	}
	
	public function AddVerse(verse_ : Verse) {
		verses.push(verse_);
	}
	
	public function ToString() {
		return String.Format("verseset: {0}", setname);
	}
	
	public function SaveKey() {
		if (onlineId != null) {
			return onlineId;
		}
		return String.Format("{0}_{1}",setname,language);
	}
	
	public function GetMetadata() {
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
		for (var i=0;i<verses.length;i++) {
			Destroy(verses[i]);
		}
		verses.Clear();
	}
	
	public function LoadVersesData(versesData : Array) {
		UnloadVerses();
		
		for (var i=0;i<versesData.length;i++) {
			var verseData : Hashtable = versesData[i];
			var verseId_ = verseData["_id"];
			var reference = verseData["reference"];
			var text = verseData["text"];
			version = verseData["version"];
			var verse : Verse = new Verse(verseId_, reference, text, version, this);
			AddVerse(verse);
			
		}
	}
	
	public function IndexOfVerseId(verseId : String) {
		for (var i=0;i<verses.length;i++) {
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