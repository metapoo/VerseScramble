#pragma strict

public enum Difficulty {Easy, Medium, Hard};

var mainCam : Camera;
var wordLabel : WordLabel;
var endOfGameOptions : EndOfGameOptions;
var topWall : BoxCollider2D;
var bottomWall: BoxCollider2D;
var leftWall : BoxCollider2D;
var rightWall : BoxCollider2D;
var verseReference : GUIText;
var scoreLabel : GUIText;
var feedbackLabel : GUIText;
var finished : boolean = false;
var references : Array = new Array();
var difficulty : Difficulty = Difficulty.Easy;
var scoreManager : ScoreManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var timeUntilHint : int = 15;

private var wordHinted : boolean = false;

static var currentWord : String;
static var words : Array = new Array();
static var wordObjects : Array = new Array();
static var wordIndex : int;
static var score = 0;
static var highScore = 0;
static var screenBounds : Rect;
static var streak : int = 0;
static var moves : int = 0;
static var lastWordTime : float;

private var windowRect : Rect;


function OnGUI() {
    var screenScale: float = Screen.width / 480.0;
    var scaledMatrix: Matrix4x4 = Matrix4x4.identity.Scale(Vector3(screenScale,screenScale,screenScale));
    GUI.matrix = scaledMatrix;
}

function SetupWalls () {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;

	topWall.size = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(w*2.0f, 0f, 0f)).x, 1f);
	topWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, h,0f)).y + 0.5f);	
	
	bottomWall.size = topWall.size;
	bottomWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).y - 0.5f);	
	
	leftWall.size = new Vector2(1f, mainCam.ScreenToWorldPoint(new Vector3(0f, h*2.0f, 0f)).y);
	leftWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).x - 0.5f, 0f);	
	
	rightWall.size = leftWall.size;
	rightWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(w, 0f, 0f)).x+0.5f, 0f);

	screenBounds = Rect(leftWall.center.x,topWall.center.y,
	rightWall.center.x-leftWall.center.x,
	topWall.center.y-bottomWall.center.y);
}

function HandleWordWrong() {
	scoreManager.HandleWordWrong();
}

function HandleWordCorrect() {
	var elapsedTime : float = Time.time - lastWordTime;
	lastWordTime = Time.time;
	scoreManager.HandleWordCorrect(elapsedTime);
}

function SetupUI() {
	feedbackLabel.text = "";
}

function showFeedback(feedbackText : String, time : float) {
	feedbackLabel.text = feedbackText;
	yield WaitForSeconds(time);
	feedbackLabel.text = "";
}

function nextWord() {
	if (wordIndex == -1) return null;
	wordHinted = false;
	wordIndex += 1;
	if (wordIndex >= words.length) {
		currentWord = null;
		wordIndex = -1;
		showFeedback("Awesome!",3);
		finished = true;
		return null;
	}
	currentWord = words[wordIndex];
	return currentWord;
}

function Start () {
	Application.targetFrameRate = 60;
	difficulty = Difficulty.Easy;
	
	SetupWalls();
	SetupUI();
	SetupVerse();
}

function SetVerseReference (reference : String) {
	verseReference.text = reference;
}

function SplitVerse (verse : String) {
	var phraseLength = 5;
	switch (difficulty) {
		case Difficulty.Easy:
			phraseLength = 20;
			break;
		case Difficulty.Medium:
			phraseLength = 12;
			break;
		case Difficulty.Hard:
			phraseLength = 6;
			break;
	}
	Debug.Log("phrase length = " + phraseLength);
	var wordsArray : Array;
	var phraseArray : Array = new Array();
	wordsArray = verse.Split(" "[0]);
	var phrase : String = "";
	var newPhrase : String = "";
	for (word in wordsArray) {
		newPhrase = phrase + word + " ";
		if (newPhrase.Length > phraseLength) {
		  var newPhraseDiff = Mathf.Abs(newPhrase.Length - phraseLength);
		  var phraseDiff = Mathf.Abs(phrase.Length - phraseLength);
		  if ((newPhraseDiff < phraseDiff) || (phrase == "")) {
			  phraseArray.push(newPhrase);
			  phrase = "";
		  } else {
		      // use previous phrase if it's closer to the limit
		  	  phraseArray.push(phrase);
		  	  phrase = word + " ";
		  }
		} else {
		  phrase = newPhrase;
		}
		
	}
	if (phrase != "") {
		phraseArray.push(phrase);
	}
	return phraseArray;
}

function GetDifficultyFromInt(difficultyInt : int) {
	switch(difficultyInt) {
		case 0: return Difficulty.Easy;
		case 1: return Difficulty.Medium;
		case 2: return Difficulty.Hard;
	}
	return Difficulty.Easy;
}

function Cleanup () {
	scoreManager.resetScore();
	var wObject : WordLabel;
	for (wObject in wordObjects) {
		Destroy(wObject.gameObject);
	}
	wordObjects.clear();
}

function SetupVerse() {
	Cleanup();
	lastWordTime = Time.time;
	
	var clone : WordLabel;
	
	var reference = verseManager.currentReference();
	SetVerseReference(reference);
	verseMetadata = verseManager.GetVerseMetadata(reference);
	Debug.Log(verseMetadata["difficulty"]);	
	if (verseMetadata["difficulty"] != null) {
		difficulty = GetDifficultyFromInt(verseMetadata["difficulty"]);
	}
	
	var verse : String = verseManager.currentVerse();
	words = SplitVerse(verse);
	wordIndex = 0;
	currentWord = words[wordIndex];
	
	for (word in words) {
		clone = Instantiate(wordLabel, new Vector3(0,0,0), Quaternion.identity);
		clone.setWord(word);
		wordObjects.push(clone);
		var w = clone.renderer.bounds.size.x;
		var h = clone.renderer.bounds.size.y;
		var x = Random.Range(screenBounds.x+w*0.5,screenBounds.x+screenBounds.width-w*0.5);
		var y = Random.Range(screenBounds.y-screenBounds.height+h*0.5,screenBounds.y-h*0.5);
		clone.transform.position = new Vector3(x,y,0);
	}
}

function StartNextDifficulty() {
	switch(difficulty) {
		case(Difficulty.Easy):
			difficulty = difficulty.Medium;
			break;
		case(Difficulty.Medium):
			difficulty = difficulty.Hard;
			break;
	}
	verseMetadata["difficulty"] = parseInt(difficulty);
	verseManager.SaveVerseMetadata(verseMetadata);
	SetupVerse();
}

function StartAnotherVerse() {
	verseManager.GotoNextVerse();
	SetupVerse();
}

function DelayStartNewVerse() {
		finished = false;
		yield WaitForSeconds(3);
}

function HandleVerseFinished() {
	finished = false;
	yield WaitForSeconds(2);
	Debug.Log("verse finished");
	scoreManager.HandleFinished();
	Instantiate(endOfGameOptions, new Vector3(0,0,0), Quaternion.identity);	
	
}

function Update () {
	var elapsedTime : float = Time.time - lastWordTime;
	if (!wordHinted && (elapsedTime > timeUntilHint)) {
		wordHinted = true;
		scoreManager.mistakes += 1;
		var wObject : WordLabel;
		for (wObject in wordObjects) {
			if (wObject.word == currentWord) {
				wObject.HintAt();
			}
		}
	}
	
	if (finished) {
		HandleVerseFinished();
		//DelayStartNewVerse();
	}
}