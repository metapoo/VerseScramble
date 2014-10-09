#pragma strict
import TextManager;

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var loginPanel : LoginPanel;

private var gt = TextManager.GetText;

function BackToMenu() {
	gameManager.Cleanup();
	Destroy(this.gameObject);
	Application.LoadLevel("versesets");
}

function SubmitScore(showPopup: boolean) {

	var score = scoreManager.score;
	var versesetId = verseManager.currentVerseSet.onlineId;
	var handler : Function = function(resultData : Hashtable) {
		if (!showPopup) return;
		var text : String = "";
		var scores : Array = resultData["scores"];
		var i : int = 1;
		for (var score : Hashtable in scores) {
			text += i + ". " + score["username"] + " - " + score["score"] + "\n";
			i += 1;
		}
		var popupDialog : PopupDialog = DialogManager.CreatePopupDialog(gt("High Scores"), text);
		popupDialog.SetHeight(1200);
		popupDialog.CenterOnScreen();
		popupDialog.OnClose = BackToMenu;
	};
	var hashTarget = versesetId+"_"+score+"_"+ApiManager.secretKey;
	var hash = ApiManager.Md5(hashTarget);
	ApiManager.GetInstance().CallApi("leaderboard/verseset/submit_score",
	new Hashtable({"score":score, "verseset_id":versesetId, "hash":hash}), handler);
}

function EndGameWindowForChallenge () {
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var diffString = verseManager.DifficultyToString(difficulty);
	var nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
	var needToSelectDifficulty : boolean = true;
	var text = String.Format(gt("You scored {0}"), scoreManager.score);
	var title = gt("Challenge completed!");
	
	if (gameManager.DidRanOutOfTime) {
		text = gt("You ran out of time.");
		title = gt("Game Over");
		
	} else if (scoreManager.highScore == scoreManager.score) {
		text = String.Format(gt("New high score {0}!"), scoreManager.score);
	}	
	
	var optionDialog = DialogManager.CreateOptionDialog(title,text);
	
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime);
		
	optionDialog.AddOption(gt("Back to menu"),
		function() {
			BackToMenu();
		});
		
	optionDialog.AddOption(gt("Try again"),
		function() {
			needToSelectDifficulty = false;
			verseManager.verseIndex = 0;
			ReloadGame(needToSelectDifficulty);
		});

	if (verseManager.currentVerseSet.onlineId == null) return;

	SubmitScore(false);
		
	optionDialog.AddOption(gt("View High Scores"),
		function() {
			if (UserSession.IsLoggedIn()) {
				SubmitScore(true);
			} else {
				var clone : LoginPanel = loginPanel.ShowLoginPanel(loginPanel, null);
				clone.onLogin = function() {
					SubmitScore(true);
				};
			}
		});


}

// Make the contents of the window
function EndGameWindow () {
	SubmitScore(false);
	
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var masteredVerses = verseManager.GetMasteredVerses(difficulty);
	var diffString = verseManager.DifficultyToString(difficulty);
	var nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
	var needToSelectDifficulty : boolean = true;
	var description = String.Format(gt("You scored {0}"), scoreManager.score);
	var title = gt("Verse completed!");
	
	if (gameManager.DidRanOutOfTime) {
		description = gt("You ran out of time.");
		title = gt("Game Over");
	} else if (!scoreManager.WasVerseMastered()) {
		description = String.Format(gt("You made {0} mistakes"), scoreManager.mistakes);
	} else if (scoreManager.highScore == scoreManager.score) {
		description = String.Format(gt("New high score {0}!"), scoreManager.score);
	} 

	var optionDialog = DialogManager.CreateOptionDialog(title,description);
		
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime) && 
	(scoreManager.WasVerseMastered());
	
	optionDialog.AddOption(String.Format(gt("Play Challenge (All Verses)"), nextDifficultyString),
				function() {
					gameManager.Cleanup();
					Destroy(this.gameObject);
					GameManager.StartChallenge();
				});
				
	var tryAgain = function() {

		if ((difficulty == difficulty.Hard) || (gameManager.DidRanOutOfTime) || !scoreManager.WasVerseMastered()) {
			optionDialog.AddOption(gt("Try again"),
			  	function() {
					needToSelectDifficulty = false;
					ReloadGame(needToSelectDifficulty);
			  	});
		} else {
			optionDialog.AddOption(String.Format(gt("Next level"), nextDifficultyString),
				function() {
					verseManager.SetDifficulty(nextDifficulty);
					needToSelectDifficulty = false;
					ReloadGame(needToSelectDifficulty);
				});
		}
	};
	
	if (mastered) {
		tryAgain();
	}
	
	optionDialog.AddOption(gt("Next verse"), 
		function() {
			verseManager.GotoNextVerse();
			ReloadGame(false);
		});
					
	if (!mastered) {
		tryAgain();
	}
	
}

function ReloadGame(needToSelectDifficulty:boolean) {
	Debug.Log("Reloading game");
	gameManager.Cleanup();
	Destroy(this.gameObject);
	scoreManager.Start();
	
	gameManager.needToSelectDifficulty = needToSelectDifficulty;
	gameManager.Start();
}

function ShowEndOfGameOptions() {
	if (gameManager.GetChallengeModeEnabled()) {
		EndGameWindowForChallenge();
	} else {
		EndGameWindow();
	}
}

function ShowRestartVerse() {
	var optionDialog : OptionDialog = DialogManager.CreateOptionDialog(gt("Game Over"),"");
	optionDialog.AddOption(gt("Try Again"), 
		function() {
			ReloadGame(false);
		});
}

function Start() {
	if (gameManager.showingSolution) {
		ShowRestartVerse();
	} else {
		ShowEndOfGameOptions();
	}
}

function Awake () {
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}

function Update () {

}