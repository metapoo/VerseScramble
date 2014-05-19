﻿#pragma strict

var scoreLabel : GUIText;
var score = 0;
var streak : int = 0;
var moves : int = 0;
var mistakes : int = 0;
var gameManager : GameManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var highScore : int;
var totalElapsedTime : int = 0;
var startTime : int;

function HandleWordWrong() {
	streak = 0;
	var dScore = score*0.5;
	addScore(-1*dScore);
	moves = moves + 1;
	mistakes = mistakes + 1;
}

function HandleWordCorrect(elapsedTime : float) {
	var baseTime = 5;
	if (moves == 0) {
		baseTime = 10;
	}
	addScore(Mathf.Max((baseTime-elapsedTime),1)*(1+streak*0.5));
	
	Debug.Log("elapsed time: " + elapsedTime);
	if (elapsedTime < 3) {
		streak += 1;
		if (streak == 5) {
			gameManager.showFeedback("Nice Streak!", 1);
		} else if (streak == 10) {
			gameManager.showFeedback("You're doing great!", 1);
		} else if (streak == 15) {
			gameManager.showFeedback("Hallelujah!", 1);
		}
		updateScoreLabel();
	}
	moves = moves + 1;
}

function setScore(newScore : int) {
	if (newScore < 0) newScore = 0;
	score = newScore;
	updateScoreLabel();
}

function updateScoreLabel() {
	scoreLabel.text = " mistakes: " + mistakes + " time: " + totalElapsedTime;
}

function addScore(dScore : int) {
	setScore(score+dScore);
}

function resetScore() {
	mistakes = 0;
	moves = 0;
	streak = 0;
	setScore(0);
	updateScoreLabel();
}

function SetupUI() {
	setScore(0);
}

function HandleFinished() {
	Debug.Log("score = " + score + " high = " + highScore);
	if (score > highScore) {
		highScore = score;
		verseMetadata["high_score"] = highScore;
		verseManager.SaveVerseMetadata(verseMetadata);
	}
}

function Start () {
	var reference = verseManager.currentReference();
	verseMetadata = verseManager.GetVerseMetadata(reference);
	highScore = verseMetadata["high_score"];
	startTime = Time.time;
	
	SetupUI();
}

function Update () {
	if (!gameManager.finished) {
		totalElapsedTime = Time.time - startTime;
		updateScoreLabel();
	}
}
