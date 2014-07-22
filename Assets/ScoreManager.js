#pragma strict

import TextManager;

var scoreLabel : TextMesh;
var timeLabel : TextMesh;
var score : int = 0;
var streak : int = 0;
var moves : int = 0;
var maxMoves : int = 1;
var maxTime : int = 0;
var mistakes : int = 0;
var mainCamera : Camera;
var gameManager : GameManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var categoryMetadata : Hashtable;
var highScore : int;
var totalElapsedTime : float = 0;
var timeLeft : int = 0;
var startTime : int;
var sndSelect : AudioClip;

function HandleWordCorrect(elapsedTime : float) {
	
	var baseTime = 5;
	if (moves == 0) {
		baseTime = 10;
	}
	var gt = TextManager.GetText;
	
	if (elapsedTime < 3) {
		streak += 1;
		if (streak == 5) {
			gameManager.showFeedback(gt("Nice Streak!"), 1);
		} else if (streak == 10) {
			gameManager.showFeedback(gt("You're doing great!"), 1);
		} else if (streak == 15) {
			gameManager.showFeedback(gt("Hallelujah!"), 1);
		}
	}
	moves = moves + 1;
	var dScore = timeLeft;
	score += dScore;
	//Debug.Log("dScore = " + dScore + " " + maxTime + " " + totalElapsedTime);
	return dScore;
}

function HandleWordWrong() {
	var dScore = score*-.5;
	
	if (dScore > -1*maxTime) {
		dScore = -1*maxTime;
	}
			
	score += dScore;
	
	mistakes += 1;
	
	return dScore;
}


function calculatedTime() {
 	return totalElapsedTime;
}

function updateScoreLabel() {
	
	scoreLabel.text = score.ToString();
	if (timeLeft < 0) timeLeft = 0;
	
	timeLabel.text = timeLeft.ToString("00");
	
	/*
	var hundredths : int = 100*(totalElapsedTime - parseInt(totalElapsedTime));
	var timeStr = String.Format("{0}.{1}",parseInt(totalElapsedTime).ToString("00"),
								hundredths.ToString("00"));
							    
	timeLabel.text = timeStr;
	
	*/
}

function CalculateMaxTime() {
	var n = gameManager.words.length;
	if (n == 0) return 0;
	
	if (GameManager.GetChallengeModeEnabled()) {
		return 2+n*2;
	} else {
		return 2+n*4;
	}
	
}

function resetStats() {
	moves = 0;
	streak = 0;
	score = 0;
	mistakes = 0;
	maxTime = CalculateMaxTime();
	updateScoreLabel();
	
	var theTrace = new System.Diagnostics.StackTrace();
}

function SetupUI() {
	updateScoreLabel();
}

function CountTimeUpTo(newTime : int) {
	var dt = 0.1f;
	var diff = newTime-maxTime;
	if (diff > 20) {
		dt = 2.0f/diff;
	}
	while (newTime > maxTime) {
		maxTime += 1;
		audio.PlayOneShot(sndSelect, 1.0f);
		yield WaitForSeconds(dt);
	}
}

function CountTimeLeft() {
	yield WaitForSeconds(0.3f);
	var dt = 2.0f/timeLeft;
	if (dt > 0.1f) dt = 0.1f;
	
	while (timeLeft > 0) {
		score += 1*difficultyMultiplier(gameManager.difficulty);
		timeLeft -= 1;
		audio.PlayOneShot(sndSelect, 1.0f);
		yield WaitForSeconds(dt);
	}
	yield WaitForSeconds(0.5f);
	HandleCountTimeLeftFinished();
}

function HandleFinished() {
	if (gameManager.DidRanOutOfTime) {
		gameManager.ShowEndOfGameOptions();
		return;
	}
	
	if (!GameManager.GetChallengeModeEnabled() || 
	   (verseManager.IsAtFinalVerseOfChallenge())) {
		CountTimeLeft();
	}
}

function HandleCountTimeLeftFinished() {
	

	if (gameManager.GetChallengeModeEnabled()) {
		if (score > highScore) {
			highScore = score;
			categoryMetadata["high_score"] = highScore;
			verseManager.SaveCategoryMetadata(categoryMetadata);
		}
		verseManager.HandleCategoryMastered(gameManager.difficulty, categoryMetadata);
	} else {
		if (score > highScore) {
			highScore = score;
			verseMetadata["high_score"] = highScore;
			verseManager.SaveVerseMetadata(verseMetadata);
		}
		
		if (mistakes == 0) {
			verseManager.HandleVerseMastered(gameManager.difficulty, verseMetadata);
		}
	}
	
	gameManager.ShowEndOfGameOptions();
	
}

function resetTime() {
	startTime = Time.time;
}

function reset() {
	if (!gameManager.GetChallengeModeEnabled()) {
		var reference = verseManager.currentReference();
		verseMetadata = verseManager.GetVerseMetadata(reference);
		highScore = verseMetadata["high_score"];
	} else {
		var category = verseManager.GetCurrentCategory();
		categoryMetadata = verseManager.GetCategoryMetadata(category);
		highScore = categoryMetadata["high_score"];
	}
	resetTime();	
}

function difficultyMultiplier(difficulty : Difficulty) {
	switch(difficulty) {
		case Difficulty.Easy:
			return 1;
		case Difficulty.Medium:
			return 5;
		case Difficulty.Hard:
			return 15;
		default:
			return 1;
	}
}

function Start() {
	TextManager.LoadLanguage(verseManager.GetLanguage());
	resetStats();
	reset();
	SetupUI();
}

function Update () {
	if (!gameManager.finished && !gameManager.showingSolution) {
		if (gameManager.gameStarted) {
			totalElapsedTime = Time.time - startTime;
			if (!gameManager.DidRanOutOfTime && (timeLeft <= 0)) {
				gameManager.HandleRanOutOfTime();
			}
		} else {
			totalElapsedTime = 0;
		}
		timeLeft = maxTime - totalElapsedTime;
	}
	updateScoreLabel();
}
