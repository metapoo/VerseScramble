#pragma strict

var gameManager : GameManager;
var level : String;
var sndSelect : AudioClip;


function OnMouseDown() {
	audio.PlayOneShot(sndSelect,1.0);
	yield WaitForSeconds(0.25);
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