#pragma strict

import UnityEngine.UI;

var scoreLabel : Text;
var scoreLabelShadow : Text;
var timeLabel : Text;
var timeLabelShadow : Text;

var isHighScore : boolean = false;
var score : int = 0;
var streak : int = 0;
var moves : int = 0;
var maxTime : int = 0;
var mistakes : int = 0;
var correct : int = 0;
var mainCamera : Camera;
var gameManager : GameManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var versesetMetadata : Hashtable;
var highScore : int;
var totalElapsedTime : float = 0;
var elapsedTime : float = 0;
var timeLeft : int = 0;
var startTime : int;
var challengeStartTime : int;
var sndSelect : AudioClip;
var healthBar : HealthBar;
var startingHealth : float = 0.0f;
var healthBarUnits : float = startingHealth;

function GetAccuracy() : float {
	var accuracy : float = Mathf.RoundToInt((correct*1.0)/(mistakes+correct+0.0)*1000.0f)*1.0f/10.0f;
	if (accuracy < 0.001f) accuracy = 0.0f;
	return accuracy;
}

function HandleWordCorrect(timeSinceLast : float) : int {
	var dHealth = (5.0f-healthBarUnits)*0.01f;
	if (dHealth < 0.01) dHealth = 0.01f;
	
	UpdateHealthBar(healthBarUnits + dHealth);
	
	var baseTime = 5;
	if (moves == 0) {
		baseTime = 10;
	}
	
	if (timeSinceLast < 3) {
		streak += 1;
		if (streak == 5) {
			gameManager.showFeedback(TextManager.GetText("Nice Streak!"), 1);
		} else if (streak == 10) {
			gameManager.showFeedback(TextManager.GetText("You're doing great!"), 1);
		} else if (streak == 15) {
			gameManager.showFeedback(TextManager.GetText("Hallelujah!"), 1);
		}
	}
	moves = moves + 1;
	var dScore = Mathf.RoundToInt(100.0f * healthBarUnits );
	score += dScore;
	correct += 1;
	//Debug.Log("dScore = " + dScore + " " + maxTime + " " + totalElapsedTime);
	return dScore;
}

function UpdateHealthBar(newHealth : float) {
	if (newHealth < 0) newHealth = 0;
	healthBarUnits = newHealth;
	healthBar.SetPercentage(healthBarUnits);
}

function HandleWordWrong() : String {
	streak = 0;
	var dScore = 0;
	var difficulty = gameManager.difficulty;

	var dHealth = 0.2f*healthBarUnits;
	if (dHealth < 0.05f) dHealth = 0.05f;
	if (dHealth > 0.30f) dHealth = 0.30f;
	dHealth *= -1;
	
	mistakes += 1;
	UpdateHealthBar(healthBarUnits + dHealth);
	
	var baseDTime = 4;
	
	if (difficulty == Difficulty.Easy) {
		baseDTime = 0;
	} else if (difficulty == Difficulty.Medium) {
		baseDTime = 2;
	}
	var dTime : int = -1*mistakes - baseDTime;
	maxTime += dTime;
	return String.Format("{0}s", dTime);
}

function updateHighScoreLabel() {
}

function updateScoreLabel() {
	var gt = TextManager.GetText;
	
	//scoreLabel.text = String.Format("{0}: {1}",gt("Score"), score.ToString());
	scoreLabel.text = score.ToString("0000000");
	scoreLabelShadow.text = scoreLabel.text;
	
	if (timeLeft < 0) timeLeft = 0;
	
	var digits = "00";
	
	if (GameManager.GetChallengeModeEnabled()) {
		digits = "000";
	}
	
	timeLabel.text = timeLeft.ToString(digits);
	timeLabelShadow.text = timeLabel.text;

}

function CalculateMaxTime() : int {
	var n = GameManager.words.Count;
	if (n == 0) return 0;
	
	var secondsPerBlock : int = 3.0f;
	if (gameManager.difficulty == Difficulty.Medium) {
		secondsPerBlock = 4.5f;
	} else if (gameManager.difficulty == Difficulty.Easy) {
		secondsPerBlock = 6.0f;
	}
	Debug.Log("seconds per block = " + secondsPerBlock);
	
	return Mathf.RoundToInt(8+n*secondsPerBlock);
	
}

function resetStatsForChallenge() {
	moves = 0;
	streak = 0;
	maxTime = timeLeft;
	updateScoreLabel();
	UpdateHealthBar(healthBarUnits);
}

function resetStats() {
	isHighScore = false;
	UpdateHealthBar(startingHealth);
	moves = 0;
	streak = 0;
	score = 0;
	mistakes = 0;
	correct = 0;
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
	if (dt > 0.25f) dt = 0.25f;
	var dTime : int = 1;
	
	dTime = Mathf.RoundToInt(timeLeft / 20.0f);
	if (dTime < 1) dTime = 1;
	if (dTime > 5) dTime = 5;
	
	while (timeLeft > 0) {
		if (timeLeft < dTime) {
			dTime = timeLeft;
		}
		score += Mathf.RoundToInt(10.0f*difficultyMultiplier(gameManager.difficulty)*healthBarUnits) * dTime;
		timeLeft -= dTime;
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

function WasVerseMastered() : boolean {
	return (healthBar.IsGreen() || (mistakes == 0));
}

function HandleCountTimeLeftFinished() {
	
	if (GameManager.GetChallengeModeEnabled()) {
		if (score > highScore) {
			highScore = score;
			isHighScore = true;
			versesetMetadata["high_score"] = highScore;
			var verseset : VerseSet = VerseManager.GetCurrentVerseSet();
			verseset.SaveMetadata(versesetMetadata);
		}
		
		if (WasVerseMastered()) {
			verseManager.HandleVerseSetMastered(gameManager.difficulty, versesetMetadata);
		}
	} else {
		if (score > highScore) {
			highScore = score;
			isHighScore = true;
			var verse : Verse = VerseManager.GetCurrentVerse();
			verseMetadata["high_score"] = highScore;
			verse.SaveMetadata(verseMetadata);
		}
		
		if (WasVerseMastered()) {
			verseManager.HandleVerseMastered(gameManager.difficulty, verseMetadata);
		}
	}
	
	updateHighScoreLabel();
	gameManager.HandleCountTimeFinished();	
}

function resetTimeForChallenge() {
	challengeStartTime = Time.time;
}

function resetTime() {
	startTime = Time.time;
	if (GameManager.GetChallengeModeEnabled()) {
		if (VerseManager.verseIndex == 0) {
			resetTimeForChallenge();
		}
	}
}

function reset() {
	if (!GameManager.GetChallengeModeEnabled()) {
		var verse : Verse = VerseManager.GetCurrentVerse();
		verseMetadata = verse.GetMetadata();
		highScore = verseMetadata["high_score"];
	} else {
		var verseset : VerseSet = VerseManager.GetCurrentVerseSet();
		if (!Object.ReferenceEquals(verseset, null)) {
			versesetMetadata = verseset.GetMetadata();
			highScore = versesetMetadata["high_score"];
		}
	}
	updateHighScoreLabel();
	resetTime();	
}

function difficultyMultiplier(difficulty : Difficulty) : float {
	var m : float = 1.0f;
	
	switch(difficulty) {
		case Difficulty.Easy:
			return 1.0*m;
			break;
		case Difficulty.Medium:
			return 2.0*m;
			break;
		case Difficulty.Hard:
			return 3.0*m;
			break;
		default:
			return 1;
			break;
	}
}

function Start() {
	while (!VerseManager.loaded) {
		yield WaitForSeconds(0.1f);
	}
	totalElapsedTime = 0;
	resetStats();
	reset();
	SetupUI();
}

function Update () {
	if (!gameManager.finished && !gameManager.showingSolution) {
		
		if (gameManager.gameStarted) {
			var newTime = Time.time - startTime;
			var dt = newTime - elapsedTime;
			elapsedTime += dt;
			if (GameManager.GetChallengeModeEnabled()) {
				totalElapsedTime += dt;
			} else {
				totalElapsedTime = elapsedTime;
			}
			if (!gameManager.DidRanOutOfTime && (timeLeft <= 0)) {
				gameManager.HandleRanOutOfTime();
				
			}
		} else {
			elapsedTime = 0;
		}
		timeLeft = maxTime - elapsedTime;
	}
	updateScoreLabel();
}
