#pragma strict

var gameManager : GameManager;

function OnMouseDown() {
	gameManager.Cleanup();
	Application.LoadLevel("verselist");
}

function Start () {

}

function Update () {

}