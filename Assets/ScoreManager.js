#pragma strict

var scoreLabel : GUIText;
var scoreLabelShadow : GUIText;
var timeLabel : GUIText;
var timeLabelShadow : GUIText;
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
var timeLeft : int = 0;
var timeBonusScore : int = 0;
var startTime : int;
var endOfGameOptions : EndOfGameOptions;
var endOfGameOptionsClone : EndOfGameOptions;
var sndSelect : AudioClip;

function HandleWordWrong() {
	var oldScore = calculateScore();	
	streak = 0;
	moves = moves + 1;
	mistakes = mistakes + 1;
	var newScore = calculateScore();
	var dScore = (newScore - oldScore);
	return dScore;
}

function HandleWordCorrect(elapsedTime : float) {
	var oldScore = calculateScore();	
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
	var newScore = calculateScore();
	var dScore =  (newScore - oldScore);
	return dScore;
}

function calculatedTime() {
 	return totalElapsedTime + mistakes*5;
}

function updateScoreLabel() {
	calculateScore();
	scoreLabel.text = score.ToString("00000");
	scoreLabelShadow.text = score.ToString("00000");
	if (timeLeft < 0) timeLeft = 0;
	timeLabel.text = timeLeft.ToString("00");
	timeLabelShadow.text = timeLeft.ToString("00");
}

function resetStats() {
	mistakes = 0;
	moves = 0;
	streak = 0;
	timeBonusScore = 0;
	score = 0;
	updateScoreLabel();
}

function SetupUI() {
	updateScoreLabel();
}

function CountTimeLeft() {
	yield WaitForSeconds(0.3f);
	var dt = 2.0f/timeLeft;
	if (dt > 0.1f) dt = 0.1f;
	
	while (timeLeft > 0) {
		timeBonusScore += 1;
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
	
	endOfGameOptionsClone = Instantiate(endOfGameOptions, new Vector3(0,0,0), Quaternion.identity);	

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
 	var langMult = 1.0f;
 	var language = verseManager.GetLanguage();
 	if (language == "zh") {
 		langMult = 2.5;
 	}
 	maxTime = verseLength*0.33*diffMult*langMult;
 	
 	score = (maxTime*0.5f + 0.5f*(maxTime - totalElapsedTime))*diffMult + timeBonusScore;
 	for (var i=0;i<mistakes;i++) {
 		score = score * 0.8f;
 	}
 	var maxMoves = gameManager.words.length;
 	if (maxMoves == 0) maxMoves = 1;
 	
 	score = parseInt(score * ( 1.0f * (moves - mistakes) / maxMoves));
 	if (score < 0) score = 0;
 	return score;
}

function Start() {
	reset();
	SetupUI();
}

function Update () {
	if (!gameManager.finished) {
		totalElapsedTime = Time.time - startTime;
		timeLeft = maxTime - totalElapsedTime;
	}
	updateScoreLabel();
}
