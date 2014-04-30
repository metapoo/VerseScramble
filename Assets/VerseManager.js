#pragma strict

import JSONUtils;

var verses : Array = new Array();
var references : Array = new Array();
var verseIndex = 0;
var verseText : TextAsset;
var numVerses = 0;

function currentVerse() {
	return verses[verseIndex];
}

function currentReference() {
	return references[verseIndex];
}

function GotoNextVerse() {
	var nextVerseIndex = Random.Range(0, verses.length);
	
	if (verseIndex == nextVerseIndex) {
		verseIndex = verseIndex + 1;
	} else {
		verseIndex = nextVerseIndex;
	}
	
	Save();
}

function Save() {
	PlayerPrefs.SetInt("verseIndex", verseIndex);
	PlayerPrefs.SetString("currentVerse", currentVerse());
	PlayerPrefs.SetString("currentReference", currentReference());
}

function SaveVerseMetadata(metadata : Hashtable) {
	var reference = currentReference();
	var metadataJSON : String = JSONUtils.HashtableToJSON(metadata);
	
	PlayerPrefs.SetString("vm_"+reference, metadataJSON);
}

function GetVerseMetadata(reference : String) {
	var key = "vm_"+reference;
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
	
  	var lines = verseText.text.Split("\n"[0]);
  	var line : String;
  	for (line in lines) {
  		
  		var parts = line.Split([": "], System.StringSplitOptions.None);
  		if (parts.Length != 2) continue;
  		
  		var verse = parts[1];
  		var badLetter : String;
  		for (badLetter in new Array(":","“","”",";")) {
	  		verse = verse.Replace(badLetter,"");
	  	}
	  	for (badLetter in new Array("-","—","  ","\t")) {
	  		verse = verse.Replace(badLetter," ");
	  	}
	  	
  		var reference = parts[0];
  		verses.push(verse);
  		references.push(reference);
  		
  		//Debug.Log(line);
  		//Debug.Log("parts[1] = " + parts[1]);
  		//Debug.Log("reference = " + reference + " verse = " + verse);
  	}
  	Load();
}


function Load () {
	verseIndex = PlayerPrefs.GetInt("verseIndex", 0);
}

function Start () {
	LoadVerses();
	Load();
}

function Update () {

}