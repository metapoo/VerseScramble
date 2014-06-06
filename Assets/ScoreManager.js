#pragma strict

var scoreLabel : GUIText;
var timeLabel : GUIText;
var score = 0;
var streak : int = 0;
var moves : int = 0;
var maxMoves : int = 1;
var mistakes : int = 0;
var maxTime : int = 0;
var gameManager : GameManager;
var verseManager : VerseManager;
var verseMetadata : Hashtable;
var highScore : int;
var totalElapsedTime : int = 0;
var startTime : int;

function HandleWordWrong() {
	streak = 0;
	moves = moves + 1;
	mistakes = mistakes + 1;
}

function HandleWordCorrect(elapsedTime : float) {
	var baseTime = 5;
	if (moves == 0) {
		baseTime = 10;
	}
	
	if (elapsedTime < 3) {
		streak += 1;
		if (streak == 5) {
			gameManager.showFeedback("Nice Streak!", 1);
		} else if (streak == 10) {
			gameManager.showFeedback("You're doing great!", 1);
		} else if (streak == 15) {
			gameManager.showFeedback("Hallelujah!", 1);
		}
	}
	moves = moves + 1;
}

function calculatedTime() {
 	return totalElapsedTime + mistakes*5;
}

function updateScoreLabel() {
	calculateScore();
	scoreLabel.text = "score: " + score;
	timeLabel.text = "" + (maxTime - totalElapsedTime);
}

function resetStats() {
	mistakes = 0;
	moves = 0;
	streak = 0;
	updateScoreLabel();
}

function SetupUI() {
	updateScoreLabel();
}

function HandleFinished() {
	Debug.Log("score = " + score + " high = " + highScore + " verse difficulty = " + verseMetadata["difficulty"]);
	if (score > highScore) {
		highScore = score;
		verseMetadata["high_score"] = highScore;
		verseManager.SaveVerseMetadata(verseMetadata);
	}
	if ((mistakes == 0) && (score > 0)) {
		verseManager.HandleVerseMastered(gameManager.difficulty, verseMetadata);
	}
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
			return 2;
		case Difficulty.Hard:
			return 4;
	}
	return 1;
}

function calculateScore() {
 	var verse : String = verseManager.currentVerse();
 	var verseLength = verse.Length;
 	var diffMult = difficultyMultiplier(gameManager.difficulty);
 	maxTime = verseLength*0.33*diffMult;
 	score = (maxTime - totalElapsedTime)*diffMult;
 	for (var i=0;i<mistakes;i++) {
 		score = score * 0.8f;
 	}
 	var maxMoves = gameManager.words.length;
 	if (maxMoves == 0) maxMoves = 1;
 	
 	score = parseInt(score * ( 1.0f * moves / maxMoves));
 	return score;
}

function Start() {
	reset();
	SetupUI();
}

function Update () {
	if (!gameManager.finished) {
		totalElapsedTime = Time.time - startTime;
		updateScoreLabel();
	}
}
