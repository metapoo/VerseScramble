﻿#pragma strict
import TextManager;

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;

private var gt = TextManager.GetText;

// Make the contents of the window
function DifficultyWindow() {
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var selected : boolean = false;
	var title = gt("Choose difficulty");
	
	var optionDialog : OptionDialog = DialogManager.CreateOptionDialog(title, "");
	
	var startGame : Function = function() {	
		verseManager.SetDifficulty(difficulty);
		gameManager.BeginGame();
		Destroy(this.gameObject);
	};

	if (verseManager.IsDifficultyAllowed(difficulty.Hard) ) {
		optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Hard),
		function() {
			difficulty = difficulty.Hard;
			startGame();
		});
	}

	if (verseManager.IsDifficultyAllowed(difficulty.Medium) ) {
		optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Medium),
		function() {
			difficulty = difficulty.Medium;
			startGame();
		});
	}	

	optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Easy),
		function() {
			difficulty = difficulty.Easy;
			startGame();
		});

}

function Awake () {
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}


function Start() {
	DifficultyWindow();
}

function Update () {

}