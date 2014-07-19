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
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var diffString = verseManager.DifficultyToString(difficulty);
	var nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
	var needToSelectDifficulty : boolean = true;
	var text = String.Format(gt("You scored {0}"), scoreManager.score);
	
	if (gameManager.DidRanOutOfTime) {
		text = gt("You ran out of time.");
	} else if (scoreManager.highScore == scoreManager.score) {
		text = String.Format(gt("New high score {0}!"), scoreManager.score);
	}	
	GUILayout.Box(text);
	
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime);
	var reload = false;
	
	if (GUILayout.Button (gt("Try again"))) {
		reload = true;
		needToSelectDifficulty = false;
	}

	if (GUILayout.Button (gt("Back to menu"))) {
		
		gameManager.Cleanup();
		Destroy(this.gameObject);
		Application.LoadLevel("verselist");
		return;
	}

	if (reload) {
		verseManager.verseIndex = 0;
		ReloadGame(needToSelectDifficulty);
	}
}

// Make the contents of the window
function EndGameWindow (windowID : int) {
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var masteredVerses = verseManager.GetMasteredVerses(difficulty);
	var diffString = verseManager.DifficultyToString(difficulty);
	var nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
	var needToSelectDifficulty : boolean = true;
	var text = String.Format(gt("You scored {0}"), scoreManager.score);
	
	if (gameManager.DidRanOutOfTime) {
		text = gt("You ran out of time.");
	} else if (scoreManager.highScore == scoreManager.score) {
		text = String.Format(gt("New high score {0}!"), scoreManager.score);
	} 
		
	GUILayout.Box(text);
	
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime);
	var reload = false;
	
	var tryAgain = function() {
		if ((difficulty == difficulty.Hard) || (gameManager.DidRanOutOfTime)) {
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