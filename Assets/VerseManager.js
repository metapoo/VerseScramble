#pragma strict

var verses : Array = new Array();
var references : Array = new Array();
var verseIndex = 0;
var verseText : TextAsset;

function currentVerse() {
	return verses[verseIndex];
}

function currentReference() {
	return references[verseIndex];
}

function GotoNextVerse() {
	verseIndex += 1;
}

function LoadVerses() {
  	var lines = verseText.text.Split("\n"[0]);
  	var line : String;
  	for (line in lines) {
  		Debug.Log(line);
  		var parts = line.Split([": "], System.StringSplitOptions.None);
  		if (parts.Length != 2) continue;
  		
  		var verse = parts[1];
  		var badLetter : String;
  		for (badLetter in new Array(",",":",".","“","”",";")) {
	  		verse = verse.Replace(badLetter,"");
	  	}
	  	for (badLetter in new Array("-","—","  ","\t")) {
	  		verse = verse.Replace(badLetter," ");
	  	}
	  	
  		var reference = parts[0];
  		verses.push(verse);
  		references.push(reference);
  		Debug.Log("parts[1] = " + parts[1]);
  		Debug.Log("reference = " + reference + " verse = " + verse);
  	}
}


function Start () {
	LoadVerses();
}

function Update () {

}