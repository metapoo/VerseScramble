#pragma strict

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var mainCam : Camera;
public var customSkin : GUISkin;
private var windowRect : Rect;

// Make the contents of the window
function DoMyWindow (windowID : int) {
	GUILayout.Space(10);
	var mistakes = scoreManager.mistakes;
	var clicked = false;
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var masteredVerses = verseManager.GetMasteredVerses(difficulty);
	var diffString = verseManager.DifficultyToString(difficulty);
	var text = "";
	

	if (scoreManager.highScore == scoreManager.score) {
		text += " You got a high score of " + scoreManager.score + "!";
	}
	
	text += "You made " + mistakes + " mistakes, ";
	
	if ((mistakes > 0) && (gameManager.difficulty != Difficulty.Hard)) {
		text += " make zero mistakes to master this verse.";
	} else if (gameManager.difficulty != Difficulty.Hard) {
	    text += " and mastered this verse! So far you have mastered " + masteredVerses + " in " + diffString + " difficulty";
	    if (difficulty != Difficulty.Hard) {
	    	text += " master " + (verseManager.verses.length - masteredVerses) + " more verses to unlock " +
	    	verseManager.DifficultyToString(nextDifficulty) + " difficulty.";
	    }
	}
	
	GUILayout.TextArea(text);
	
	if (mistakes == 0) {
		if (GUILayout.Button ("Advance to Next Stage")) {
			clicked = true;
			gameManager.StartNextDifficulty();
		}
	}
	if (GUILayout.Button ("Try Again")) {
		print ("Got a click");
		gameManager.SetupVerse();
		clicked = true;
	}
	if (GUILayout.Button ("Try Another Verse")) {
		gameManager.StartAnotherVerse();
		clicked = true;
	}
	if (GUILayout.Button ("Back to Menu")) {
		gameManager.Cleanup();
		Application.LoadLevel("verselist");
		clicked = true;
	}
	
	if (clicked) {
		Destroy(this);
		return;
	}
}

function showEndOfGameOptions() {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	windowRect = Rect(w*0.25,h*0.1,w*0.5,h*0.8);
	GUILayout.Window (0, windowRect, DoMyWindow, "You did it!");
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