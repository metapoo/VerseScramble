#pragma strict

var gameManager : GameManager;
var level : String;
var sndSelect : AudioClip;
var floatingPoints : FloatingPoints;

function OnMouseDown() {
	audio.PlayOneShot(sndSelect,1.0);
	var dScore = gameManager.ShowHint();
	
	var clone : FloatingPoints;
	clone = Instantiate(floatingPoints, transform.position, Quaternion.identity);
	clone.SetPoints(dScore, false);
}

function OnMouseUp() {
}

function Start () {

}

function Update () {

}