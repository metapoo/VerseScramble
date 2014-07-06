#pragma strict

import TextManager;

var scoreLabel : GUIText;
var scoreLabelShadow : GUIText;
var timeLabel : GUIText;
var timeLabelShadow : GUIText;
var score : int = 0;
var streak : int = 0;
var moves : int = 0;
var maxMoves : int = 1;
var mistakes : int = 0;
var maxTime : int = 0;
var mainCamera : Camera;
var gameManager : GameManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var highScore : int;
var totalElapsedTime : float = 0;
var timeLeft : int = 0;
var startTime : int;
var sndSelect : AudioClip;

function HandleWordWrong() {
	streak = 0;
	moves = moves + 1;
	mistakes = mistakes + 1;
	var dScore = -1*maxTime;
	score += dScore;
	return dScore;
}

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
	Debug.Log("dScore = " + dScore + " " + maxTime + " " + totalElapsedTime);
	return dScore;
}

function calculatedTime() {
 	return totalElapsedTime + mistakes*5;
}

function updateScoreLabel() {
	
	scoreLabel.text = score.ToString();
	scoreLabelShadow.text = score.ToString();
	if (timeLeft < 0) timeLeft = 0;
	
	timeLabel.text = timeLeft.ToString("00");
	
	/*
	var hundredths : int = 100*(totalElapsedTime - parseInt(totalElapsedTime));
	var timeStr = String.Format("{0}.{1}",parseInt(totalElapsedTime).ToString("00"),
								hundredths.ToString("00"));
							    
	timeLabel.text = timeStr;
	
	*/
	timeLabelShadow.text = timeLabel.text;
}

function CalculateMaxTime() {
	return gameManager.words.length*5;
}

function resetStats() {
	mistakes = 0;
	moves = 0;
	streak = 0;
	score = 0;
	maxTime = CalculateMaxTime();
	updateScoreLabel();
}

function SetupUI() {
	updateScoreLabel();
	timeLabel.transform.position.x = 0.5f - timeLabel.GetScreenRect().width*0.5f/mainCamera.pixelWidth;
	timeLabelShadow.transform.position.x = timeLabel.transform.position.x;
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
	CountTimeLeft();
}

function HandleCountTimeLeftFinished() {
	if (score > highScore) {
		highScore = score;
		verseMetadata["high_score"] = highScore;
		verseManager.SaveVerseMetadata(verseMetadata);
	}
	if ((mistakes == 0) && (score > 0)) {
		verseManager.HandleVerseMastered(gameManager.difficulty, verseMetadata);
	}
	
	gameManager.ShowEndOfGameOptions();
	
}

function resetTime() {
	startTime = Time.time;
}

function reset() {
	var reference = verseManager.currentReference();
	verseMetadata = verseManager.GetVerseMetadata(reference);
	highScore = verseMetadata["high_score"];
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
		} else {
			totalElapsedTime = 0;
		}
		timeLeft = maxTime - totalElapsedTime;
	}
	updateScoreLabel();
}
