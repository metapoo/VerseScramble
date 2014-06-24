#pragma strict
@script RequireComponent(AudioSource);

public enum Difficulty {Easy, Medium, Hard, Impossible};

var mainCam : Camera;
var wordLabel : WordLabel;
var topWall : BoxCollider2D;
var bottomWall: BoxCollider2D;
var leftWall : BoxCollider2D;
var rightWall : BoxCollider2D;
var verseReference : GUIText;
var verseReferenceShadow : GUIText;
var feedbackLabel : GUIText;
var finished : boolean = false;
var references : Array = new Array();
var difficulty : Difficulty = Difficulty.Easy;
var scoreManager : ScoreManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var timeUntilHint : int ;
var exitButton : BoxCollider2D;
var hintButton : BoxCollider2D;
var refreshButton : BoxCollider2D;
var background : SpriteRenderer;
var bgSprite1 : Sprite;
var bgSprite2 : Sprite;
var bgSprite3 : Sprite;
var bgSprite4 : Sprite;
var bgSprite5 : Sprite;
var sndSuccess1 : AudioClip;
var sndSuccess2 : AudioClip;
var sndFailure1 : AudioClip;
public var endOfGameOptions : EndOfGameOptions;
public var numWordsReleased : int = 0;
public var gameStarted : boolean = false;
public var showingSolution : boolean = false;

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

}

function CanShowSolution() {
	return (numWordsReleased == wordObjects.length) && (!showingSolution)
	&& (wordIndex < wordObjects.length) && gameStarted;	
}

function ShowSolution() {
	if (!CanShowSolution()) return;
	
	showingSolution = true;
	
	for (var i=wordIndex;i<wordObjects.length;i++) {
		var wordObject : WordLabel = wordObjects[i];
		wordObject.returnToVerse();
	}
}

function SetupWalls () {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;

	topWall.size = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(w*2.0f, 0f, 0f)).x, 1f);
	topWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, h,0f)).y + 0.5f);	
	
	bottomWall.size = topWall.size;
	bottomWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).y - 0.5f);	
	
	leftWall.size = new Vector2(1f, mainCam.ScreenToWorldPoint(new Vector3(0f, h*100.0f, 0f)).y);
	leftWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).x - 0.5f, 0f);	
	
	rightWall.size = leftWall.size;
	rightWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(w, 0f, 0f)).x+0.5f, 0f);
	
	var y : float = mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).y+0.75f;
	var baseX : float = mainCam.ScreenToWorldPoint(new Vector3(w, 0f, 0f)).x;
	exitButton.transform.position = new Vector3(baseX - 0.75f,
									  y,
									  0);
	hintButton.transform.position = new Vector3(baseX-2.0f,
									  y,
									  0);
	refreshButton.transform.position = new Vector3(baseX-3.25f,
									  y,
									  0);
									  
	screenBounds = Rect(leftWall.center.x,topWall.center.y,
	rightWall.center.x-leftWall.center.x,
	topWall.center.y-bottomWall.center.y);
}

function HandleWordWrong() {
	audio.PlayOneShot(sndFailure1, 2.0f);
	return scoreManager.HandleWordWrong();
}

function HandleWordCorrect() {
	var elapsedTime : float = Time.time - lastWordTime;
	lastWordTime = Time.time;
	
	var snd : AudioClip = sndSuccess1;
	if (Random.RandomRange(0,10.0f) > 5.0f) {
		snd = sndSuccess2;
	}
	audio.PlayOneShot(snd, 1.0);
	return scoreManager.HandleWordCorrect(elapsedTime);
}

function SetupUI() {
	feedbackLabel.text = "";
}

function showFeedback(feedbackText : String, time : float) {
	feedbackLabel.text = feedbackText;
	yield WaitForSeconds(time);
	feedbackLabel.text = "";
}

function ShowEndOfGameOptions() {
	Instantiate(endOfGameOptions, new Vector3(0,0,0), Quaternion.identity);	
}

function nextWord() {
	if (wordIndex == -1) return null;
	wordHinted = false;
	wordIndex += 1;
	if (wordIndex >= words.length) {
		currentWord = null;
		wordIndex = -1;
		
		if (!showingSolution) {
			showFeedback("Awesome!",3);
			HandleVerseFinished();
		} else {
			ShowEndOfGameOptions();
		}
		return null;
	}
	currentWord = words[wordIndex];
	return currentWord;
}


function resizeBackground() {

	var w = background.sprite.bounds.size.x;
	var h = background.sprite.bounds.size.y;
	var camW = mainCam.pixelWidth;
	var camH = mainCam.pixelHeight;
	var camX = 2*mainCam.ScreenToWorldPoint(new Vector3(camW, 0f, 0f)).x;
	var camY = 2*mainCam.ScreenToWorldPoint(new Vector3(0f, camH, 0f)).y;
	background.transform.localScale.x = camX/w;
	background.transform.localScale.y = camY/h;
}

function Translation (thisTransform : Transform, startPos : Vector3, endPos : Vector3, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.position = Vector3.Lerp(startPos, endPos, t);
		yield; 
	}
}

function ScaleOverTime (thisTransform : Transform, startScale : Vector3, endScale : Vector3, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.localScale = Vector3.Lerp(startScale, endScale, t);
		yield;
	}
}

function ChangeFontOverTime (guiText : GUIText, startFont : float, endFont : float, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		guiText.fontSize = startFont + (endFont - startFont) *t;
		yield;
	}
}


function moveReferenceToTopLeft() {
	var duration : float = 0.5;
	var refRect : Rect = verseReference.GetScreenRect();
	var rectSize : Vector2 = new Vector2(refRect.width / Screen.width, refRect.height / Screen.height);
	var center : Vector3 = new Vector3(0.5,0.5,1);
	var centerS : Vector3 = new Vector3(0.5,0.5,0);
	var destination : Vector3 = new Vector3(0.05f+rectSize.x*0.5, 0.975-rectSize.y*0.5,1);
	var destinationS : Vector3 = new Vector3(destination.x, destination.y, 0);
	Debug.Log("width = " + rectSize.x + " height = " + rectSize.y);
	
	Translation(verseReference.transform, center, destination, duration);
	Translation(verseReferenceShadow.transform, centerS, destinationS, duration);
	
	yield WaitForSeconds(duration);
	SetVerseReference(verseManager.currentReference(), true);
}

function AnimateIntro() {
	var center : Vector3 = new Vector3(0.5,0.5,1);
	var centerS : Vector3 = new Vector3(0.5,0.5,0);
	var duration : float = 0.25f;
	verseReference.transform.position = center;
	verseReferenceShadow.transform.position = centerS;
	
	var startScale : Vector3 = new Vector3(1.0f,1.0f,1.0f);
	var endScale : Vector3 = new Vector3(0.5,0.5,1.0f);
	var startFont : float = 50;
	var endFont : float = 22;
	
	ChangeFontOverTime(verseReference, 1, startFont, duration);
	ChangeFontOverTime(verseReferenceShadow, 1, startFont, duration);
	
	verseManager.SpeakUtterance(verseManager.currentReference());
	
	yield WaitForSeconds(2.0f);
	
	ChangeFontOverTime(verseReference, startFont, endFont, duration);
	ChangeFontOverTime(verseReferenceShadow, startFont, endFont, duration);
	
	yield WaitForSeconds(duration);
	
	moveReferenceToTopLeft();	
	
	//ScaleOverTime(verseReference.transform, startScale, endScale, duration);
	//ScaleOverTime(verseReferenceShadow.transform, startScale, endScale, duration);
	
	
}

function Start() {
	
	difficulty = verseManager.GetCurrentDifficulty();
	
	SetupWalls();
	SetupUI();
	SetupVerse();
	SetupBackground();
	AnimateIntro();
}

function SetupBackground() {
	var index : int = Random.Range(0,5);
	var sprite : Sprite = bgSprite1;
	
	switch (index) {
		case 0: sprite = bgSprite1; break;
		case 1: sprite = bgSprite2; break;
		case 2: sprite = bgSprite3; break;
		case 3: sprite = bgSprite4; break;
		case 4: sprite = bgSprite5; break;
	}
	background.sprite = sprite;
	resizeBackground();
}

function SetVerseReference (reference : String, showDifficulty : boolean) {
	var diffString = verseManager.DifficultyToString(verseManager.GetCurrentDifficulty());
	
	if (showDifficulty) {
		verseReference.text = String.Format("{0}\n{1}",reference, diffString);
	} else {
		verseReference.text = reference + "\n";
	}
	
	verseReferenceShadow.text = verseReference.text;
}

function SplitVerse(verse : String) {
	var langConfig : Hashtable = new Hashtable({'en':[22,12,6],
								  				'zh':[10,6,4]});
	var language : String = verseManager.GetLanguage();
	var phraseLengths : Array = langConfig[language];
	var clauseBreakMultiplier = 1.5f;
	var difficultyInt = verseManager.GetDifficultyFromInt(difficulty);
	var phraseLength : int = phraseLengths[difficultyInt];
	
	if (difficulty == Difficulty.Hard) {
		clauseBreakMultiplier = 2.0f;
	}
	
	Debug.Log("phrase length = " + phraseLength);
	var clauseArray : Array = new Array();
	var phraseArray : Array = new Array();
	var seps = ["、","，", "，","。","！","；","：","?",",",";",":","？","."];
	var clause = "";
	
	var paransRe:Regex = new Regex("(.*)");
	
	// filter out paranthesis
	verse = Regex.Replace(verse, "\\(.*\\)","");
	verse = Regex.Replace(verse, "\\（.*\\）","");
	
	for (var c in verse) {
		clause = clause + c;
		for (var s in seps) {
			if (s == c) {
				if ((clause != "") && (clause != " ") && (clause != "  ")) {
					clauseArray.push(clause);
					Debug.Log("clause : " + clause);
				}
				clause = "";
			}
		}
	}
	
	if ((clause != "") && (clause != " ") && (clause != "  ")) {
		clauseArray.push(clause);
		Debug.Log("clause : " + clause);
	}
	
		
	var phrase : String = "";
	var newPhrase : String = "";
	var phraseLengthForClause : int;
	
	
	var phraseHasPunctuation = function(phrase : String) {
		for (var sc in seps) {
			if (phrase.Contains(sc)) {
				return true;
			}
		}
		return false;
	};
	
	for (clause in clauseArray) {
		if (clause.Length > phraseLength*clauseBreakMultiplier) {
			
			var divisor = Mathf.RoundToInt(1.0f*clause.Length/phraseLength);
			var l : int = 0;
			Debug.Log("clause = " + clause + " divisor = " + divisor + " clause length = " + clause.Length + " l = " + l);
			while (l < clause.Length) {
				if (difficulty == Difficulty.Hard) {
					phraseLengthForClause = phraseLength;
					Debug.Log("pA = " + phraseLengthForClause);
				} else {
					phraseLengthForClause = Mathf.RoundToInt(clause.Length/divisor);
					Debug.Log("pB = " + phraseLengthForClause);
				}
				
				if ((l + phraseLengthForClause) > clause.Length) {
					phraseLengthForClause = clause.Length - l;
					Debug.Log("pC = " + phraseLengthForClause);			
				}
				
				if (language == "en") {
					while (((l + phraseLengthForClause) < clause.Length) &&
						   (clause[l+phraseLengthForClause] != " ") ) {
						phraseLengthForClause += 1;
					}
				}
				
				phrase = clause.Substring(l, phraseLengthForClause);

				if (language == "zh") {
					// allowances if punctuation is in phrase
					if ((l + phraseLengthForClause + 2) < clause.Length)
					 {
						if (phraseHasPunctuation(phrase)) {
							phraseLengthForClause += 2;
							phrase = clause.Substring(l, phraseLengthForClause);
							Debug.Log("pD = " + phraseLengthForClause);			
						}
					// if punctuation makes up a big percentage then combine it with previous phrase
					} else if (phraseLengthForClause <= 4) {
						if (phraseHasPunctuation(phrase)) {
							phraseArray[phraseArray.length-1] += phrase;
							l = l + phraseLengthForClause;
							Debug.Log("pE = " + phraseLengthForClause);		
							Debug.Log("modify previous phrase to: " + phraseArray[phraseArray.length-1]);	
							break;
						}
					}
				}
				
				l = l + phraseLengthForClause;
				
				if ((phrase != "") && (phrase != " ") && (phrase != "  ")) {
					phraseArray.push(phrase);
					Debug.Log("phrase = " + phrase);
				}
			}	
		} else {
			phraseArray.push(clause);
			Debug.Log("phrase is whole clause = " + phrase);
		}
	}
	return phraseArray;

}

function SplitVerseWordByWord(verse : String) {

	var phraseLength = 5;
	var language = verseManager.GetLanguage();
	
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

function Cleanup () {
	scoreManager.resetStats();
	var wObject : WordLabel;
	for (wObject in wordObjects) {
		Destroy(wObject.gameObject);
	}
	wordObjects.Clear();
	
}

function SetupVerse() {
	gameStarted = false;
	showingSolution = false;
	scoreManager.reset();
	finished = false;
	difficulty = verseManager.GetCurrentDifficulty();
	
	Cleanup();
	lastWordTime = Time.time;
	
	var clone : WordLabel;
	
	var reference = verseManager.currentReference();
	SetVerseReference(reference, false);
	verseMetadata = verseManager.GetVerseMetadata(reference);
	Debug.Log("verse difficulty is " + verseMetadata["difficulty"]);	
	if (verseMetadata["difficulty"] != null) {
		//difficulty = GetDifficultyFromInt(verseMetadata["difficulty"]);
	}
	
	var verse : String = verseManager.currentVerse();
	words = SplitVerse(verse);
	wordIndex = 0;
	currentWord = words[wordIndex];
	scoreManager.maxTime = scoreManager.CalculateMaxTime();
	
	var dy = screenBounds.y;
	
	for (word in words) {
		clone = Instantiate(wordLabel, new Vector3(0,0,0), Quaternion.identity);
		clone.setWord(word);
		wordObjects.push(clone);
		var w = clone.renderer.bounds.size.x;
		var h = clone.renderer.bounds.size.y;
		var x = Random.Range(screenBounds.x+w*0.5,screenBounds.x+screenBounds.width-w*0.5);
		var y = screenBounds.y+h*2;
		clone.transform.position = new Vector3(x,y,0);
		clone.rigidbody2D.isKinematic = true;
	}
	
	yield WaitForSeconds(2.5f);
	
	
	numWordsReleased = 0;	
	while (numWordsReleased < wordObjects.length) {
		numWordsReleased = releaseWords(numWordsReleased) + 1;
		yield WaitForSeconds(1.5f);
		// start game on second round
		if (!gameStarted) {
			gameStarted = true;
			scoreManager.resetTime();
		}
	}
	numWordsReleased = wordObjects.length;
	
	
}

 function releaseWords(index: int) {
 	Debug.Log("release words index = " + index);
 
	var groupSize : int = 3;
	
	switch(difficulty) {
		case Difficulty.Medium:
			groupSize = 4;
			break;
		case Difficulty.Hard:
			groupSize = 5;
			break;
		default:
			break;
	}

	var c : int  = 0;
	
	for (var i : int=index;i<wordObjects.length;i++) {
		var wordObject : WordLabel = wordObjects[i];
		var h = wordObject.renderer.bounds.size.y;

		wordObject.transform.position.y = screenBounds.y+h*2;
		wordObject.rigidbody2D.isKinematic = false;
		c += 1;	
		if (c == groupSize) {
			break;
		}
	}
	return i;
}

function StartNextDifficulty() {
	verseManager.upgradeDifficultyForVerse(verseMetadata);
	SetupVerse();
}

function StartAnotherVerse() {
	verseManager.GotoNextVerse();
	SetupVerse();
	SetupBackground();
}

function HandleVerseFinished() {
	finished = true;
	gameStarted = false;
	yield WaitForSeconds(1);
	Debug.Log("verse finished");
	scoreManager.HandleFinished();	
}

function ShowHint() {
	wordHinted = true;	
	var wObject : WordLabel;
	var dScore = -1*scoreManager.maxTime;
	
	for (wObject in wordObjects) {
		if ((wObject.word == currentWord) && !wObject.returnedToVerse && !wObject.gotoVerse) {
			wObject.HintAt();
			return scoreManager.HandleWordWrong();
		}
	}
	return 0;
}

function Update () {
	var elapsedTime : float = Time.time - lastWordTime;
	
	if (!wordHinted && !finished && (elapsedTime > timeUntilHint)) {
		ShowHint();
	}
}