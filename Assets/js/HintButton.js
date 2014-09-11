#pragma strict

var gameManager : GameManager;
var scoreManager : ScoreManager;
var level : String;
var sndSelect : AudioClip;
var floatingPoints : FloatingPoints;

function OnMouseDown() {
	audio.PlayOneShot(sndSelect,1.0);
	gameManager.ShowHint();
	gameManager.HandleWordWrong();
	var dScore = scoreManager.HandleWordWrong();
	if (dScore != 0) {
		var clone : FloatingPoints;
		clone = Instantiate(floatingPoints, transform.position, Quaternion.identity);
		clone.SetPoints(dScore, false);

	}
}

function OnMouseUp() {
}

function Start () {

}


function Update () {
	if (GameManager.GetChallengeModeEnabled()) 
	{
		renderer.enabled = false;
	} else {
		renderer.enabled = true;
	}
}