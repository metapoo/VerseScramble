#pragma strict

var gameManager : GameManager;
var level : String;
var sndSelect : AudioClip;


function OnMouseDown() {
	audio.PlayOneShot(sndSelect,1.0);
	gameManager.ShowHint();
}

function OnMouseUp() {
}

function Start () {

}

function Update () {

}