#pragma strict

import JSONUtils;

var verses : Array = new Array();
var references : Array = new Array();
var verseIndex = 0;
var verseText : TextAsset;
var verseTextEN : TextAsset;
var verseTextZH : TextAsset;
var numVerses = 0;
var totalScore : int = -1;

function currentVerse() {
	return verses[verseIndex];
}

function currentReference() {
	return references[verseIndex];
}

function GetLanguage() {
	return PlayerPrefs.GetString("language", "en");
}

function SetLanguage(language : String) {
	PlayerPrefs.SetString("language", language);
}

function GotoNextVerse() {
	var difficulty : Difficulty = GetCurrentDifficulty();
	var masteredPct = GetMasteredVersesPercentage();
	
	var nextVerseIndex = Random.Range(0, verses.length);
	
	if (masteredPct < 100) {
		nextVerseIndex = verseIndex;
		
		var mastered : boolean = false;
		// find the next verse that's not mastered
		do {
			
			nextVerseIndex = nextVerseIndex + 1;
			if (nextVerseIndex >= verses.length) {
				nextVerseIndex = 0;
				break;
			}
			var verseMetadata = GetVerseMetadata(references[nextVerseIndex]);
			var verseDifficulty : int = verseMetadata["difficulty"];
			mastered = (verseDifficulty > parseInt(difficulty));
			
			//Debug.Log(nextVerseIndex + ". " + verseDifficulty + " vs " + parseInt(difficulty));
		} while (mastered);
	} else {
		// don't repeat same verse on random
		if (verseIndex == nextVerseIndex) {
			GotoNextVerse();
			return;
		}
	}
	
	verseIndex = nextVerseIndex;
	
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
	}		
}

function GetCurrentDifficulty() {
	var selectedDifficulty = GetSelectedDifficulty();
	var maxDifficulty : Difficulty = GetCurrentDifficultyAllowed();
	if (parseInt(maxDifficulty) < parseInt(selectedDifficulty)) {
		return maxDifficulty;
	} else {
		return selectedDifficulty;
	}
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

function GetCurrentDifficultyAllowed() {
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
	var numMastered : float = GetMasteredVerses(GetCurrentDifficulty());
	return parseInt(100 * numMastered / verses.length);
}

function GetNextDifficulty() {
	var difficulty = GetCurrentDifficulty();
	switch (difficulty) {
		case Difficulty.Easy: return Difficulty.Medium;
		case Difficulty.Medium: return Difficulty.Hard;
		case difficulty.Hard: return Difficulty.Impossible;
	}
	return difficulty.Hard;
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

function LoadVerses() {
	verses.clear();
	references.clear();
	var language = GetLanguage();
	
	if (language == "en") {
		verseText = verseTextEN;
	} else if (language == "zh") {
		verseText = verseTextZH;
	} else if (language == "he") {
	// todo hebrew
	}
	
  	var lines = verseText.text.Split("\n"[0]);
  	var line : String;
  	
  	for (line in lines) {
  		
  		var parts = line.Split([": "], System.StringSplitOptions.None);
  		if (parts.Length != 2) continue;
  		
  		var verse = parts[1];
  		var badLetter : String;
  		for (badLetter in new Array("“","”")) {
	  		verse = verse.Replace(badLetter,"");
	  	}
	  	for (badLetter in new Array("-","—","  ","\t")) {
	  		verse = verse.Replace(badLetter," ");
	  	}
	  	
	  	if (language == "zh") {
	  		for (badLetter in new Array(" ")) {
	  			verse = verse.Replace(badLetter,"");
	  		}
	  	}
	  	
  		var reference = parts[0];
  		verses.push(verse);
  		references.push(reference);
  		/*
  		Debug.Log(line);
  		Debug.Log("parts[1] = " + parts[1]);
  		Debug.Log("reference = " + reference + " verse = " + verse);
  		*/
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