#pragma strict

var gameManager : GameManager;
var sndSelect : AudioClip;

function OnMouseDown() {
	if (!renderer.enabled) return;
	audio.PlayOneShot(sndSelect,1.0);
	gameManager.ShowSolution();
}

function OnMouseUp() {
}

function Start () {

}

function Update () {
	if (!gameManager.CanShowSolution()) 
	{
		renderer.enabled = false;
	} else {
		renderer.enabled = true;
	}
}