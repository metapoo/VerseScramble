#pragma strict

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var mainCam : Camera;
public var customSkin : GUISkin;
private var windowRect : Rect;

// Make the contents of the window
function DoMyWindow (windowID : int) {
	var mistakes = scoreManager.mistakes;
	var clicked = false;
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var masteredVerses = verseManager.GetMasteredVerses(difficulty);
	var diffString = verseManager.DifficultyToString(difficulty);
	var text = "";
	

	if (scoreManager.highScore == scoreManager.score) {
		text += String.Format("You got a high score of {0}! ", scoreManager.score);
	}
	
	text += "You made " + mistakes + " mistakes";
	
	if ((mistakes > 0) && (gameManager.difficulty != Difficulty.Hard)) {
		text += ", make zero mistakes to master this verse.";
	} else if (gameManager.difficulty != Difficulty.Hard) {
	    text += " and mastered this verse! So far you have mastered " + masteredVerses + " in " + diffString + " difficulty";
	    if (difficulty != Difficulty.Hard) {
	    	text += ", master " + (verseManager.verses.length - masteredVerses) + " more verses to unlock " +
	    	verseManager.DifficultyToString(nextDifficulty) + " difficulty.";
	    }
	}
	
	GUILayout.TextArea(text);
	
	var tryAgain = function() {
		if (GUILayout.Button ("Try Again")) {
			gameManager.SetupVerse();
			clicked = true;
		}
	};
	
	if (mistakes > 0) tryAgain();
	
	if (GUILayout.Button ("Next Verse")) {
		gameManager.StartAnotherVerse();
		clicked = true;
	}
	
	if (mistakes == 0) tryAgain();
	
	if (clicked) {
		Destroy(this);
		return;
	}
}


function showEndOfGameOptions() {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	windowRect = Rect(w*0.3,h*0.4,w*0.4,h*0.55);
	GUILayout.Window (0, windowRect, DoMyWindow, "");
}

function OnGUI() {
	GUI.skin = customSkin;
	showEndOfGameOptions();
}

function Start () {
	mainCam = GameObject.Find("MainCamera").GetComponent("Camera");
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}

function Update () {

}