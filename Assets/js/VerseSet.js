public class VerseSet extends MonoBehaviour
{
	public var _onlineId : String;
	public var _name : String;
	public var _language : String;
	public var _verses : Array = new Array();
	public var _isOnline : boolean;
	public var _version : String;
	
	public function VerseSet(onlineId : String, name : String, language : String, version: String) {
		_onlineId = onlineId;
		_isOnline = true;	
		_name = name;
		_language = language;
		_version = version;
	}
	
	public function VerseSet(name : String) {
		_isOnline = false;
		_name = name;
	}
	
	public function AddVerse(verse : Verse) {
		_verses.push(verse);
	}
}