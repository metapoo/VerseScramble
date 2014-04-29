#pragma strict

var scoreLabel : GUIText;
var difficulty : Difficulty = Difficulty.Hard;
var score = 0;
var highScore = 0;
var streak : int = 0;
var moves : int = 0;
var gameManager : GameManager;


function HandleWordWrong() {
	streak = 0;
	addScore(-10);
}

function HandleWordCorrect(elapsedTime : float) {
	addScore(Mathf.Max((4-elapsedTime),1)*(1+streak*0.5));
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
}

function setScore(newScore : int) {
	if (newScore < 0) newScore = 0;
	score = newScore;
	if (score > highScore) {
		highScore = score;
	}
	updateScoreLabel();
}

function updateScoreLabel() {
	scoreLabel.text = " score: " + score + " high: " + highScore + "  streak: " + streak ;
}

function addScore(dScore : int) {
	setScore(score+dScore);
}

function resetScore() {
	streak = 0;
	setScore(0);
	updateScoreLabel();
}

function SetupUI() {
	setScore(0);
}

function Start () {
	SetupUI();
}

function Update () {

}
