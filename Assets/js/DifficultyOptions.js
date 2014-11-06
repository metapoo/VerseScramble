#pragma strict
public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;

private var gt = TextManager.GetText;

function StartGame(difficulty : Difficulty) {	
	verseManager.SetDifficulty(difficulty);
	gameManager.BeginGame();
	Destroy(this.gameObject);
};

function StartHard() {
	StartGame(Difficulty.Hard);
};

function StartMedium() {
	StartGame(Difficulty.Hard);
};

function StartEasy() {
	StartGame(Difficulty.Hard);
};

// Make the contents of the window
function DifficultyWindow() {
	var difficulty : Difficulty = Difficulty.Easy;
	var selected : boolean = false;
	var title = gt("Choose difficulty");
	
	var optionDialog : OptionDialog = DialogManager.CreateOptionDialog(title, "");
	
	
	if (verseManager.IsDifficultyAllowed(difficulty.Hard) ) {
		optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Hard),
		StartHard);
	}

	if (verseManager.IsDifficultyAllowed(difficulty.Medium) ) {
		optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Medium),
		StartMedium);
	}	

	optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Easy),
		StartEasy);

}

function Awake () {
	scoreManager = GameObject.Find("ScoreManager").GetComponent(ScoreManager);
	gameManager = GameObject.Find("GameManager").GetComponent(GameManager);
	verseManager = GameObject.Find("VerseManager").GetComponent(VerseManager);
}


function Start() {
	DifficultyWindow();
}

function Update () {

}