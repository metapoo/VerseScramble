#pragma strict

import JSONUtils;

var verses : Array = new Array();
var references : Array = new Array();
var versesByReference : Hashtable = new Hashtable();
var referencesByCategory : Hashtable = new Hashtable();
var categories : Array = new Array();
var verseIndex = 0;
var verseText : TextAsset;
var verseTextEN : TextAsset;
var verseTextZH : TextAsset;
var verseTextHE : TextAsset;
var numVerses = 0;
var totalScore : int = -1;
private var currentCategory : String = "";

function GetCurrentCategory() {

	if (currentCategory != "") return currentCategory;

	if (categories.length == 0) return "";

	currentCategory = PlayerPrefs.GetString(String.Format("category_{0}",GetLanguage()), categories[0]);
	
	for (var c in categories) {
		if (c == currentCategory) return c;
	}
	
	currentCategory = categories[0];
	return currentCategory;
}

function SetCurrentCategory(category : String) {
	currentCategory = category;
	PlayerPrefs.SetString(String.Format("category_{0}",GetLanguage()), category);
}

function GetCurrentReferences() {
	var category : String = GetCurrentCategory();
	Debug.Log("get current references for category: " + category);
	var refs : Array = referencesByCategory[category];
	return refs;
}

function currentReference() {
	var refs = GetCurrentReferences();
	
	if (refs.length == 0) {
		return "";
	}
	
	if (verseIndex >= refs.length) {
		verseIndex = 0;
	}

	Debug.Log("refs length = " + refs.length + " verse index = " + verseIndex);
	return refs[verseIndex];
}

function currentVerse() {
	var reference = currentReference();
	return versesByReference[reference];
}

function SayVerseReference() {
	var reference : String = currentReference();
	var refParts = reference.Split(":"[0]);
	var language = GetLanguage();
	
	if (language == "zh") {
		refParts[0] += "章";
		refParts[1] += "節";
	}
		
	for (var refPart in refParts) {
		SpeakUtterance(refPart);
	}
}

static function SpeakUtterance(word : String) {
	var language = GetVoiceLanguage();
	VoiceSynth.SpeakUtterance(word,language);
	Debug.Log(String.Format("Speak utterance: {0} in language {1}", word, language));
}

static function GetVoiceLanguage() {
	var language = GetLanguage();
	if (language == "en") {
		return "en-US";
	} else if (language == "zh") {
		return "zh-TW";
	} else {
		return "en-US";
	}
}

static function GetLanguage() {
	return PlayerPrefs.GetString("language", "en");
}

static function SetLanguage(language : String) {
	PlayerPrefs.SetString("language", language);
}

function GotoNextVerse() {
	var difficulty : Difficulty = GetCurrentDifficulty();
	var masteredPct = GetMasteredVersesPercentage();
	var refs = GetCurrentReferences();
	verseIndex = verseIndex + 1;

	if (verseIndex >= refs.length) {
		verseIndex = 0;
	}	
	Debug.Log("going to verse " + verseIndex);
	Save();
}

function Save() {
	var language = GetLanguage();
	PlayerPrefs.SetInt("verseIndex_"+language, verseIndex);
	PlayerPrefs.SetString("currentVerse_"+language, currentVerse());
	PlayerPrefs.SetString("currentReference_"+language, currentReference());
}

function SaveVerseMetadata(metadata : Hashtable) {
	var reference = currentReference();
	var metadataJSON : String = JSONUtils.HashtableToJSON(metadata);
	
	PlayerPrefs.SetString("vm_"+reference+"_"+GetLanguage(), metadataJSON);
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

function upgradeDifficultyForVerse(verseMetadata : Hashtable) {
	var difficulty : Difficulty = GetDifficultyFromInt(verseMetadata["difficulty"]);
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
	verseMetadata["difficulty"] = parseInt(difficulty);
	SaveVerseMetadata(verseMetadata);
}


function HandleVerseMastered(difficulty : Difficulty, verseMetadata : Hashtable) {
	var verseDifficultyInt : int = verseMetadata["difficulty"];
	var difficultyInt : int = parseInt(difficulty);
	Debug.Log ( verseDifficultyInt + " vs " + difficultyInt);
	
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
	switch (difficulty) {
		case Difficulty.Easy: return "easy";
		case Difficulty.Medium: return "medium";
		case Difficulty.Hard: return "hard";
		case difficulty.Impossible: return "impossible";
		default: return "easy";
	}		
}

function GetGlobalDifficulty__deprecated__() {
	var selectedDifficulty = GetSelectedDifficulty();
	var maxDifficulty : Difficulty = GetCurrentDifficultyAllowed__deprecated__();
	if (parseInt(maxDifficulty) < parseInt(selectedDifficulty)) {
		return maxDifficulty;
	} else {
		return selectedDifficulty;
	}
}

function GetCurrentDifficulty() {
	var selectedDifficulty : Difficulty = GetSelectedDifficulty();
	var reference = currentReference();
	var verseMetadata =	GetVerseMetadata(reference);
	var maxDifficultyInt : int = verseMetadata["difficulty"];
	if (maxDifficultyInt < parseInt(selectedDifficulty)) {
		var cappedDifficulty : Difficulty = GetDifficultyFromInt(maxDifficultyInt);
		SetDifficulty(cappedDifficulty);
		return cappedDifficulty;
	} else {
		return selectedDifficulty;
	}
}

function GetCurrentDifficultyAllowed() {
	var verseMetadata =	GetVerseMetadata(currentReference());
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

function GetCurrentDifficultyAllowed__deprecated__() {
	var numMastered = GetMasteredVerses(Difficulty.Easy);
	if (numMastered < verses.length) return Difficulty.Easy;
	numMastered = GetMasteredVerses(Difficulty.Medium);
	if (numMastered < verses.length) return Difficulty.Medium;
	numMastered = GetMasteredVerses(Difficulty.Hard);
	if (numMastered < verses.length) return Difficulty.Hard;
	return Difficulty.Hard;
}

function GetCachedTotalScore() {
	if (totalScore == -1) {
		totalScore = 0;
		for (reference in references) {
			var verseMetadata : Hashtable =	GetVerseMetadata(reference);
			var highScore : int = verseMetadata["high_score"];
			totalScore +=  highScore;
		}
	} 
	return totalScore;
}

function GetMasteredVersesPercentage() {
	//var numMastered : float = GetMasteredVerses(GetCurrentDifficulty());
	var numMastered : float = GetMasteredVerses();
	return parseInt(100 * numMastered / verses.length);
}

function GetNextDifficulty() {
	var difficulty = GetCurrentDifficulty();
	switch (difficulty) {
		case Difficulty.Easy: return Difficulty.Medium;
		case Difficulty.Medium: return Difficulty.Hard;
		case difficulty.Hard: return Difficulty.Hard;
		default: return Difficulty.Hard;
	}
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
	Debug.Log("references length: " + references.length);
	for (var reference in references) {
		var verseMetadata =	GetVerseMetadata(reference);
		var currentDifficultyInt : int = verseMetadata["difficulty"];
		if (currentDifficultyInt > parseInt(difficulty)) {
			masteredVerses += 1;
		}
	}
	SetMasteredVerses(difficulty, masteredVerses);
}

function GetVerseMetadata(reference : String) {
	var key = "vm_"+reference+"_"+GetLanguage();
	var metadataJSON : String = null;
	
	if (PlayerPrefs.HasKey(key)) {
		metadataJSON = PlayerPrefs.GetString(key);
	}
	
//	Debug.Log("metadata = " + metadataJSON);
	
	if (metadataJSON != null) {
		var h : Hashtable = JSONUtils.ParseJSON(metadataJSON);
		return h;		
	}
	
	var metadata : Hashtable = new Hashtable();
	metadata["high_score"] = 0;
	metadata["difficulty"] = parseInt(Difficulty.Easy);
	return metadata;
}

function CreateCategory(category : String) {
	if (referencesByCategory[category] == null) {
	  	referencesByCategory.Add(category, new Array());
	  	categories.push(category);
	  	Debug.Log("Creating category " + category);
	}
}

function LoadVerses() {
	
	verses.clear();
	references.clear();
	categories.clear();
	versesByReference.Clear();
	referencesByCategory.Clear();
	
	var language = GetLanguage();
	
	if (language == "en") {
		verseText = verseTextEN;
	} else if (language == "zh") {
		verseText = verseTextZH;
	} else if (language == "he") {
		verseText = verseTextHE;
	}
	
  	var lines = verseText.text.Split("\n"[0]);
  	var line : String;
  	var sep : String = "|";
  	var category : String;
  	
  	for (line in lines) {
  		if ((line.Length > 0) && (line[0] == '|')) {
  			category = line.Replace("|","");
  			CreateCategory(category);
  			continue;
  		}
  		var parts = line.Split([sep], System.StringSplitOptions.None);
  		if (parts.Length != 2) continue;
  		
  		var verse = parts[1];
  		var badLetter : String;
  		for (badLetter in new Array("“","”")) {
	  		verse = verse.Replace(badLetter,"");
	  	}
	  	for (badLetter in new Array("-","—","  ","\t")) {
	  		verse = verse.Replace(badLetter," ");
	  	}
	  	
  		var reference = parts[0];
  		verses.push(verse);
  		references.push(reference);
  		
  		var refs : Array = referencesByCategory[category];
  		refs.push(reference);
  		
  		if (versesByReference[reference] == null) {
  			versesByReference[reference] = verse;
  		}
  		
  	}
  	Load();
	
  	Debug.Log(references.join(";"));
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