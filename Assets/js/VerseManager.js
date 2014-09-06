#pragma strict

import JSONUtils;

var verseIndex = 0;
var verseText : TextAsset;
var verseTextEN : TextAsset;
var verseTextZH : TextAsset;
var verseTextHE : TextAsset;
var versesetLanguage : String;
var numVerses = 0;
var apiDomain = "dev.verserain.com";
var totalScore : int = -1;
var currentVerseSet : VerseSet = null;

static var rightToLeft : boolean = false;
static var versesets : Array = new Array();
static var loaded : boolean = false;
static var offlineVersesLoaded : boolean = false;

private static var RTL_LANGUAGE_CODES : Array = new Array('ar','arc','bcc','bqi','ckb','dv','fa','glk','he','ku','mzn','pnb','ps','sd','ug','ur','yi');

function GetCurrentVerseSet() : VerseSet {

	if (currentVerseSet != null) return currentVerseSet;

	if (versesets.length == 0) return null;
	var verseset : VerseSet = versesets[0];
	
	var versesetSaveKey = PlayerPrefs.GetString(String.Format("current_verseset_{0}",GetLanguage()), verseset.SaveKey());
	
	for (var vs : VerseSet in versesets) {
		if (vs.SaveKey() == versesetSaveKey) return vs;
	}

	currentVerseSet = versesets[0];
	return currentVerseSet;
}

function SetCurrentVerseSet(verseset : VerseSet) {
	currentVerseSet = verseset;
	PlayerPrefs.SetString(String.Format("current_verseset_{0}",GetLanguage()), verseset.SaveKey());
}

function GetCurrentVerses() : Array {
	var vs : VerseSet = GetCurrentVerseSet();
	if (Object.ReferenceEquals(vs, null)) {
		return new Array();
	}
	return vs.verses;
}

function GetCurrentVerse() : Verse {
	var verses = GetCurrentVerses();
	
	if (verseIndex >= verses.length) {
		verseIndex = 0;
	}

	return verses[verseIndex];
}

function GetCurrentReference() : String {
	var verse : Verse = GetCurrentVerse();
	if (verse != null) {
		return verse.reference;
	}
	return null;
}

function SayVerseReference() {
	var verse : Verse = GetCurrentVerse();
	var reference : String = verse.reference;
	var refParts = reference.Split(":"[0]);
	
	var language = GetVerseLanguage();
	language = GetVoiceLanguage(language);
	
	if (IsLanguageChinese(language)) {
		if (refParts.Length < 2) {
			refParts = reference.Split("："[0]);
		}
		if (refParts.length == 2) {
			refParts[0] += "章";
			refParts[1] += "節";
		}
	}
		
	for (var refPart in refParts) {
		SpeakUtterance(refPart, language);
		yield WaitForSeconds(1);
	}
}

static function SpeakUtterance(word : String) {
	var language = GetLanguage();
	SpeakUtterance(word, language);
}

static function SpeakUtterance(word : String, language: String) {
	VoiceSynth.SpeakUtterance(word,language);
	Debug.Log(String.Format("Speak utterance: {0} in language {1}", word, language));
}

static function GetVoiceLanguage() {
	var language = GetLanguage();
	return GetVoiceLanguage(language);
}

static function GetVoiceLanguage(language : String) {
	if (language == "en") {
		return "en-US";
	} else if ((language == "zh") || (language == "zh-hant")) {
		return "zh-TW";
	} else if (language == "zh-hans") {
		return "zh-CN";
	} else if (language == "he") {
		return "he-IL";
	} else if (language == "ur") {
		return "ur-PK";
	} else if (language == "ja") {
		return "ja-JP";
	} else if (language == "ko") {
		return "ko-KR";
	} else if (language == "th") {
		return "th-TH";
	} else if (language == "vi") {
		return "vi-VN";
	} else if (language == "mn") {
		return "mn-MN";
	} else {
		return "en-US";
	}
}

static function IsLanguageChinese(language : String) : boolean {
	return (language == 'zh') || (language == 'zh-hans') || (language == 'zh-hant') || (language == 'zh-CN') || (language == 'zh-TW');
}

static function SetVerseLanguage(language : String) {
	PlayerPrefs.SetString("verse_language", language);
	CheckRightToLeft(language);
}

static function GetVerseLanguage() : String{
	var l : String = PlayerPrefs.GetString("verse_language", "en");
	if (l) return l;
	return GetLanguage();
}


static function GetLanguage() : String {
	return PlayerPrefs.GetString("language", "en");
}

static function SetLanguage(language : String) : String {
	PlayerPrefs.SetString("language", language);
}

function IsAtFinalVerseOfChallenge() {
	var verses = GetCurrentVerses();
	return (GetChallengeModeEnabled()) && (verseIndex >= (verses.length-1));
}

function GotoNextVerse() {
	var difficulty : Difficulty = GetCurrentDifficulty();
	var masteredPct = GetMasteredVersesPercentage();
	var verses = GetCurrentVerses();
	verseIndex = verseIndex + 1;

	if (verseIndex >= verses.length) {
		verseIndex = 0;
	}	
	Debug.Log("going to verse " + verseIndex);
	Save();
}

function Save() {
	var language = GetLanguage();
	PlayerPrefs.SetInt("verseIndex_"+language, verseIndex);
}

function MasteredVersesKey(difficulty : Difficulty) {
	var diffkey = "easy";
	switch(difficulty) {
		case Difficulty.Easy:
			diffkey = "easy";
			break;
		case Difficulty.Medium:
			diffkey = "medium";
			break;
		case difficulty.Hard:
			diffkey = "hard";
			break;
	}
	var key = diffkey + "_verses_mastered_"+GetLanguage();
	return key;
}

static function GetNextDifficulty(difficulty : Difficulty) {
	switch(difficulty) {
		case(Difficulty.Easy):
			difficulty = difficulty.Medium;
			break;
		case(Difficulty.Medium):
			difficulty = difficulty.Hard;
			break;
		case(difficulty.Hard):
			difficulty = difficulty.Impossible;
			break;
	}
	return difficulty;
}

function upgradeDifficultyForVerseSet(versesetMetadata : Hashtable) {
	var difficulty : Difficulty = GetDifficultyFromInt(versesetMetadata["difficulty"]);
	difficulty = GetNextDifficulty(difficulty);
	versesetMetadata["difficulty"] = parseInt(difficulty);
	var verseset : VerseSet = GetCurrentVerseSet();
	verseset.SaveMetadata(versesetMetadata);
}


function upgradeDifficultyForVerse(verseMetadata : Hashtable) {
	var difficulty : Difficulty = GetDifficultyFromInt(verseMetadata["difficulty"]);
	difficulty = GetNextDifficulty(difficulty);
	verseMetadata["difficulty"] = parseInt(difficulty);
	var verse : Verse = GetCurrentVerse();
	verse.SaveMetadata(verseMetadata);
}

function HandleVerseSetMastered(difficulty : Difficulty, verseSetMetadata : Hashtable) {

	var categoryDifficultyInt : int = verseSetMetadata["difficulty"];
	var difficultyInt : int = parseInt(difficulty);
	
	if (difficultyInt >= categoryDifficultyInt) {
		upgradeDifficultyForVerseSet(verseSetMetadata);
	}	
}


function HandleVerseMastered(difficulty : Difficulty, verseMetadata : Hashtable) {
	var verseDifficultyInt : int = verseMetadata["difficulty"];
	var difficultyInt : int = parseInt(difficulty);
	//Debug.Log ( verseDifficultyInt + " vs " + difficultyInt);
	
	if (difficultyInt >= verseDifficultyInt) {
		upgradeDifficultyForVerse(verseMetadata);
	}	
	SyncMasteredVerses(difficulty);	
}

function SetMasteredVerses(difficulty : Difficulty, numVerses : int) {
	var diffkey : String = MasteredVersesKey(difficulty);
	PlayerPrefs.SetInt(diffkey, numVerses);
}

static function DifficultyToString(difficulty : Difficulty) {
	var gt = TextManager.GetText;
	switch (difficulty) {
		case Difficulty.Easy: return gt("easy");
		case Difficulty.Medium: return gt("medium");
		case Difficulty.Hard: return gt("hard");
		case difficulty.Impossible: return gt("impossible");
		default: return "easy";
	}		
}

static function GetChallengeModeEnabled() {
	return PlayerPrefs.GetInt("challenge_mode") == 1;
}

function GetCurrentDifficulty() {
	var selectedDifficulty : Difficulty = GetSelectedDifficulty();
	var verses : Array = GetCurrentVerses();
	var verse : Verse = GetCurrentVerse();
	var verseMetadata =	verse.GetMetadata();
	var maxDifficultyInt : int = verseMetadata["difficulty"];
	if ((maxDifficultyInt < parseInt(selectedDifficulty)) &&
	    !GetChallengeModeEnabled()) {
		var cappedDifficulty : Difficulty = GetDifficultyFromInt(maxDifficultyInt);
		SetDifficulty(cappedDifficulty);
		return cappedDifficulty;
	} else {
		return selectedDifficulty;
	}
}

function IsDifficultyAllowed(difficulty : Difficulty) {
	return parseInt(difficulty) <= parseInt(GetCurrentDifficultyAllowed());
}

function GetCurrentDifficultyAllowed() {
	var verse = GetCurrentVerse();
	var verseMetadata =	verse.GetMetadata();
	var maxDifficultyInt : int = verseMetadata["difficulty"];
	return GetDifficultyFromInt(maxDifficultyInt);
}

static function GetDifficultyFromInt(difficultyInt : int) {
	switch(difficultyInt) {
		case 0: return Difficulty.Easy;
		case 1: return Difficulty.Medium;
		case 2: return Difficulty.Hard;
		case 3: return Difficulty.Impossible;
		default:
		return Difficulty.Easy;
	}
}

function SetDifficulty(difficulty:Difficulty) {
	PlayerPrefs.SetInt("selected_difficulty_"+GetLanguage(),parseInt(difficulty));
}

function GetSelectedDifficulty() {
	var result : int = PlayerPrefs.GetInt("selected_difficulty_"+GetLanguage(),0);
	return GetDifficultyFromInt(result);
}

function GetCachedTotalScore() {
	if (totalScore == -1) {
		totalScore = 0;
		var verses = GetCurrentVerses();
		for (var verse : Verse in verses) {
			var verseMetadata : Hashtable =	verse.GetMetadata();
			var highScore : int = verseMetadata["high_score"];
			totalScore +=  highScore;
		}
	} 
	return totalScore;
}

function GetMasteredVersesPercentage() {
	//var numMastered : float = GetMasteredVerses(GetCurrentDifficulty());
	var verses : Array = GetCurrentVerseSet().verses;
	var numMastered : float = GetMasteredVerses();
	return parseInt(100 * numMastered / verses.length);
}

function GetNextDifficulty() {
	var difficulty = GetCurrentDifficulty();
	return GetNextDifficulty(difficulty);
}

function GetMasteredVerses() {
	return GetMasteredVerses(Difficulty.Hard);
}

function GetMasteredVerses(difficulty : Difficulty) {
	var diffkey = MasteredVersesKey(difficulty);
	return PlayerPrefs.GetInt(diffkey);
}

function SyncMasteredVerses(difficulty : Difficulty) {
	var masteredVerses = 0;
	var verses = GetCurrentVerses();
	
	for (var verse : Verse in verses) {
		var verseMetadata =	verse.GetMetadata();
		var currentDifficultyInt : int = verseMetadata["difficulty"];
		if (currentDifficultyInt > parseInt(difficulty)) {
			masteredVerses += 1;
		}
	}
	SetMasteredVerses(difficulty, masteredVerses);
}

function AddOnlineVerseSet(verseset : VerseSet) {
	// if verse set already exists, replace the old one and return the new
	for (var i=0;i<versesets.length;i++) {
		var vs : VerseSet = versesets[i];
		
		if (vs.onlineId == verseset) {
			versesets[i] = verseset;
			Destroy(vs);
			return verseset;
		}
	}
	versesets.push(verseset);
	return verseset;
}

function CreateVerseSet(name : String) {
	var vs : VerseSet = new VerseSet(name);
	vs.language = GetLanguage();
	versesets.push(vs);
	return vs;
}

static function CheckRightToLeft(language : String) {
	for (var i=0;i<RTL_LANGUAGE_CODES.length;i++) {
		if (language == RTL_LANGUAGE_CODES[i]) {
			rightToLeft = true;
			return;
		}
	}
	rightToLeft = false;
}

function GetApiDomain() {
	var us : UserSession = UserSession.GetUserSession();
	if (us) {
		apiDomain = us.ApiDomain();
		return apiDomain;
	} else {
		return "dev.verserain.com";
	}
}

function LoadOnlineVerse(verseId : String) {
	LoadOnlineVerse(verseId, true);
}

function LoadOnlineVerse(verseId : String, includeSet : boolean) {
	var url : String = "http://"+GetApiDomain()+"/api/verse/show?verse_id="+verseId;
	var www : WWW = new WWW(url);
	yield www;	
	var data = www.text;
	var apiData : Hashtable = JSONUtils.ParseJSON(data);
	var resultData : Hashtable = apiData["result"];
	var verseData : Hashtable = resultData["verse"];
	var versesetId = verseData["verseset_id"];
	
	if (includeSet) {
		LoadOnlineVerseSet(versesetId, verseId);
		return;
	}
	
	GameManager.SetChallengeModeEnabled(false);

	var reference = verseData["reference"];
	var text = verseData["text"];
	var language = verseData["language"];
	var version = verseData["version"];
	var versesetName = verseData["verseset_name"];
	
	var verseset : VerseSet = new VerseSet(versesetId, versesetName, language, version);
	AddOnlineVerseSet(verseset);
	
	var verse : Verse = new Verse(verseId, reference, text, version, verseset);
	verseset.AddVerse(verse);
	
	SetVerseLanguage(language);
	SetCurrentVerseSet(verseset);
	verseIndex = 0;
	loaded = true;
	UserSession.GetUserSession().ClearOptions();
}

function LoadOnlineVerseSet(versesetId : String) {
	LoadOnlineVerseSet(versesetId, null);
}

function LoadOnlineVerseSet(versesetId : String, verseId : String) {
	var url : String = "http://"+GetApiDomain()+"/api/verseset/show?verseset_id="+versesetId;
	Debug.Log(url);
	var www : WWW = new WWW(url);
	yield www;
	var data = www.text;
	var apiData : Hashtable = JSONUtils.ParseJSON(data);
	var resultData : Hashtable = apiData["result"];
	var versesetData : Hashtable = resultData["verseset"];
	var versesetJson : String = JSONUtils.HashtableToJSON(versesetData);
	var language = versesetData["language"];
	var version = versesetData["version"];
	var setname = versesetData["name"];
	var versesData : Array = resultData["verses"];
	var verseset : VerseSet = new VerseSet(versesetId, setname, language, version);
	AddOnlineVerseSet(verseset);
	verseIndex = 0;
	
	for (var i=0;i<versesData.length;i++) {
		var verseData : Hashtable = versesData[i];
		var verseId_ = verseData["_id"];
		var reference = verseData["reference"];
		var text = verseData["text"];
		version = verseData["version"];
		var verse : Verse = new Verse(verseId_, reference, text, version, verseset);
		verseset.AddVerse(verse);
		if (verseId == verseId_) {
			verseIndex = i;
		}
	}
	
	SetVerseLanguage(language);
	SetCurrentVerseSet(verseset);
	GameManager.SetChallengeModeEnabled((verseId == null));
	loaded = true;
	UserSession.GetUserSession().ClearOptions();
}

function LoadVerses() {
	
	var us : UserSession = UserSession.GetUserSession();
	
	if (us) {
		var verseId = us.VerseId();
		if (verseId) {
			LoadOnlineVerse(verseId);
			return;
		}
		var versesetId = us.VerseSetId();
		if (versesetId) {
			LoadOnlineVerseSet(versesetId);
			return;
		}
	}
	
	var language = GetLanguage();
	
	if (language == "en") {
		verseText = verseTextEN;
	} else if (language == "zh") {
		verseText = verseTextZH;
	} else if (language == "he") {
		verseText = verseTextHE;
	}
	
	LoadVersesLocally();
}

function LoadVersesLocally() {
	if (offlineVersesLoaded) {
		return;
	}
	offlineVersesLoaded = true;
	var language = GetLanguage();
	SetVerseLanguage(language);
  	var lines = verseText.text.Split("\n"[0]);
  	var line : String;
  	var sep : String = "|";
  	var name : String;
  	var verseset : VerseSet;
  	var verse : Verse;
  	
  	for (line in lines) {
  		if ((line.Length > 0) && (line[0] == '|')) {
  			name = line.Replace("|","");
  			verseset = CreateVerseSet(name);
  			continue;
  		}
  		var parts = line.Split([sep], System.StringSplitOptions.None);
  		if (parts.Length != 2) continue;
  		
  		var text = parts[1];
  		var badLetter : String;
  		for (badLetter in new Array("“","”")) {
	  		text = text.Replace(badLetter,"");
	  	}
	  	for (badLetter in new Array("-","—","  ","\t")) {
	  		text = text.Replace(badLetter," ");
	  	}
	  	
  		var reference = parts[0];
  		verse = new Verse(reference, text, verseset);
  		
  		verseset.AddVerse(verse);  	
  	}
  	Load();
  	loaded = true;
}

function Awake() {
}

function Load () {
	verseIndex = PlayerPrefs.GetInt("verseIndex_"+GetLanguage(), 0);
}

function Start () {
	LoadVerses();
	Load();
}

function Update () {

}