#pragma strict
import TextManager;

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var mainCam : Camera;
public var customSkin : GUISkin;
private var windowRect : Rect;

private var gt = TextManager.GetText;
private var windowText : String;

// Make the contents of the window
function DifficultyWindow (windowID : int) {
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var selected : boolean = false;
	
	
	GUILayout.Box(windowText);
	
	if (GUILayout.Button (VerseManager.DifficultyToString(Difficulty.Easy))) {
		difficulty = difficulty.Easy;
		selected = true;
	}

	if (verseManager.IsDifficultyAllowed(difficulty.Medium) || 
	    GameManager.GetChallengeModeEnabled()) {
		if (GUILayout.Button (VerseManager.DifficultyToString(Difficulty.Medium))) {
			difficulty = difficulty.Medium;
			selected = true;
		}
	}	
	
	if (verseManager.IsDifficultyAllowed(difficulty.Hard) ||
		GameManager.GetChallengeModeEnabled()) {
		if (GUILayout.Button (VerseManager.DifficultyToString(Difficulty.Hard))) {
		
			difficulty = difficulty.Hard;
			selected = true;
		}
	}
	
	if (selected) {
		verseManager.SetDifficulty(difficulty);
		gameManager.BeginGame();
		Destroy(this.gameObject);
	}
}

function Start () {
	mainCam = GameObject.Find("MainCamera").GetComponent("Camera");
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
	TextManager.LoadLanguage(verseManager.GetLanguage());
	windowText = gt("Choose difficulty");
}


function ShowWindow() {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	windowRect = Rect(w*0.25,h*0.2,w*0.5,h*0.6);
	GUILayout.Window (0, windowRect, DifficultyWindow, "");
}

function OnGUI() {
	GUI.skin = customSkin;
	ShowWindow();
}

function Update () {

}