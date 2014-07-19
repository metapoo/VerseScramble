#pragma strict
import TextManager;

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var mainCam : Camera;
public var customSkin : GUISkin;
private var windowRect : Rect;

private var gt = TextManager.GetText;

function EndGameWindowForChallenge (windowId : int) {
	var mistakes = scoreManager.totalMistakes;
	var text = String.Format(gt("You made {0} mistakes"), mistakes);
	if (mistakes == 0) {
		text = gt("Perfect!");
	}

}

// Make the contents of the window
function EndGameWindow (windowID : int) {
	var mistakes = scoreManager.mistakes;
	var clicked = false;
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var masteredVerses = verseManager.GetMasteredVerses(difficulty);
	var diffString = verseManager.DifficultyToString(difficulty);
	var nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
	var text = String.Format(gt("You made {0} mistakes"), mistakes);
	var needToSelectDifficulty : boolean = true;
	
	if (mistakes == 0) {
		text = gt("Perfect!");
	}
	if ((scoreManager.highScore == scoreManager.score) && (mistakes == 0)) {
		text = String.Format(gt("New high score {0}!"), scoreManager.score);
	}	
	
	/*
	if ((mistakes > 0) && (gameManager.difficulty != Difficulty.Hard)) {
		text += String.Format(", make zero mistakes to try the verse on {0}.", nextDifficultyString) ;
	} else if (gameManager.difficulty != Difficulty.Hard) {
	    text += " and mastered this verse! So far you have mastered " + masteredVerses + " in " + diffString + " difficulty";
	    if (difficulty != Difficulty.Hard) {
	    	text += ", master " + (verseManager.verses.length - masteredVerses) + " more verses to unlock " +
	    	verseManager.DifficultyToString(nextDifficulty) + " difficulty.";
	    }
	}*/
	
	GUILayout.Box(text);
	
	var mastered = (mistakes == 0) && (difficulty == difficulty.Hard);
	var reload = false;
	
	var tryAgain = function() {
		if ((mistakes > 0) || (difficulty == difficulty.Hard)) {
			if (GUILayout.Button (gt("Try again"))) {
				reload = true;
				needToSelectDifficulty = false;
			}
		} else {
			if (GUILayout.Button (String.Format(gt("Next level"), nextDifficultyString))) {
				verseManager.SetDifficulty(nextDifficulty);
				reload = true;
				needToSelectDifficulty = false;
			}
		}
	};
	
	if (!mastered) {
		tryAgain();
	}
	
	if (GUILayout.Button (gt("Next verse"))) {
		verseManager.GotoNextVerse();
		reload = true;
	}
	
	if (mastered) {
		tryAgain();
	}
	
	if (reload) {
		ReloadGame(needToSelectDifficulty);
	}
}

function ReloadGame(needToSelectDifficulty:boolean) {
	Debug.Log("Reloading game");
	gameManager.Cleanup();
	Destroy(this.gameObject);
	scoreManager.Start();
	
	gameManager.needToSelectDifficulty = needToSelectDifficulty;
	gameManager.Start();
}

function RestartVerseWindow (windowID : int) {
	if (GUILayout.Button(gt("Try again"))) {
		ReloadGame(false);
	}
}

function ShowRestartVerse() {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	windowRect = Rect(w*0.3,h*0.7,w*0.4,h*0.2);
	GUILayout.Window (0, windowRect, RestartVerseWindow, "");
}

function showEndOfGameOptions() {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	windowRect = Rect(w*0.3,h*0.6,w*0.4,h*0.35);
	if (gameManager.GetChallengeModeEnabled()) {
		GUILayout.Window (0, windowRect, EndGameWindowForChallenge, "");
	} else {
		GUILayout.Window (0, windowRect, EndGameWindow, "");
	}
}

function OnGUI() {
	GUI.skin = customSkin;
	if (gameManager.showingSolution) {
		ShowRestartVerse();
	} else {
		showEndOfGameOptions();
	}
}

function Start () {
	mainCam = GameObject.Find("MainCamera").GetComponent("Camera");
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}

function Update () {

}