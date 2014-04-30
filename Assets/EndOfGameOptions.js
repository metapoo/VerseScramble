#pragma strict

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var mainCam : Camera;
public var customSkin : GUISkin;
private var windowRect : Rect;

// Make the contents of the window
function DoMyWindow (windowID : int) {
	GUILayout.Space(10);
	var mistakes = scoreManager.mistakes;
	var text = "You made " + mistakes + " mistakes.";
	if (scoreManager.highScore == scoreManager.score) {
		text += " You got a high score of " + scoreManager.score + "!";
	}
	GUILayout.TextArea(text);
	
	if (mistakes == 0) {
		if (GUILayout.Button ("Advance to Next Stage")) {
		}
	}
	if (GUILayout.Button ("Try Again")) {
		print ("Got a click");
		gameManager.StartNewVerse();
		Destroy(this);
		return;
	}
	if (GUILayout.Button ("Try Another Verse")) {
	}
	if (GUILayout.Button ("Back to Menu")) {
		gameManager.Cleanup();
		Application.LoadLevel("verselist");
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
}

function Update () {

}