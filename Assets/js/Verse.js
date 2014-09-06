public class Verse extends MonoBehaviour
{
	public var onlineId : String;
	public var reference : String;
	public var text : String;
	public var version : String;
	public var isOnline : boolean;
	public var verseset : VerseSet;
	
	public function Verse(onlineId_ : String, reference_ : String, text_ : String, version_: String, verseset_ : VerseSet) {
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
	
	public function ToString() {
		return String.Format("{0} - {1}", reference, text);
	}
	
	public function Verse(reference_ : String, text_ : String, verseset_ : VerseSet) {
		isOnline = false;
		reference = reference_;
		text = text_;
		verseset = verseset_;
	}
	
	public function SaveKey() {
		if (isOnline) {
			return onlineId;
		} else {
			return String.Format("{0}_{1}", reference, verseset.language);
		}
	}
	
	public function SaveMetadata(metadata : Hashtable) {
		var metadataJSON : String = JSONUtils.HashtableToJSON(metadata);
		PlayerPrefs.SetString("vs_"+SaveKey(), metadataJSON);
	}

	public function GetMetadata() {
		var key = "vm_"+SaveKey();
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
}