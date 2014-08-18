#pragma strict

var gameManager : GameManager;
var level : String;
var sndSelect : AudioClip;
var floatingPoints : FloatingPoints;

function OnMouseDown() {
	audio.PlayOneShot(sndSelect,1.0);
	gameManager.ShowHint();
	yield WaitForSeconds(1);
	gameManager.HandleWordWrong();
}

function OnMouseUp() {
}

function Start () {

}

function Update () {

}