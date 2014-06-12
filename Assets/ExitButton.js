#pragma strict

var gameManager : GameManager;
var level : String;

function OnMouseDown() {
	if (gameManager != null) {
		gameManager.Cleanup();
	}
	Application.LoadLevel(level);
}

function OnMouseUp() {
}

function Start () {

}

function Update () {

}