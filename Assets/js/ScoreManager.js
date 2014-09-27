#pragma strict

import TextManager;
import UnityEngine.UI;

var scoreLabel : Text;
var timeLabel : Text;
var score : int = 0;
var streak : int = 0;
var moves : int = 0;
var maxTime : int = 0;
var mistakes : int = 0;
var mainCamera : Camera;
var gameManager : GameManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var versesetMetadata : Hashtable;
var highScore : int;
var totalElapsedTime : float = 0;
var timeLeft : int = 0;
var startTime : int;
var sndSelect : AudioClip;
var healthBar : HealthBar;
var startingHealth : float = 0.5f;
var healthBarUnits : float = startingHealth;

function HandleWordCorrect(elapsedTime : float) {
	var dHealth = (2.0f-healthBarUnits)*0.025f;
	if (dHealth < 0.01) dHealth = 0.01f;
	
	UpdateHealthBar(healthBarUnits + dHealth);
	
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
	var dScore = Mathf.RoundToInt(timeLeft * healthBarUnits);
	score += dScore;
	
	//Debug.Log("dScore = " + dScore + " " + maxTime + " " + totalElapsedTime);
	return dScore;
}

function UpdateHealthBar(newHealth : float) {
	if (newHealth < 0) newHealth = 0;
	healthBarUnits = newHealth;
	healthBar.SetPercentage(healthBarUnits);
}

function HandleWordWrong() {
	streak = 0;
	var dScore = 0;
	var dHealth = -0.3f;
	var difficulty = gameManager.difficulty;

	switch (difficulty) {
		case Difficulty.Easy:
			dHealth = -0.25f*healthBarUnits;
			break;
		case Difficulty.Medium:
			dHealth = -0.35f*healthBarUnits;
			break;
		case Difficulty.Hard:
			dHealth = -0.45f*healthBarUnits;
			break;
	}	
	
	mistakes += 1;
	UpdateHealthBar(healthBarUnits + dHealth);
	return dScore;
}


function calculatedTime() {
 	return totalElapsedTime;
}

function updateHighScoreLabel() {
}

function updateScoreLabel() {
	var gt = TextManager.GetText;
	
	//scoreLabel.text = String.Format("{0}: {1}",gt("Score"), score.ToString());
	scoreLabel.text = score.ToString("000000");
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

function resetStatsForChallenge() {
	moves = 0;
	streak = 0;
	updateScoreLabel();
	UpdateHealthBar(healthBarUnits);
}

function resetStats() {
	UpdateHealthBar(startingHealth);
	moves = 0;
	streak = 0;
	score = 0;
	mistakes = 0;
	maxTime = CalculateMaxTime();
	updateScoreLabel();
	
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
		score += Mathf.RoundToInt(1*difficultyMultiplier(gameManager.difficulty)*healthBarUnits);
		timeLeft -= 1;
		audio.PlayOneShot(sndSelect, 1.0f);
		yield WaitForSeconds(dt);
	}
	yield WaitForSeconds(0.5f);
	HandleCountTimeLeftFinished();
}

function HandleFinished() {
	if (gameManager.DidRanOutOfTime) {
		CountTimeLeft();
		return;
	}
	
	if (!GameManager.GetChallengeModeEnabled() || 
	   (verseManager.IsAtFinalVerseOfChallenge())) {
		CountTimeLeft();
	}
}

function WasVerseMastered() {
	return (healthBar.IsGreen() || (mistakes == 0));
}

function HandleCountTimeLeftFinished() {
	
	if (gameManager.GetChallengeModeEnabled()) {
		if (score > highScore) {
			highScore = score;
			versesetMetadata["high_score"] = highScore;
			var verseset : VerseSet = verseManager.GetCurrentVerseSet();
			verseset.SaveMetadata(versesetMetadata);
		}
		verseManager.HandleVerseSetMastered(gameManager.difficulty, versesetMetadata);
	} else {
		if (score > highScore) {
			highScore = score;
			var verse : Verse = verseManager.GetCurrentVerse();
			verseMetadata["high_score"] = highScore;
			verse.SaveMetadata(verseMetadata);
		}
		
		if (WasVerseMastered()) {
			verseManager.HandleVerseMastered(gameManager.difficulty, verseMetadata);
		}
	}
	
	updateHighScoreLabel();
	gameManager.ShowEndOfGameOptions();
	
}

function resetTime() {
	startTime = Time.time;
}

function reset() {
	if (!gameManager.GetChallengeModeEnabled()) {
		var verse : Verse = verseManager.GetCurrentVerse();
		verseMetadata = verse.GetMetadata();
		highScore = verseMetadata["high_score"];
	} else {
		var verseset : VerseSet = verseManager.GetCurrentVerseSet();
		versesetMetadata = verseset.GetMetadata();
		highScore = versesetMetadata["high_score"];
	}
	updateHighScoreLabel();
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
	while (!VerseManager.loaded) {
		yield WaitForSeconds(0.1f);
	}
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
