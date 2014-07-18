#pragma strict

var gameManager : GameManager;
var level : String;
var sndSelect : AudioClip;
var floatingPoints : FloatingPoints;

function OnMouseDown() {
	audio.PlayOneShot(sndSelect,1.0);
	var dTime = gameManager.ShowHint();
	var str = dTime + "s";
	var clone : FloatingPoints;
	clone = Instantiate(floatingPoints, transform.position, Quaternion.identity);
	clone.SetString(str, false);
}

function OnMouseUp() {
}

function Start () {

}

function Update () {

}