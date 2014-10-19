#pragma strict
import UnityEngine;
import UnityEngine.UI;

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
var background : SpriteRenderer;
var sndSuccess1 : AudioClip;
var sndSuccess2 : AudioClip;
var sndSuccess75 : AudioClip;
var sndSuccess50 : AudioClip;
var sndSuccess25 : AudioClip;
var sndSuccess12 : AudioClip;

var sndFailure1 : AudioClip;
var sndExplode1 : AudioClip;
var sndSelect : AudioClip;
var refreshButton : Button;
var hintButton : Button;
var feedbackLabel : Text;
var introReferenceLabel : Text;
var panelReferenceLabel : Text;
var difficultyLabel : Text;
var healthBar : HealthBar;
var wordScale : float;
var setProgressLabel : Text;

public var needToSelectDifficulty : boolean = true;
public var difficultyOptions : DifficultyOptions;
public var endOfGameOptions : EndOfGameOptions;
public var numWordsReleased : int = 0;
public var gameStarted : boolean = false;
public var showingSolution : boolean = false;
public var DidRanOutOfTime : boolean = false;

private var wordHinted : boolean = false;

static var needToRecordPlay : boolean = true;
static var currentWord : String;
static var words : Array = new Array();
static var wordLabels : Array = new Array();
static var scrambledWordLabels : Array = new Array();
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
		return (challengeModeState == 1);
	}
}


function OnGUI() {

}

static function GetReviewURL() {
	var url : String = "https://itunes.apple.com/us/app/verse-rain-fun-bible-verse/id928732025?ls=1&mt=8";
				
	if (Application.platform == RuntimePlatform.Android) {
		url = "https://play.google.com/store/apps/details?id=com.hopeofglory.verserain";
	}
	return url;
}

function ExitToVerseList() {
	audio.PlayOneShot(sndSelect, 1.0f);
	Cleanup();
	Application.LoadLevel("versesets");
}

function CanShowSolution() {
	return (!showingSolution && (wordIndex < wordLabels.length) && gameStarted && !GetChallengeModeEnabled());	
}

function ShowSolution() {
	if (!CanShowSolution()) {
		audio.PlayOneShot(sndFailure1,1.0f);
		return;
	}
	audio.PlayOneShot(sndSelect,1.0);
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
	
	screenBounds = Rect(leftWall.center.x+0.5,topWall.center.y-0.5,
	rightWall.center.x-leftWall.center.x-1.0,
	topWall.center.y-bottomWall.center.y-1.0);
	
	screenBoundsComputed = true;
}

function HandleWordWrong() {
	streak = 0;
	
	if (!GetChallengeModeEnabled()) {
		ShowHint();	
	}
	
	audio.PlayOneShot(sndFailure1, 0.5f);
		
	if (!healthBar.IsEmpty()) {
		return;
	}
	
	if (finished) return;
	
}
	
function ExplodeWords() {
	
	for (var wordLabel : WordLabel in wordLabels) {
		wordLabel.hinting = false;
		wordLabel.Explode();
	}
	
	if (!GetChallengeModeEnabled()) {
		scoreManager.maxTime += wordIndex;
	}
	
	wordIndex = 0;
	currentWord = words[wordIndex];
}

function HandleWordCorrect() {

	var timeSinceLastWord : float = Time.time - lastWordTime;
	lastWordTime = Time.time;
	
	if (timeSinceLastWord < 5) {
		streak += 1;
	}
	
	var snd : AudioClip = sndSuccess75;
	
	switch (streak) {
		case 0: snd = sndSuccess75; break;
		case 1: snd = sndSuccess50; break;
		case 2: snd = sndSuccess25; break;
		case 3: snd = sndSuccess12; break;
		case 4: snd = sndSuccess2; break;
		case 5: snd = sndSuccess1; break;
	}
	
	if (streak > 5) {
		if ((streak % 2) == 0) {
			snd = sndSuccess2;
		} else {
			snd = sndSuccess1;
		}
	}
	
	for (var wordLabel : WordLabel in wordLabels) {
		wordLabel.hinting = false;
	}
	
	audio.PlayOneShot(snd, 0.25f);
	return scoreManager.HandleWordCorrect(timeSinceLastWord);
}

function SetupUI() {
	feedbackLabel.text = "";
	introReferenceLabel.text = "";
	panelReferenceLabel.text = "";
	difficultyLabel.text = "";
	feedbackLabel.enabled = false;
	healthBar.SetPercentage(healthBar.targetPercentage);	
	SyncSetProgressLabel();
}

function SyncSetProgressLabel() {
	setProgressLabel.active = GetChallengeModeEnabled();
	setProgressLabel.text = String.Format("{0}/{1}", verseManager.verseIndex+1, verseManager.GetCurrentVerses().length);
}

function showFeedback(feedbackText : String, time : float) {
	feedbackLabel.enabled = true;
	feedbackLabel.color.a = 1.0f;
	var animDuration = 0.25f;
	feedbackLabel.transform.localScale = new Vector3(0,0,1);
	AnimationManager.ScaleOverTime(feedbackLabel.transform, Vector3(1.0,1.0,1), animDuration);
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


function AnimateIntro() {
	
	var duration : float = 0.25f;
	var endScale : Vector3 = new Vector3(1.0f,1.0f,1.0f);
	var verse : Verse = verseManager.GetCurrentVerse();
	SetVerseReference(verse.reference);	
	introReferenceLabel.color.a = 1.0f;
	introReferenceLabel.transform.localScale = Vector3.zero;
	AnimationManager.ScaleOverTime(introReferenceLabel.transform, endScale, duration);
	
	verseManager.SayVerseReference();	

	yield WaitForSeconds(2.0f);

	AnimationManager.FadeOverTime(introReferenceLabel, 1.0f, 0.0f, duration);
	
	yield WaitForSeconds(duration);
	
	
}

static function RecordPlay() {
	while (!VerseManager.loaded) {
		yield WaitForSeconds(1);
	}
	var verseset : VerseSet = VerseManager.currentVerseSet;
	if (Object.ReferenceEquals(verseset, null)) {
		return;
	}
	var versesetId = verseset.onlineId;
	if (versesetId != null) {
		ApiManager.GetInstance().CallApi("verseset/record_play", new Hashtable({"verseset_id":versesetId}), null, null);
	}
	needToRecordPlay = false;
}

public static function GetInstance() : GameManager {
	return GameObject.FindObjectOfType(GameManager);
}

function Start() {
	if (needToRecordPlay) {
		RecordPlay();
	}
	SetupWalls();
	SetupUI();	
	DidRanOutOfTime = false;

	while (!VerseManager.loaded) {
		yield WaitForSeconds(0.1);
	}
	Debug.Log("VerseManager.loaded, GameManager starting");
	
	var verse : Verse = VerseManager.GetCurrentVerse();
	panelReferenceLabel.text = verse.reference;
	
	difficulty = verseManager.GetCurrentDifficulty();
	
	if (needToSelectDifficulty) { 
	   if (verseManager.GetCurrentDifficultyAllowed() == Difficulty.Easy) {
			verseManager.SetDifficulty(Difficulty.Easy);
			BeginGame();
		} else {
			ShowDifficultyOptions();
		}
	} else {
		verseManager.SetDifficulty(difficulty);
		BeginGame();
	}
	
	needToSelectDifficulty = true;
	
}

function SetVerseReference (reference : String) {
	var diffString = verseManager.DifficultyToString(verseManager.GetCurrentDifficulty());
	
	introReferenceLabel.text = reference;
	panelReferenceLabel.text = reference;
	difficultyLabel.text = diffString;
}


function SplitVerse(verse : String) {
	var langConfig : Hashtable = new Hashtable({'en':[20,10,5],
								  				'zh':[10,6,3],
								  				'ko':[11,6,3],
								  				'ja':[11,6,3]});
	var language : String = VerseManager.GetVerseLanguage();
	var isChinese : boolean = VerseManager.IsLanguageChinese(language);
	
	var phraseLengths : Array = langConfig['en'];
	
	if (langConfig.Contains(language)) {
		phraseLengths = langConfig[language];
	} else {
		if (isChinese) {
			phraseLengths = langConfig['zh'];
		}
	}
	
	var clauseBreakMultiplier = 1.0f;
	var difficultyInt = verseManager.GetDifficultyFromInt(difficulty);
	var phraseLength : int = phraseLengths[difficultyInt];
		
	//Debug.Log("SplitVerse = " + verse );
	
	//Debug.Log("phrase length = " + phraseLength);
	var clauseArray : Array = new Array();
	var phraseArray : Array = new Array();
	var seps = ["、","，", "，","。","！","；","：","?",",",";",":","？",".","’","”","!"];
	var clause = "";
	
	var paransRe:Regex = new Regex("(.*)");
	
	// filter out paranthesis, unwanted characters
	verse = Regex.Replace(verse, "\\(.*\\)","");
	verse = Regex.Replace(verse, "\\（.*\\）","");
	verse = Regex.Replace(verse, "\\[.*\\]","");
	verse = Regex.Replace(verse, "」|「|『|』","");
	verse = Regex.Replace(verse, "\n|\t|\r", " ");
	verse = Regex.Replace(verse, "\\s+", " ");
	
	var processClause = function(clause : String) {
		var combined : boolean = false;
		if (clauseArray.length > 0) {
			// combine with previous clause if too small
			var previousClause : String = clauseArray[clauseArray.length-1];
			Debug.Log("phraseLength = " + phraseLength + " clause length = " + clause.Length + " prev clause length = " + previousClause.Length);
			
			// if clause length is 2 or less just glob it on
			if (clause.Length <= 2) {
				clauseArray[clauseArray.length-1] += clause;
				combined = true;
			}	
		}
		if (!combined) {
			clauseArray.push(clause);
		}
	};
	
	var i = 0;
	var languageIsWestern : boolean = VerseManager.IsLanguageWestern(language);
	
	var isSeparator : Function = function(s : String, c : char, n : char ) {
		
		if (s[0] != c) return false;
		
		if (languageIsWestern) {
			// make sure space is after separator
			return (n == " ");
		} else {
			return true;
		}
	};
	
	for (var c : char in verse) {	
		
		clause = clause + c;
		var n : char = " "[0];
		if (i < (verse.Length-1)) {
			n = verse[i+1];
		}
		for (var s : String in seps) {
			if (isSeparator(s,c,n)	) {
				if ((clause != "") && (clause != " ")) {
					Debug.Log("process " + clause);
					processClause(clause);
				}
				clause = "";
			}
		}
		i += 1;
	}
	
	
	if ((clause != "") && (clause != " ") && (clause != "  ")) {
		processClause(clause);
	}
	
		
	var phrase : String = "";
	var newPhrase : String = "";
	var phraseLengthForClause : int;
	var isCharacterBased = verseManager.IsCharacterBased(language);
	
	var phraseHasPunctuation = function(phrase : String) {
		for (var sc in seps) {
			if (phrase.Contains(sc)) {
				return true;
			}
		}
		return false;
	};
	
	//Debug.Log("clause array = " + clauseArray);
	
	for (clause in clauseArray) {
		// check for special '\' marker which we cannot split on
		var nobreakMarkers = new Array();
		for (i=0;i<clause.Length;i++) {
			if ((clause[i] == "／"[0]) || (clause[i] == "/"[0]) || (clause[i] == " "[0])) {
				nobreakMarkers.Add(i);
			} else if ((i % phraseLength == 0) && isCharacterBased) {
				nobreakMarkers.Add(i);
			}
		}
		
		nobreakMarkers.Add(clause.Length-1);
		//Debug.Log("nobreak markers = " + nobreakMarkers);
		
		//Debug.Log("clause.Length > phraseLength*clauseBreakMultiplier = " + clause.Length + " >" + phraseLength + "*"+ clauseBreakMultiplier);
		if (clause.Length > phraseLength*clauseBreakMultiplier) {
			
			var divisor = Mathf.RoundToInt(1.0f*clause.Length/phraseLength);
			var l : int = 0;
			
			while (l < clause.Length) {
				if (difficulty == Difficulty.Hard) {
					phraseLengthForClause = phraseLength;
				} else {
					phraseLengthForClause = Mathf.RoundToInt(clause.Length/divisor);
				}
				
				if ((l + phraseLengthForClause*1.5) > clause.Length) {
					phraseLengthForClause = clause.Length - l;	
				}
								
				// glob onto the closest no break marker
				if (nobreakMarkers.length > 0) {
					var best = 100;
					var bestIndex = -1;
					for (var index : int in nobreakMarkers) {
						var diff = Mathf.Abs(index - (phraseLengthForClause + l));
						if ((diff < best) && (index >= l)) {
							bestIndex = index;
							best = diff;
							//Debug.Log("best index = " + index + " best diff = " +  best);
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
				
				if (isChinese) { phrase = phrase.Replace(" ",""); }
				
				// filter out leading or trailing spaces
				if ((phrase.Length > 0) && (phrase[0] == " ")) {
					phrase = phrase.Substring(1,phrase.Length-1);
				}
				//Debug.Log("phrase.Length = " + phrase.Length);
				if ((phrase.Length > 0) && (phrase[phrase.Length-1] == " ")) {
					phrase = phrase.Substring(0,phrase.Length-1);
				}

				
				l = l + phraseLengthForClause;
				
				if ((phrase != "") && (phrase != " ") && (phrase != "  ")) {
					if (isChinese) {phrase = phrase.Replace(" ","");}
					phraseArray.push(phrase);
					
				}
			}	
		} else {
			// filter out no break markers
			clause = clause.Replace("／","");
			clause = clause.Replace("/","");
			if (isChinese) {clause = clause.Replace(" ","");}
			phraseArray.push(clause);
		}
		
		// combine phrases for long laundry lists
		if (phraseArray.length > 1) {
			l = phraseArray.length;
			var curPhrase : String = phraseArray[l-1];
			var prevPhrase : String = phraseArray[l-2];
			
			var curWords = curPhrase.Split(" "[0]).Length;
			
			var hasCommas : boolean = (curPhrase.EndsWith(",") &&
			 prevPhrase.EndsWith(","));
			 
			if (hasCommas && ((curPhrase.Length + prevPhrase.Length - 2) < phraseLength*2.0f)) {
			 Debug.Log("COMBINE(" + prevPhrase + " | " + curPhrase + ")");
				prevPhrase += " " + phraseArray.pop();
				phraseArray[l-2] = prevPhrase;
			}
		}
	}
	return phraseArray;

}

function Cleanup () {
	var wObject : WordLabel;
	for (wObject in wordLabels) {
		Destroy(wObject.gameObject);
	}
	wordLabels.Clear();
	needToRecordPlay = true;
}

function BeginGame() {
	SetupVerse();
	AnimateIntro();
}

function GetMaxWordsActive() {
	
	switch(difficulty) {
		case Difficulty.Easy:
			return 4;
		case Difficulty.Medium:
			return 7;
		case Difficulty.Hard:
			return 10;
	}
	return 10;
}

function SwapWords(index1:int, index2:int) {
	Debug.Log("Swap " + index1 + " with " + index2);
	var word1 : WordLabel = wordLabels[index1];
	var word2 : WordLabel = wordLabels[index2];
	
	word1.wordIndex = index2;
	word2.wordIndex = index1;
	
	wordLabels[index1] = word2;
	wordLabels[index2] = word1;
}

function scrambleWordLabels() {
	scrambledWordLabels = new Array();
	for (var i : int=0;i<wordLabels.length;i++) {
		scrambledWordLabels.push(wordLabels[i]);
	}
	var maxWordsActive = GetMaxWordsActive();
	var g = Mathf.RoundToInt(GetGroupSize() * 1.25);
	if (g >= (maxWordsActive-1)) g = (maxWordsActive-1);
	
	var currentIndex : int = scrambledWordLabels.length;
	var temporaryValue : WordLabel;
	var randomIndex : int;

  	// While there remain elements to shuffle...
  	while (0 != currentIndex) {

    	// Pick a remaining element...
    	randomIndex = (currentIndex - g) + Mathf.Floor(Random.RandomRange(0,1.0f) * g);
    	if (randomIndex < 0) randomIndex = 0;
    	currentIndex -= 1;

    	// And swap it with the current element.
    	temporaryValue = scrambledWordLabels[currentIndex];
    	scrambledWordLabels[currentIndex] = scrambledWordLabels[randomIndex];
    	scrambledWordLabels[randomIndex] = temporaryValue;
  	}
}

function SetupVerse() {
	SyncSetProgressLabel();
	VerseManager.AddOnlineVerseSetToHistory(verseManager.GetCurrentVerseSet());

	gameStarted = false;
	showingSolution = false;

	if (GetChallengeModeEnabled()) {
		scoreManager.resetStatsForChallenge();
	} else {
		scoreManager.reset();
	}
	finished = false;
	difficulty = verseManager.GetCurrentDifficulty();
	var maxWordsActive = GetMaxWordsActive();
	
	Cleanup();
	lastWordTime = Time.time;
	
	var clone : WordLabel;
	
	var verse : Verse = verseManager.GetCurrentVerse();
	SetVerseReference(verse.reference);
	verseMetadata = verse.GetMetadata();
	//Debug.Log("verse difficulty is " + verseMetadata["difficulty"]);	
	if (verseMetadata["difficulty"] != null) {
		//difficulty = GetDifficultyFromInt(verseMetadata["difficulty"]);
	}
	
	// calculate word size based on length of text
	//Debug.Log("verse length = " + verse.text.length);
	
	wordScale = 1.0f;
	
	if (verse.text.length > 300) {
		wordScale = 0.5f + 0.5f*(300.0f / verse.text.length);
	}
	
	words = SplitVerse(verse.text);
	wordIndex = 0;
	currentWord = words[wordIndex];
	
	if (GetChallengeModeEnabled() && (verseManager.verseIndex > 0)) {
		var extraTime = scoreManager.CalculateMaxTime();
		var newTime = extraTime + scoreManager.timeLeft;		
		
		var duration = 0.1f*(newTime-scoreManager.timeLeft);
		if ((duration) > 2.0f) duration = 2.0f;
		Debug.Log("new time = " + newTime + " max time = " + scoreManager.timeLeft);
		scoreManager.CountTimeUpTo(newTime);
				
		yield WaitForSeconds(duration);
		scoreManager.resetTime();
	} else {
		scoreManager.maxTime = scoreManager.CalculateMaxTime();
	}
	
	var dy = screenBounds.y;
	var i = 0;
	var rTL = verseManager.rightToLeft;
	for (word in words) {
		clone = Instantiate(wordLabel, new Vector3(0,0,0), Quaternion.identity);
		clone.rightToLeft = rTL;
		clone.setWord(word);
		clone.wordIndex = i;
		wordLabels.push(clone);
		var w = clone.totalSize.x;
		var h = clone.totalSize.y;
		var x = Random.Range(screenBounds.x+w*0.5,screenBounds.x+screenBounds.width-w*0.5);
		var y = screenBounds.y+screenBounds.height+h*2;
		clone.transform.position = new Vector3(x,y,0);
		clone.rigidbody2D.isKinematic = true;
		i += 1;
	}
	
	scrambleWordLabels();
	
	yield WaitForSeconds(2.5f);
	
	numWordsReleased = 0;	
	var numWordsActive = 0;
	var groupSize = GetGroupSize();

	var dt = 0.2f;
	
	while (numWordsReleased < wordLabels.length) {
		numWordsActive = (numWordsReleased - wordIndex);
		
		// don't allow more than maxWordsActive words on screen at the same time
		while (numWordsActive >= maxWordsActive) {
			yield WaitForSeconds(0.1f);
			numWordsActive = (numWordsReleased - wordIndex);
		}		
		
		numWordsReleased = releaseWords(numWordsReleased, 1);
		numWordsActive = (numWordsReleased - wordIndex);
		
		yield WaitForSeconds(dt);

		if (!gameStarted  && ((numWordsReleased >= 2*groupSize) ||
		    (numWordsReleased >= wordLabels.length) || (numWordsReleased == maxWordsActive) ))
		{
			gameStarted = true;
			scoreManager.resetTime();
		}
	}

	
	numWordsReleased = wordLabels.length;
	
}

function GetWordLabelAt(index : int) : WordLabel {
	if (index < 0) return null;
	if (index >= wordLabels.length) return null;
	return wordLabels[index];
}

function GetGroupSize() {
 	// try group size = 1
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
	return groupSize;
}

function releaseWords(index: int, numWords : int) {
 	//Debug.Log("release words index = " + index);
 
	var c : int  = 0;
	
	for (var i : int=index;i<scrambledWordLabels.length;i++) {
		var wordObject : WordLabel = scrambledWordLabels[i];
		var h = wordObject.boxCollider2D().size.y;
		wordObject.transform.position.y = screenBounds.y+h*2;
		wordObject.rigidbody2D.isKinematic = false;
		c += 1;	
		if (c == numWords) {
			break;
		}
	}
	return i+1;
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

function ShowHintFromButton() {
	if (finished) return;
	ShowHint();
	scoreManager.HandleWordWrong();
	audio.PlayOneShot(sndSuccess1, 0.5f);
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
	var timeSinceLastWord : float = Time.time - lastWordTime;
	
	if (!wordHinted && !finished && (timeSinceLastWord > timeUntilHint)) {
		ShowHint();
	}
	refreshButton.active = CanShowSolution();
	hintButton.active = !GetChallengeModeEnabled();
}

static function StartChallenge() {
	var vm : VerseManager = GameObject.FindObjectOfType(VerseManager);
	vm.verseIndex = 0;
	vm.Save();
	SetChallengeModeEnabled(true);
	
	Application.LoadLevel("scramble");
}