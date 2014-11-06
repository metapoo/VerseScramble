#pragma strict

import JSONUtils;
import System.Collections.Generic;

public var versesetLanguage : String;
public var numVerses : int = 0;
public var totalScore : int = -1;

static var verseText : TextAsset;
static var defaultView : String = "popular";
static var languageChosen : boolean = false;
static var versesetsByView : Hashtable = new Hashtable();
static var currentView : String = null;
static var currentVerseSet : VerseSet = null;
static var verseIndex : int  = 0;
static var apiVerseId : String;
static var rightToLeft : boolean = false;
static var loaded : boolean = false;
static var offlineVersesLoaded : boolean = false;
static var started : boolean = false;
static var historyLoaded : boolean = false;
static var countries : Hashtable = new Hashtable();

private static var RTL_LANGUAGE_CODES : List.<String> = new List.<String>(['ar','arc','bcc','bqi','ckb','dv','fa','glk','he','ku','mzn','pnb','ps','sd','ug','ur','yi']);

static function Unload() {
	for (var view : String in versesetsByView.Keys) {
		var versesets : List.<VerseSet> = versesetsByView[view] as List.<VerseSet>;
		
		for (var vs : VerseSet in versesets) {
			vs.HandleRemoved();
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
	offlineVersesLoaded = (versesets.Count > 0);
}

function Reload() {
	Unload();
	Start();
}

static function GetCurrentView(withLanguage : boolean) : String {
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
	var versesets : List.<VerseSet> = GetCurrentVerseSets();
	
	if (!Object.ReferenceEquals(currentVerseSet, null)) {
		for (var i=0;i<versesets.Count;i++) {
			var verseset : VerseSet = versesets[i];
			if (verseset.SaveKey() == currentVerseSet.SaveKey()) {
				// current verse set is in view so leave it alone
				return;
			}
		}
	}
	
	if (versesets.Count > 0) {
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
	var versesets : List.<VerseSet> = GetCurrentVerseSets();
	AddOnlineVerseSet(verseset);
	var vs : VerseSet = versesets[versesets.Count-1];
	
	versesets.Insert(0,vs);
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
	var versesets : List.<VerseSet> = GetCurrentVerseSets();
	if (versesets.Count == 0) return null;
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

static function GetCurrentVerses() : List.<Verse> {
	var vs : VerseSet = GetCurrentVerseSet();
	
	if (Object.ReferenceEquals(vs, null)) {
		return new List.<Verse>();
	}
	return vs.verses;
}

static function GetCurrentVerse() : Verse {
	var verses = GetCurrentVerses();
	
	if (verseIndex >= verses.Count) {
		verseIndex = 0;
	}

	if (verses.Count == 0) {
		SetCurrentView("history");
		LoadVersesLocally();
		verses = GetCurrentVerses();
		if (verses.Count > 0) {
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
	var refParts : List.<String> = new List.<String>(reference.Split(":"[0]));

	var language = GetVoiceLanguage();	
	if (IsLanguageChinese(language)) {
		if (refParts.Count < 2) {
			refParts = new List.<String>(reference.Split("："[0]));
		}
		if (refParts.Count == 2) {
			refParts[0] += "章";
			refParts[1] += "節";
		}
	}
		
	for (var refPart in refParts) {
		SpeakUtterance(refPart);
	}
}

function SpeakUtterance(word : String) {
	var voiceLanguage : String = GetVoiceLanguage();
	SpeakUtterance(word, voiceLanguage);
}

function SpeakUtteranceViaWeb(word : String, language: String) {
	// nothing for now
	yield;
}

function SpeakUtterance(word : String, language: String) {

	if (language == null) return;
	if ((Application.platform!=RuntimePlatform.Android) &&
	    (Application.platform!=RuntimePlatform.IPhonePlayer)) {
	    StartCoroutine(GetInstance().SpeakUtteranceViaWeb(word, language));
	} else {
		VoiceSynth.SpeakUtterance(word,language);
	}
	Debug.Log(String.Format("Speak utterance: {0} in language {1}", word, language));
}

// get language localized with region
static function GetVoiceLanguage() : String {
	var language : String = GetVerseLanguage();
	return GetVoiceLanguage(language);
}

static function GetCountryCodeFromLanguage(language : String) : String {
	if (countries.Count == 0) {
	countries.Add('fr','FR');
	countries.Add('en','US');
	countries.Add('zh','TW');
	countries.Add('vi','VN');
	countries.Add('de','DE');
	countries.Add('it','IT');
	countries.Add('da','DK');
	countries.Add('ar','SA');
	countries.Add('cs','CZ');
	countries.Add('fi','FI');
	countries.Add('ur','PK');
	countries.Add('es-ES','ES');
	countries.Add('ja','JP');
	countries.Add('es','MX');
	countries.Add('he','IL');
	countries.Add('ru','RU');
	countries.Add('nl','NL');
	countries.Add('pt','BR');
	countries.Add('no','NO');
	countries.Add('zh-hans','CN');
	countries.Add('id','ID');
	countries.Add('mn','MN');
	countries.Add('ko','KR');
	countries.Add('sv','SE');
	countries.Add('zh-hant','TW');
	countries.Add('sk','SK');
	countries.Add('hi','IN');
	countries.Add('th','TH');
	countries.Add('tr','TR');
	countries.Add('hu','HU');
	countries.Add('ro','RO');
	countries.Add('pl','PL');
	}
	
	if (countries.ContainsKey(language)) {
		return countries[language];
	}
	return null;
}

// get language localized with region
static function GetVoiceLanguage(language : String) : String {
	var country = GetCountryCodeFromLanguage(language);
	if (country != null) {
		var parts : String[] = language.Split("-"[0]);
		language = parts[0];
		return String.Format("{0}-{1}", language, country);
	}
	return null;
}

static function IsLanguageChinese(language : String) : boolean {
	return (language == 'zh') || (language == 'zh-hans') || (language == 'zh-hant') || (language == 'zh-CN') || (language == 'zh-TW');
}

static function IsCharacterBased(language : String) : boolean {
	return ((language == 'ja') || IsLanguageChinese(language));
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
		case "English": return "en"; break;
		case "Chinese": return "zh-hant";break;
		case "Korean": return "ko";break;
		case "Russian": return "ru";break;
		case "Mongolian": return "mn";break;
		case "French": return "fr";break;
		case "Spanish": return "es";break;
		case "Italian": return "it";break;
		case "German": return "de";break;
		default: return "en";break;
	}
}

static function GetLanguage() : String {
	return PlayerPrefs.GetString("language", GetSystemLanguage());
}

function SetLanguage(language : String, finishHandler : Function) {
	PlayerPrefs.SetString("language", language);
	TextManager.LoadLanguageOffline(language);
	var tm : TextManager = TextManager.GetInstance();
	StartCoroutine(tm.LoadLanguage(language, finishHandler));
}

function IsAtFinalVerseOfChallenge() : boolean {
	var verses = GetCurrentVerses();
	return (GetChallengeModeEnabled()) && (verseIndex >= (verses.Count-1));
}

function GotoNextVerse() {
	var difficulty : Difficulty = GetCurrentDifficulty();
	var verses = GetCurrentVerses();
	verseIndex = verseIndex + 1;

	if (verseIndex >= verses.Count) {
		verseIndex = 0;
	}
	
	Debug.Log("going to verse " + verseIndex);
	Save();
}

function Save() {
	var language = GetLanguage();
	PlayerPrefs.SetInt("verseIndex_"+language, verseIndex);
}

function MasteredVersesKey(difficulty : Difficulty) : String {
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
		default:
			break;
	}
	var key = diffkey + "_verses_mastered_"+GetLanguage();
	return key;
}

static function GetNextDifficulty(difficulty : Difficulty) : Difficulty {
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
		default:
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

static function DifficultyToString(difficulty : Difficulty) : String {
	switch (difficulty) {
		case Difficulty.Easy: 
			return TextManager.GetText("easy");
			break;
		case Difficulty.Medium: 
			return TextManager.GetText("medium");
			break;
		case Difficulty.Hard: 
			return TextManager.GetText("hard");
			break;
		case difficulty.Impossible: 
			return TextManager.GetText("impossible");	
			break;
		default: 
			return "easy";
			break;
	}		
}

static function GetChallengeModeEnabled() : boolean {
	return PlayerPrefs.GetInt("challenge_mode") == 1;
}

function GetCurrentDifficulty() : Difficulty {
	var selectedDifficulty : Difficulty = GetSelectedDifficulty();
	var verseset : VerseSet = currentVerseSet;
	var verses : List.<Verse> = GetCurrentVerses();
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

function IsDifficultyAllowed(difficulty : Difficulty) : boolean {
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

static function GetDifficultyFromInt(difficultyInt : int) : Difficulty {
	switch(difficultyInt) {
		case 0: return Difficulty.Easy; break;
		case 1: return Difficulty.Medium; break;
		case 2: return Difficulty.Hard; break;
		case 3: return Difficulty.Impossible; break;
		default:
			return Difficulty.Easy;
			break;
	}
}

function SetDifficulty(difficulty:Difficulty) {
	PlayerPrefs.SetInt("selected_difficulty_"+GetLanguage(),parseInt(difficulty));	
}

function GetSelectedDifficulty() : Difficulty {
	var result : int = PlayerPrefs.GetInt("selected_difficulty_"+GetLanguage(),0);
	return GetDifficultyFromInt(result);
}

function GetNextDifficulty() : Difficulty {
	var difficulty = GetCurrentDifficulty();
	return GetNextDifficulty(difficulty);
}

function SyncMasteredVerses(difficulty : Difficulty) {
	var masteredVerses = 0;
	var verses : List.<Verse> = GetCurrentVerses();
	
	for (var verse : Verse in verses) {
		var verseMetadata =	verse.GetMetadata();
		var currentDifficultyInt : int = verseMetadata["difficulty"];
		if (currentDifficultyInt > parseInt(difficulty)) {
			masteredVerses += 1;
		}
	}
	SetMasteredVerses(difficulty, masteredVerses);
}

static function AddOnlineVerseSet(verseset : VerseSet) : VerseSet {
	var versesets : List.<VerseSet> = GetCurrentVerseSets();
	// if verse set already exists, replace the old one and return the new
	for (var i=0;i<versesets.Count;i++) {
		var vs : VerseSet = versesets[i];
		if (verseset.SaveKey() == vs.SaveKey()) {
			versesets.RemoveAt(i);
			
			if (!(Object.ReferenceEquals(vs, verseset))) {
				vs.HandleRemoved();
			}
			
			versesets.Add(verseset);
			
			return verseset;
		}
	}
	versesets.Add(verseset);
	return verseset;
}

static function CreateVerseSet(name : String) : VerseSet {
	var versesets : List.<VerseSet> = GetCurrentVerseSets();
	var vs : VerseSet = VerseSet(name);
	vs.language = GetLanguage();
	versesets.Add(vs);
	return vs;
}

static function CheckRightToLeft(language : String) {
	for (var i=0;i<RTL_LANGUAGE_CODES.Count;i++) {
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

function HandleVerseShow(resultData : Hashtable) {
	var verseData : Hashtable = resultData["verse"];
	var versesetId : String = verseData["verseset_id"];
	var verseId : String = verseData["_id"];
	LoadOnlineVerseSet(versesetId, verseId);
}
	
function LoadOnlineVerse(verseId : String, includeSet : boolean) {
	
	var arguments : Hashtable = new Hashtable();
	arguments.Add("verse_id",verseId);
	var options : Hashtable = new Hashtable();
	options.Add("handler",HandleVerseShow);
	
	ApiManager.GetInstance().CallApi("verse/show", 
	arguments, 
	options);
	
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

function HandleShowVerseSet(resultData : Hashtable) {
	var versesetData : Hashtable = resultData["verseset"];
	var versesData : List.<Object> = resultData["verses"];
	var verseset : VerseSet = LoadVerseSetData(versesetData);
	SetCurrentVerseSet(verseset);
	verseIndex = 0;
	verseset.LoadVersesData(versesData);
	verseIndex = verseset.IndexOfVerseId(apiVerseId);
	if (verseIndex < 0) verseIndex = 0;
		
	GameManager.SetChallengeModeEnabled((apiVerseId == null));
	var gm : GameManager = GameManager.GetInstance();
	if (gm != null) {
		gm.SyncSetProgressLabel();
	}
	loaded = true;
	UserSession.GetUserSession().ClearUrlOptions();
	Debug.Log("finished loading verse set");
};
	
function LoadOnlineVerseSet(versesetId : String, verseId : String) {
	SetCurrentView("history");
	apiVerseId = verseId;
	var arguments : Hashtable = new Hashtable();
	arguments.Add("verseset_id", versesetId);
	var options : Hashtable = new Hashtable();
	options.Add("handler",HandleShowVerseSet);
	
	ApiManager.GetInstance().CallApi("verseset/show",
	arguments,
	options);
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
	
	var language : String = GetLanguage();
	
	var filename : String = String.Format("verses_{0}", language.ToLower());
	
	var fullpath:String = "Languages/" +  filename ; // the file is actually ".txt" in the end
 
 	Debug.Log(fullpath);
 	
    verseText =  UnityEngine.Resources.Load(fullpath, TextAsset);
    
    if (verseText == null) {
    	Debug.Log(fullpath + " not found");
		offlineVersesLoaded = true;
		loaded = true;
		return;
    }
    
 	var previousView : String = currentView;
 	SetCurrentView("history");

	offlineVersesLoaded = true;
	var lang : String = GetLanguage();
	SetVerseLanguage(lang);
  	var lines : List.<String> = new List.<String>(verseText.text.Split("\n"[0]));
  	var sep : String = "|";
  	var name : String;
  	var verseset : VerseSet;
  	var verse : Verse;
  	
  	for (var line : String in lines) {
  		if ((line.Length > 0) && (line[0] == '|')) {
  			name = line.Replace("|","");
  			verseset = CreateVerseSet(name);
  			continue;
  		}
  		var parts : String[] = line.Split([sep], System.StringSplitOptions.None);
  		if (parts.Length != 2) continue;
  		
  		var text : String = parts[1];
  		var deleteLetters : String[] = ["“","”"];
  		var spaceLetters : String[] = ["-","—","  ","\t"];
  		
  		for (var badLetter : String in deleteLetters) {
	  		text = text.Replace(badLetter,"");
	  	}
	  	for (badLetter in spaceLetters) {
	  		text = text.Replace(badLetter," ");
	  	}
	  	
  		var reference : String  = parts[0];
  		verse = Verse(reference, text, verseset);
  		
  		verseset.AddVerse(verse);  	
  	}
  	Load();
  	loaded = true;
  	if (previousView != null) {
  		SetCurrentView(previousView);
  	}
  	
}

static function GetCurrentVerseSets() : List.<VerseSet> {
	return GetVerseSets(currentView);
}

static function ClearVerseSets(view : String) {
	if (view != "history") {
		view = view + "_" + GetLanguage();
	}
	var vs : List.<VerseSet> = versesetsByView[view];
	if (vs != null) {
		vs.Clear();
	}
}

static function GetVerseSets(view : String) : List.<VerseSet> {
	if (versesetsByView.ContainsKey(view)) {
		return versesetsByView[view];
	}
	versesetsByView[view] = new List.<VerseSet>();
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
