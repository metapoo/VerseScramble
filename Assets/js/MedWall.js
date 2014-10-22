#pragma strict

var gameManager : GameManager;

function Start () {

}

function Update () {

}

function OnTriggerEnter2D(col : Collider2D) 
{
	var wordLabel = col.GetComponent(WordLabel);
	wordLabel.fellDownEnough = true;
	if (!gameManager.gameStarted) {
		gameManager.StartGame();
	}
}
