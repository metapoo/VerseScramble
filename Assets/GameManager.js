#pragma strict
@script RequireComponent(AudioSource);

public enum Difficulty {Easy, Medium, Hard, Impossible};

var mainCam : Camera;
var wordLabel : WordLabel;
var topWall : BoxCollider2D;
var bottomWall: BoxCollider2D;
var leftWall : BoxCollider2D;
var rightWall : BoxCollider2D;
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
var sndSuccess1 : AudioClip;
var sndSuccess2 : AudioClip;
var sndFailure1 : AudioClip;
var sndExplode1 : AudioClip;
var feedbackLabel : TextMesh;
var timeLabel : TextMesh;
var scoreLabel : TextMesh;
var highScoreLabel : TextMesh;
var referenceLabel : TextMesh;
var healthBar : HealthBar;

public var needToSelectDifficulty : boolean = true;
public var difficultyOptions : DifficultyOptions;
public var endOfGameOptions : EndOfGameOptions;
public var numWordsReleased : int = 0;
public var gameStarted : boolean = false;
public var showingSolution : boolean = false;
public var DidRanOutOfTime : boolean = false;

private var wordHinted : boolean = false;

static var currentWord : String;
static var words : Array = new Array();
static var wordLabels : Array = new Array();
static var wordIndex : int;
static var score = 0;
static var highScore = 0;
static var screenBounds : Rect;
static var screenBoundsComputed : boolean = false;
static var streak : int = 0;
static var moves : int = 0;
static var lastWordTime : float;
static var challengeModeState : int = -1;

private var windowRect : Rect;

static function SetChallengeModeEnabled(enabled : boolean) {
	var enabledInt = 0;
	if (enabled) enabledInt = 1;
	challengeModeState = enabledInt;
	PlayerPrefs.SetInt("challenge_mode", enabledInt);
}

static function GetChallengeModeEnabled() {
	if (challengeModeState == -1) {
		return PlayerPrefs.GetInt("challenge_mode") == 1;
	} else {
		return challengeModeState == 1;
	}
}


function OnGUI() {

}

function CanShowSolution() {
	return (numWordsReleased == wordLabels.length) && (!showingSolution)
	&& (wordIndex < wordLabels.length) && gameStarted && 
	(!GetChallengeModeEnabled());	
}

function ShowSolution() {
	if (!CanShowSolution()) return;
	
	showingSolution = true;
	
	for (var i=wordIndex;i<wordLabels.length;i++) {
		var wordObject : WordLabel = wordLabels[i];
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
									  
	screenBounds = Rect(leftWall.center.x+0.5,topWall.center.y-0.5,
	rightWall.center.x-leftWall.center.x-1.0,
	topWall.center.y-bottomWall.center.y-1.0);
	
	screenBoundsComputed = true;
}

function HandleWordWrong() {
	
	if (!GetChallengeModeEnabled()) {
		ShowHint();
		audio.PlayOneShot(sndFailure1, 0.5f);
		
	}
	
	if (!healthBar.IsEmpty()) {
		return;
	}
	
	if (finished) return;
	
	audio.PlayOneShot(sndExplode1, 1.0f);
	
	for (var wordLabel :WordLabel in wordLabels) {
		wordLabel.Explode();
	}
	
	
	if (!GetChallengeModeEnabled()) {
		scoreManager.maxTime += wordIndex;
	}
	
	wordIndex = 0;
	currentWord = words[wordIndex];
}

function HandleWordCorrect() {
	var elapsedTime : float = Time.time - lastWordTime;
	lastWordTime = Time.time;
	
	var snd : AudioClip = sndSuccess1;
	if (Random.RandomRange(0,10.0f) > 5.0f) {
		snd = sndSuccess2;
	}
	audio.PlayOneShot(snd, 0.2);
	return scoreManager.HandleWordCorrect(elapsedTime);
}

function SetupUI() {
	feedbackLabel.renderer.enabled = false;
	
	var w = screenBounds.width;
	var h = screenBounds.height;
	
	feedbackLabel.transform.position =	new Vector3(screenBounds.x+w*0.5,
												screenBounds.y-h*0.7,1);
	scoreLabel.transform.position = new Vector3(screenBounds.x+w*0.98,
												screenBounds.y-h*0.02,1);
	var p = scoreLabel.transform.position;
	var s = scoreLabel.renderer.bounds.size;
	
	highScoreLabel.transform.position = new Vector3(screenBounds.x+w*0.98,
													p.y-s.y*1.1f,1);							
	timeLabel.transform.position = new Vector3(screenBounds.x+w*0.5,
											   screenBounds.y-h*0.02,1);

	healthBar.maxLength = w*0.4;										   
	healthBar.SetPercentage(healthBar.targetPercentage);
	
	var v = referenceLabel.renderer.bounds.size;
	healthBar.transform.position = Vector3(screenBounds.x+screenBounds.width*0.02, 
	screenBounds.y-screenBounds.height*0.04-v.y*0.5);

}

function showFeedback(feedbackText : String, time : float) {
	feedbackLabel.renderer.enabled = true;
	AnimationManager.SetTextMeshAlpha(feedbackLabel, 1.0);
	var animDuration = 0.25f;
	AnimationManager.ScaleOverTime(feedbackLabel.transform, Vector3(0,0,1), Vector3(0.1,0.1,1), animDuration);
	feedbackLabel.text = feedbackText;
	yield WaitForSeconds(time+animDuration);
	// there could be another feedback animation running, in which case we want to let that one take over
	if (feedbackText == feedbackLabel.text) {
		AnimationManager.FadeOverTime(feedbackLabel,1.0,0.0,animDuration);
	}
}

function ShowEndOfGameOptions() {
	Instantiate(endOfGameOptions, new Vector3(0,0,0), Quaternion.identity);	
}

function ShowDifficultyOptions() {
	Instantiate(difficultyOptions, new Vector3(0,0,0), Quaternion.identity);
}

function EnableWordColliders() {
	var wordLabel : WordLabel;

	for (wordLabel in wordLabels) {
		wordLabel.collider2D.enabled = true;
	}
}

function nextWord() {
	if (wordIndex == -1) return null;
	wordHinted = false;
	wordIndex += 1;
	if (wordIndex >= words.length) {
		currentWord = null;
		wordIndex = -1;
		
		EnableWordColliders();
		if (!showingSolution) {
			showFeedback(TextManager.GetText("Awesome!"),3);
			HandleVerseFinished();
		} else {
			ShowEndOfGameOptions();
		}
		return null;
	}
	currentWord = words[wordIndex];
	return currentWord;
}


function moveReferenceToTopLeft() {
	var duration : float = 0.5;
	var start : Vector3 = referenceLabel.transform.position;
	var refSize = referenceLabel.renderer.bounds.size;
	var destination : Vector3 = new Vector3(screenBounds.x+refSize.x*0.5+screenBounds.width*0.02, 
	screenBounds.y-refSize.y*0.5-screenBounds.height*0.02, 1);
	
	
	AnimationManager.Translation(referenceLabel.transform, start, destination, duration);
	
	yield WaitForSeconds(duration);
	
	SetVerseReference(verseManager.currentReference(), false);
}


function AnimateIntro() {
	var center : Vector3 = new Vector3(0.0,0.0,1);
	
	var duration : float = 0.25f;
	referenceLabel.transform.position = center;
	var w = Screen.width;
	var startScale : Vector3 = new Vector3(0.12f,0.12f,1.0f);
	var endScale : Vector3 = new Vector3(0.06f,0.06f,1.0f);
	
	AnimationManager.ScaleOverTime(referenceLabel.transform, Vector3(0,0,0), startScale, duration);
	
	verseManager.SayVerseReference();	

	yield WaitForSeconds(2.0f);
	
	AnimationManager.ScaleOverTime(referenceLabel.transform, startScale, endScale, duration);
	
	yield WaitForSeconds(duration);
	
	moveReferenceToTopLeft();	
	
	
}

function Start() {

	TextManager.LoadLanguage(verseManager.GetLanguage());
	difficulty = verseManager.GetCurrentDifficulty();
	
	SetupWalls();
	SetupUI();
	SetVerseReference("",false);
	
	DidRanOutOfTime = false;
	
	if (GetChallengeModeEnabled()) {
		if (verseManager.verseIndex == 0) {
			ShowDifficultyOptions();
		} else {
			BeginGame();
		}
	} else {
		if (needToSelectDifficulty && 
		    (verseManager.GetCurrentDifficultyAllowed() != Difficulty.Easy)) {
			ShowDifficultyOptions();
		} else {
			BeginGame();
		}
	
		needToSelectDifficulty = true;
	}
}

function SetVerseReference (reference : String, showDifficulty : boolean) {
	var diffString = verseManager.DifficultyToString(verseManager.GetCurrentDifficulty());
	
	if (showDifficulty) {
		referenceLabel.text = String.Format("{0}\n{1}",reference, diffString);
	} else {
		referenceLabel.text = reference + "\n";
	}
	
}

function SplitVerse(verse : String) {
	var langConfig : Hashtable = new Hashtable({'en':[20,10,5],
								  				'zh':[20,10,5]});
	var language : String = verseManager.GetLanguage();
	var phraseLengths : Array = langConfig[language];
	var clauseBreakMultiplier = 1.0f;
	var difficultyInt = verseManager.GetDifficultyFromInt(difficulty);
	var phraseLength : int = phraseLengths[difficultyInt];
	
	if (difficulty == Difficulty.Hard) {
		clauseBreakMultiplier = 2f;
	}
	
	//Debug.Log("SplitVerse = " + verse );
	
	//Debug.Log("phrase length = " + phraseLength);
	var clauseArray : Array = new Array();
	var phraseArray : Array = new Array();
	var seps = ["、","，", "，","。","！","；","：","?",",",";",":","？",".","’","”","!"];
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
					//Debug.Log("clause : " + clause);
				}
				clause = "";
			}
		}
	}
	
	
	if ((clause != "") && (clause != " ") && (clause != "  ")) {
		clauseArray.push(clause);
		//Debug.Log("clause : " + clause);
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
		// check for special '\' marker which we cannot split on
		var nobreakMarkers = new Array();
		for (var i=0;i<clause.Length;i++) {
			if ((clause[i] == "／"[0]) || (clause[i] == "/"[0]) || (clause[i] == " "[0])) {
				nobreakMarkers.Add(i);
			}
		}

		//Debug.Log("clause.Length > phraseLength*clauseBreakMultiplier = " + clause.Length + " " + phraseLength + " "+ clauseBreakMultiplier);
		if (clause.Length > phraseLength*clauseBreakMultiplier) {
			
			var divisor = Mathf.RoundToInt(1.0f*clause.Length/phraseLength);
			var l : int = 0;
			
			while (l < clause.Length) {
				if (difficulty == Difficulty.Hard) {
					phraseLengthForClause = phraseLength;
				} else {
					phraseLengthForClause = Mathf.RoundToInt(clause.Length/divisor);
				}
				
				if ((l + phraseLengthForClause) > clause.Length) {
					phraseLengthForClause = clause.Length - l;	
				}
				

				while (((l + phraseLengthForClause) < clause.Length) &&
							 (clause[l+phraseLengthForClause] != " ") ) {
							phraseLengthForClause += 1;
				}

				
				// find closest '/' to glob onto
				if (nobreakMarkers.length > 0) {
					var best = 100;
					var bestIndex = -1;
					for (var index : int in nobreakMarkers) {
						var diff = Mathf.Abs(index - (phraseLengthForClause + l));
						if ((diff < best) && (index >= l)) {
							bestIndex = index;
							best = diff;
						}
					}
					if (bestIndex != -1) {
						phraseLengthForClause = bestIndex+1-l;
					}
				}
				
				phrase = clause.Substring(l, phraseLengthForClause);
				
				// filter out no break markers
				phrase = phrase.Replace("／","");
				phrase = phrase.Replace("/","");
				
				if (language == "zh") { phrase = phrase.Replace(" ",""); }
				
				// filter out leading or trailing spaces
				if (phrase[0] == " ") {
					phrase = phrase.Substring(1,phrase.Length-1);
				}
				//Debug.Log("phrase.Length = " + phrase.Length);
				if ((phrase.Length > 0) && (phrase[phrase.Length-1] == " ")) {
					phrase = phrase.Substring(0,phrase.Length-1);
				}

				
				l = l + phraseLengthForClause;
				
				if ((phrase != "") && (phrase != " ") && (phrase != "  ")) {
					if (language == "zh") {phrase = phrase.Replace(" ","");}
					phraseArray.push(phrase);
					
				}
			}	
		} else {
			// filter out no break markers
			clause = clause.Replace("／","");
			clause = clause.Replace("/","");
			if (language == "zh") {clause = clause.Replace(" ","");}
			phraseArray.push(clause);
			
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
			phraseLength = 15;
			break;
		case Difficulty.Hard:
			phraseLength = 10;
			break;
	}
	//Debug.Log("phrase length = " + phraseLength);

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
		//Debug.Log("Phrase = "+ phrase);
		phraseArray.push(phrase);
	}
	return phraseArray;
}

function Cleanup () {
	var wObject : WordLabel;
	for (wObject in wordLabels) {
		Destroy(wObject.gameObject);
	}
	wordLabels.Clear();
	
}

function BeginGame() {
	SetupVerse();
	AnimateIntro();
}

function SetupVerse() {
	gameStarted = false;
	showingSolution = false;
	
	if (GetChallengeModeEnabled()) {
		scoreManager.resetStatsForChallenge();
	} else {
		scoreManager.reset();
	}
	finished = false;
	difficulty = verseManager.GetCurrentDifficulty();
	
	Cleanup();
	lastWordTime = Time.time;
	
	var clone : WordLabel;
	
	var reference = verseManager.currentReference();
	SetVerseReference(reference, false);
	verseMetadata = verseManager.GetVerseMetadata(reference);
	//Debug.Log("verse difficulty is " + verseMetadata["difficulty"]);	
	if (verseMetadata["difficulty"] != null) {
		//difficulty = GetDifficultyFromInt(verseMetadata["difficulty"]);
	}
	
	var verse : String = verseManager.currentVerse();
	words = SplitVerse(verse);
	wordIndex = 0;
	currentWord = words[wordIndex];
	
	if (GetChallengeModeEnabled() && (verseManager.verseIndex > 0)) {
		var maxTime = scoreManager.CalculateMaxTime() + scoreManager.maxTime;		
		scoreManager.CountTimeUpTo(maxTime);
		
		var duration = 0.1f*(maxTime-scoreManager.maxTime);
		if ((duration) > 2.0f) duration = 2.0f;
		
		yield WaitForSeconds(duration);
		scoreManager.resetTime();
	} else {
		scoreManager.maxTime = scoreManager.CalculateMaxTime();
	}
	
	var dy = screenBounds.y;
	
	for (word in words) {
		clone = Instantiate(wordLabel, new Vector3(0,0,0), Quaternion.identity);
		clone.setWord(word);
		wordLabels.push(clone);
		var w = clone.renderer.bounds.size.x;
		var h = clone.renderer.bounds.size.y;
		var x = Random.Range(screenBounds.x+w*0.5,screenBounds.x+screenBounds.width-w*0.5);
		var y = screenBounds.y+screenBounds.height+h*2;
		clone.transform.position = new Vector3(x,y,0);
		clone.rigidbody2D.isKinematic = true;
	}
	
	yield WaitForSeconds(2.5f);
	
	
	numWordsReleased = 0;	
	while (numWordsReleased < wordLabels.length) {
		numWordsReleased = releaseWords(numWordsReleased) + 1;
		yield WaitForSeconds(1.5f);
		// start game on second round
		if (!gameStarted) {
			gameStarted = true;
			scoreManager.resetTime();
		}
	}
	numWordsReleased = wordLabels.length;
	
}

 function releaseWords(index: int) {
 	//Debug.Log("release words index = " + index);
 
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
	
	for (var i : int=index;i<wordLabels.length;i++) {
		var wordObject : WordLabel = wordLabels[i];
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
	BeginGame();
}

function StartAnotherVerse() {
	verseManager.GotoNextVerse();
	BeginGame();
}

function HandleRanOutOfTime() {
	DidRanOutOfTime = true;

	if (GetChallengeModeEnabled()) {
		for (var wordLabel : WordLabel in wordLabels) {
			wordLabel.collider2D.enabled = false;
		}
	
		HandleVerseFinished();
	}

}

function HandleVerseFinished() {
	if (GetChallengeModeEnabled() &&
		!verseManager.IsAtFinalVerseOfChallenge() &&
		!DidRanOutOfTime) {
		finished = true;
		yield WaitForSeconds(4);
		StartAnotherVerse();
	} else {
		finished = true;
		gameStarted = false;
		yield WaitForSeconds(1);
		//Debug.Log("verse finished");
		scoreManager.HandleFinished();
	}
}

function ShowHint() {
	wordHinted = true;	
	var wObject : WordLabel;
	
	for (wObject in wordLabels) {
		if ((wObject.word == currentWord) && !wObject.returnedToVerse && !wObject.gotoVerse) {
			wObject.HintAt();
		}
	}
}

function Update () {
	var elapsedTime : float = Time.time - lastWordTime;
	
	if (!wordHinted && !finished && (elapsedTime > timeUntilHint)) {
		ShowHint();
	}
}