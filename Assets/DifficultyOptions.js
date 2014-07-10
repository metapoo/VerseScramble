#pragma strict
import TextManager;

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var mainCam : Camera;
public var customSkin : GUISkin;
private var windowRect : Rect;

private var gt = TextManager.GetText;

// Make the contents of the window
function DifficultyWindow (windowID : int) {
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	
	GUILayout.Box(gt("Choose difficulty"));
	
	if (GUILayout.Button (gt("Easy"))) {
		
	}

	if (GUILayout.Button (gt("Medium"))) {
		
	}	
	
	if (GUILayout.Button (gt("Hard"))) {
		
	}
}

function Start () {
	mainCam = GameObject.Find("MainCamera").GetComponent("Camera");
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}


function ShowWindow() {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	windowRect = Rect(w*0.3,h*0.2,w*0.4,h*0.6);
	GUILayout.Window (0, windowRect, DifficultyWindow, "");
}

function OnGUI() {
	GUI.skin = customSkin;
	ShowWindow();
}

function Update () {

}