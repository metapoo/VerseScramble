#pragma strict

import JSONUtils;

var versesetLanguage : String;
var numVerses = 0;
var totalScore : int = -1;

static var verseText : TextAsset;
static var defaultView : String = "popular";
static var languageChosen : boolean = false;
static var versesetsByView : Hashtable = new Hashtable();
static var currentView : String = null;
static var currentVerseSet : VerseSet = null;
static var verseIndex = 0;
static var rightToLeft : boolean = false;
static var loaded : boolean = false;
static var offlineVersesLoaded : boolean = false;
static var started : boolean = false;
static var historyLoaded : boolean = false;

private static var RTL_LANGUAGE_CODES : Array = new Array('ar','arc','bcc','bqi','ckb','dv','fa','glk','he','ku','mzn','pnb','ps','sd','ug','ur','yi');

static function Unload() {
	for (var view in versesetsByView.Keys) {
		var versesets : Array = versesetsByView[view];
		
		for (var vs : VerseSet in versesets) {
			Destroy(vs);
		}
		versesets.Clear();
	}
	loaded = false;
	offlineVersesLoaded = false;

}

function SwitchLanguage(language : String, finishHandler : Function) {
	languageChosen = true;
	SetLanguage(language, finishHandler);
	SetCurrentView(defaultView);
	var versesets = GetCurrentVerseSets();
	offlineVersesLoaded = (versesets.length > 0);
}

function Reload() {
	Unload();
	Start();
}

static function GetCurrentView(withLanguage : boolean) {
	var parts = currentView.Split("_"[0]);
	if (withLanguage) return currentView;
	return parts[0];
}

static function SetCurrentView(view : String) {
	if (view != "history") {
		view = view+"_"+GetLanguage();
	}
	currentView = view;
	verseIndex = 0;
	var versesets : Array = GetCurrentVerseSets();
	
	if (!Object.ReferenceEquals(currentVerseSet, null)) {
		for (var i=0;i<versesets.length;i++) {
			var verseset : VerseSet = versesets[i];
			if (verseset.SaveKey() == currentVerseSet.SaveKey()) {
				// current verse set is in view so leave it alone
				return;
			}
		}
	}
	
	if (versesets.length > 0) {
		currentVerseSet = versesets[0];
	} else {
		currentVerseSet = null;
	}
	Debug.Log("current view = " + currentView);
}

static function AddOnlineVerseSetToHistory(verseset : VerseSet) {
	var oldView = GetCurrentView(false);
	var oldIndex : int = verseIndex;
	var oldVerseSet : VerseSet = currentVerseSet;
	SetCurrentView("history");
	var versesets : Array = GetCurrentVerseSets();
	AddOnlineVerseSet(verseset);
	var vs : VerseSet = versesets.Pop();
	versesets.Unshift(vs);
	SetCurrentView(oldView);
	verseIndex = oldIndex;
	currentVerseSet = oldVerseSet;
	Debug.Log("Add " + verseset.setname + " to verseset history");
}

static function GetCurrentVerseSet() : VerseSet {

	if (!Object.ReferenceEquals(currentVerseSet, null)) {
		//Debug.Log("current verse set = " + currentVerseSet.SaveKey());
		return currentVerseSet;
 	}
	var versesets : Array = GetCurrentVerseSets();
	if (versesets.length == 0) return null;
	var verseset : VerseSet = versesets[0];
	
	var versesetSaveKey = PlayerPrefs.GetString(String.Format("current_verseset_{0}",GetLanguage()), verseset.SaveKey());
	
	for (var vs : VerseSet in versesets) {
		if (vs.SaveKey() == versesetSaveKey) {
			//Debug.Log("current verse set = " + currentVerseSet.SaveKey());
			return vs;
		}
	}

	currentVerseSet = versesets[0];
	//Debug.Log("current verse set (from save) = " + currentVerseSet.SaveKey());
	return currentVerseSet;
}

static function SetCurrentVerseSet(verseset : VerseSet) {
	Debug.Log("current verse set = " + verseset.SaveKey());
	currentVerseSet = verseset;
	var language = GetLanguage();
	if (verseset.language != null) {
		SetVerseLanguage(verseset.language);
	} else {
		SetVerseLanguage(language);
	}
	//Debug.Log("verseset set to " + verseset.SaveKey());
	PlayerPrefs.SetString(String.Format("current_verseset_{0}",language), verseset.SaveKey());
}

static function GetCurrentVerses() : Array {
	var vs : VerseSet = GetCurrentVerseSet();
	
	if (Object.ReferenceEquals(vs, null)) {
		return new Array();
	}
	return vs.verses;
}

static function GetCurrentVerse() : Verse {
	var verses = GetCurrentVerses();
	
	if (verseIndex >= verses.length) {
		verseIndex = 0;
	}

	if (verses.length == 0) {
		SetCurrentView("history");
		LoadVersesLocally();
		verses = GetCurrentVerses();
		if (verses.length > 0) {
			verseIndex = 0;
			return verses[verseIndex];
		} else {
			return null;
		}
	}

	
	return verses[verseIndex];
}

static function GetCurrentReference() : String {
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

	var language = GetVoiceLanguage();	
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
		SpeakUtterance(refPart);
		yield WaitForSeconds(1);
	}
}

static function SpeakUtterance(word : String) {
	var voiceLanguage : String = GetVoiceLanguage();
	SpeakUtterance(word, voiceLanguage);
}

static function SpeakUtterance(word : String, language: String) {
	if (language == null) return;
	VoiceSynth.SpeakUtterance(word,language);
	Debug.Log(String.Format("Speak utterance: {0} in language {1}", word, language));
}

// get language localized with region
static function GetVoiceLanguage() {
	var language : String = GetVerseLanguage();
	return GetVoiceLanguage(language);
}

static function GetCountryCodeFromLanguage(language : String) {
	var countries : Hashtable = new Hashtable({"en":"US","zh-hant":"TW","zh":"TW","zh-hans":"CN",
	"he":"IL","ur":"PK","ja":"JP","ko":"KR","th":"TH","vi":"VN","mn":"MN",
	"ar":"SA","cs":"CZ","da":"DK","de":"DE","nl":"NL","fi":"FI","fr":"FR","hi":"IN",
	"hu":"HU","id":"ID","it":"IT","no":"NO","pl":"PL","pt":"BR","ro":"RO",
	"ru":"RU","sk":"SK","es":"MX","es-ES":"ES","sv":"SE","tr":"TR"});
	if (countries.ContainsKey(language)) {
		return countries[language];
	}
	return null;
}

// get language localized with region
static function GetVoiceLanguage(language : String) {
	var country = GetCountryCodeFromLanguage(language);
	if (country != null) {
		return String.Format("{0}-{1}", language, country);
	}
	return null;
}

static function IsLanguageChinese(language : String) : boolean {
	return (language == 'zh') || (language == 'zh-hans') || (language == 'zh-hant') || (language == 'zh-CN') || (language == 'zh-TW');
}

static function IsLanguageWestern(language : String) : boolean {
	return (language == 'en') || (language == 'de') || (language == 'fr') || (language == 'es') ||
			(language == 'it');
}

static function GetInstance() : VerseManager {
	return GameObject.FindObjectOfType(VerseManager);
}

static function SetVerseLanguage(language : String) {
	PlayerPrefs.SetString("verse_language", language);
	CheckRightToLeft(language);
	
	var gameLanguage = GetLanguage();
	var defaultLanguage = "en";
	// try to load game language as verse language if available
	// and user never "set the language" 
	if ((gameLanguage != language) && (!languageChosen)) {
		var success = TextManager.LoadLanguageOffline(language);
		if (!success) {
			GetInstance().SetLanguage(defaultLanguage, null);
		} else {
			GetInstance().SetLanguage(language, null);
		}
	}
}

static function GetVerseLanguage() : String{
	var l : String = PlayerPrefs.GetString("verse_language", "en");
	if (l) return l;
	return GetLanguage();
}


static function GetSystemLanguage() : String {
	var sl : SystemLanguage = Application.systemLanguage;
	var fullLang : String = sl.ToString();
	switch(fullLang) {
		case "English": return "en";
		case "Chinese": return "zh-hans";
		case "Korean": return "ko";
		case "Russian": return "ru";
		case "Mongolian": return "mn";
		case "French": return "fr";
		case "Spanish": return "es";
		case "Italian": return "it";
		case "German": return "de";
		default: return "en";
	}
}

static function GetLanguage() : String {
	return PlayerPrefs.GetString("language", GetSystemLanguage());
}

function SetLanguage(language : String, finishHandler : Function) : String {
	PlayerPrefs.SetString("language", language);
	TextManager.LoadLanguageOffline(language);
	var tm : TextManager = TextManager.GetInstance();
	StartCoroutine(tm.LoadLanguage(language, finishHandler));
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
	var verseset : VerseSet = currentVerseSet;
	var verses : Array = GetCurrentVerses();
	var verse : Verse = GetCurrentVerse();
	if (Object.ReferenceEquals(verse, null)) {
		return Difficulty.Easy;
	}

	var metadata : Hashtable =	verse.GetMetadata();
	
	if (GetChallengeModeEnabled()) {
		metadata = verseset.GetMetadata();
	}

	var maxDifficultyInt : int = metadata["difficulty"];	
	
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

function GetCurrentDifficultyAllowed() : int {
	var metadata : Hashtable;

	if (GameManager.GetChallengeModeEnabled()) {
		metadata = currentVerseSet.GetMetadata();
	} else {
		var verse : Verse = GetCurrentVerse();
		metadata =	verse.GetMetadata();
	}
	var maxDifficultyInt : int = metadata["difficulty"];
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

static function AddOnlineVerseSet(verseset : VerseSet) {
	var versesets : Array = GetCurrentVerseSets();
	// if verse set already exists, replace the old one and return the new
	for (var i=0;i<versesets.length;i++) {
		var vs : VerseSet = versesets[i];
		if (verseset.SaveKey() == vs.SaveKey()) {
			versesets.RemoveAt(i);
			
			if (!(Object.ReferenceEquals(vs, verseset))) {
				Destroy(vs);
			}
			
			versesets.push(verseset);
			
			return verseset;
		}
	}
	versesets.push(verseset);
	return verseset;
}

static function CreateVerseSet(name : String) {
	var versesets : Array = GetCurrentVerseSets();
	var vs : VerseSet = VerseSet(name);
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

function LoadOnlineVerse(verseId : String) {
	LoadOnlineVerse(verseId, true);
}

function LoadOnlineVerse(verseId : String, includeSet : boolean) {

	var handleApi : Function = function(resultData : Hashtable) {
	
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
	
		var verseset : VerseSet = VerseSet.GetVerseSet(versesetId, versesetName, language, version);
		AddOnlineVerseSet(verseset);
	
		var verse : Verse = Verse(verseId, reference, text, version, verseset);
		verseset.AddVerse(verse);
	
		SetCurrentVerseSet(verseset);
		verseIndex = 0;
		loaded = true;
		UserSession.GetUserSession().ClearUrlOptions();
	};
	
	ApiManager.GetInstance().CallApi("verse/show", new Hashtable({"verse_id":verseId}), handleApi);
	
}

function LoadOnlineVerseSet(versesetId : String) {
	LoadOnlineVerseSet(versesetId, null);
}

static function LoadVerseSetData(versesetData : Hashtable) : VerseSet {
	var versesetJson : String = JSONUtils.HashtableToJSON(versesetData);
	var language : String = versesetData["language"];
	var version : String = versesetData["version"];
	var setname : String = versesetData["name"];
	var versesetId : String = versesetData["_id"];
	var verseCount = versesetData["verse_count"];
	//Debug.Log("setname = " + setname + " verse count = " + verseCount);
	var verseset : VerseSet = VerseSet.GetVerseSet(versesetId, setname, language, version);
	verseset.verseCount = verseCount;
	AddOnlineVerseSet(verseset);
	return verseset;
}

function LoadOnlineVerseSet(versesetId : String, verseId : String) {
	SetCurrentView("history");
	var handleApi : Function = function(resultData : Hashtable) {
		var versesetData : Hashtable = resultData["verseset"];
		var versesData : Array = resultData["verses"];
		var verseset : VerseSet = LoadVerseSetData(versesetData);
		SetCurrentVerseSet(verseset);
		verseIndex = 0;
		verseset.LoadVersesData(versesData);
		verseIndex = verseset.IndexOfVerseId(verseId);
		if (verseIndex < 0) verseIndex = 0;
		
		GameManager.SetChallengeModeEnabled((verseId == null));
		loaded = true;
		UserSession.GetUserSession().ClearUrlOptions();
		Debug.Log("finished loading verse set");
	};
	
	ApiManager.GetInstance().CallApi("verseset/show",new Hashtable({"verseset_id":versesetId}),handleApi);
}

function LoadVerses() {
	
	var us : UserSession = UserSession.GetUserSession();
	
	if (us) {
		if (us.verseId) {
			LoadOnlineVerse(us.verseId);
			return;
		}
		if (us.versesetId) {
			LoadOnlineVerseSet(us.versesetId);
			return;
		}
	}

	LoadVersesLocally();
}

static function LoadVersesLocally() {
	if (offlineVersesLoaded) {
		return;
	}
	Debug.Log("Loading verses locally..");
	
	var language = GetLanguage();
	
	var filename = String.Format("verses_{0}", language.ToLower());
	
	var fullpath:String = "Languages/" +  filename ; // the file is actually ".txt" in the end
 
 	Debug.Log(fullpath);
 	
    verseText =  Resources.Load(fullpath, typeof(TextAsset));
    
    if (verseText == null) {
    	Debug.Log(fullpath + " not found");
		offlineVersesLoaded = true;
		loaded = true;
		return;
    }
    
 	var previousView : String = currentView;
 	SetCurrentView("history");

	offlineVersesLoaded = true;
	var lang = GetLanguage();
	SetVerseLanguage(lang);
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
  		verse = Verse(reference, text, verseset);
  		
  		verseset.AddVerse(verse);  	
  	}
  	Load();
  	loaded = true;
  	if (previousView != null) {
  		SetCurrentView(previousView);
  	}
}

static function GetCurrentVerseSets() : Array {
	return GetVerseSets(currentView);
}

static function ClearVerseSets(view : String) {
	if (view != "history") {
		view = view + "_" + GetLanguage();
	}
	var vs : Array = versesetsByView[view];
	if (vs != null) {
		vs.Clear();
	}
}

static function GetVerseSets(view : String) : Array {
	if (versesetsByView.ContainsKey(view)) {
		return versesetsByView[view];
	}
	versesetsByView[view] = new Array();
	return versesetsByView[view];
}

function Awake() {
}

static function Load() {
	verseIndex = PlayerPrefs.GetInt("verseIndex_"+GetLanguage(), 0);
}

function Start() {
	if (!started) {
		SetCurrentView(defaultView);
	}
	LoadVerses();
	Load();
	started = true;
}

function Update () {

}