#pragma strict

var gameManager : GameManager;

function Start () {

}

function Update () {

}

function OnTriggerEnter2D(col : Collider2D) 
{
	if (!gameManager.gameStarted) {
		gameManager.StartGame();
	}
}
