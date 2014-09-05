public class Verse extends MonoBehaviour
{
	public var _onlineId : String;
	public var _reference : String;
	public var _text : String;
	public var _version : String;
	public var _isOnline : boolean;
	
	public function Verse(onlineId : String, reference : String, text : String, version: String) {
		_onlineId = onlineId;
		if (onlineId != null) {
			_isOnline = true;
		}
		_reference = reference;
		_text = text;
		_version = version;
	}
	
}