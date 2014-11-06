#pragma strict
import TextManager;

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var loginPanel : LoginPanel;
public var needToSelectDifficulty : boolean = false;

private var gt = TextManager.GetText;

function BackToMenu() {
	gameManager.Cleanup();
	Destroy(this.gameObject);
	Application.LoadLevel("versesets");
}

function SaveTotalScore(resultData : Hashtable) {
	if (UserSession.IsLoggedIn()) {
		var us : UserSession = UserSession.GetUserSession();
		if (resultData.ContainsKey("total_score")) {
			us.totalScore = resultData["total_score"];
			us.Save();
		}
	}
}

function ShowHighScores(resultData : Hashtable) {
	SaveTotalScore(resultData);

	var text : String = "";
	var scores : List.<Hashtable> = resultData["scores"];
	var i : int = 1;
	for (var score : Hashtable in scores) {
		text += i + ". " + score["username"] + " - " + score["score"] + "\n";
		i += 1;
	}
	var popupDialog : PopupDialog = DialogManager.CreatePopupDialog(gt("High Scores"), text);
	popupDialog.SetHeight(1200);
	popupDialog.CenterOnScreen();
	popupDialog.OnClose = ShowEndOfGameOptions;
};
	
function SubmitScore(showPopup: boolean) {
	Debug.Log("showPopup = " + showPopup);
	if (!showPopup) {
		if (!ApiManager.IsConnectedToInternet()) {
			Debug.Log("skipping submit score because not connected to internet");
			return;
		}
	}
	
	var score = scoreManager.score;
	var versesetId = VerseManager.currentVerseSet.onlineId;
	
	if (versesetId == null) return;
	
	var userId : String = UserSession.GetUserSession().userId;
	var hashTarget : String = String.Format("{0}-{1}-{2}-{3}",userId,versesetId,score,ApiManager.secretKey);
	var hash : String = ApiManager.Md5(hashTarget);
	var mistakes : int = scoreManager.mistakes;
	var mastered : boolean = scoreManager.WasVerseMastered();
	var difficulty : int = VerseManager.GetDifficultyFromInt(gameManager.difficulty);
	var elapsedTime : float = scoreManager.totalElapsedTime;
	var correct : int = scoreManager.correct;
	var handler : Function = SaveTotalScore;
	
	if (showPopup) {
		handler = ShowHighScores;
	}
	
	var arguments : Hashtable = new Hashtable();
	arguments.Add("score",score);
	arguments.Add("verseset_id",versesetId);
	arguments.Add("hash",hash);
	arguments.Add("mistakes",mistakes);
	arguments.Add("mastered",mastered);
	arguments.Add("difficulty",difficulty);
	arguments.Add("elapsed_time",elapsedTime);
	arguments.Add("correct",correct);
	arguments.Add("is_challenge",GameManager.GetChallengeModeEnabled());
	
	var options : Hashtable = new Hashtable();
	options.Add("handler",handler);
	options.Add("errorHandler",null);
	
	ApiManager.GetInstance().CallApi("leaderboard/verseset/submit_score",
	arguments, options);
}

function GetStatsMessage() : String {

	var text : String = String.Format("\n{0}: {1}%", gt("Accuracy"), scoreManager.GetAccuracy());
	text += String.Format("\n{0}: {1}s\n", gt("Time"), Mathf.RoundToInt(scoreManager.totalElapsedTime*100.0)/100.0);
	text += String.Format(gt("{0} Blocks"), scoreManager.correct);
	return text;
}

function ReviewVerseRain() : void {
	var url : String = GameManager.GetReviewURL();
	Application.OpenURL(url);
}

function TryAgain() : void {
	needToSelectDifficulty = false;
	ReloadGame(needToSelectDifficulty);
}

function TryAgainForChallenge() : void {
	VerseManager.verseIndex = 0;
	TryAgain();
}

function NextLevel() : void {
	verseManager.SetDifficulty(verseManager.GetNextDifficulty());
	needToSelectDifficulty = false;
	ReloadGame(needToSelectDifficulty);
}

function NextLevelForChallenge() : void {
	VerseManager.verseIndex = 0;
	NextLevel();
}

function SubmitScoreWithPopup() {
	SubmitScore(true);
}

function SubmitScoreWithLogin() {
	if (UserSession.IsLoggedIn()) {
		SubmitScore(true);
	} else {
		var clone : LoginPanel = loginPanel.ShowLoginPanel(loginPanel, null);
		clone.onLogin = SubmitScoreWithPopup;
	}
}
		
function EndGameWindowForChallenge () {
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	
	var diffString : String = VerseManager.DifficultyToString(difficulty);
	var nextDifficultyString : String = VerseManager.DifficultyToString(nextDifficulty);
	var text = String.Format(gt("You scored {0}"), scoreManager.score);
	var title = gt("Challenge completed!");
	
	needToSelectDifficulty = true;
	
	if (gameManager.DidRanOutOfTime) {
		text = gt("You ran out of time.");
		title = gt("Game Over");
		
	} else if (scoreManager.isHighScore) {
		text = String.Format(gt("New high score {0}!"), scoreManager.score);
	}	
	
	text += GetStatsMessage();
	
	var optionDialog = DialogManager.CreateOptionDialog(title,text);
	
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime)
	&& scoreManager.WasVerseMastered();
	
	if (scoreManager.WasVerseMastered()) {
		optionDialog.AddOption(gt("Review Verse Rain!"),
								ReviewVerseRain);
	} else {
		optionDialog.AddOption(gt("Back to menu"),BackToMenu);
		
	}

	if ((difficulty == difficulty.Hard) || (gameManager.DidRanOutOfTime) || !scoreManager.WasVerseMastered()) {
		optionDialog.AddOption(gt("Try again"), TryAgainForChallenge);
	} else {
		optionDialog.AddOption(String.Format(gt("Next level"), nextDifficultyString), NextLevelForChallenge);
	}
	
	if (VerseManager.currentVerseSet.onlineId == null) return;

	if (UserSession.IsLoggedIn()) {
		SubmitScore(false);
	}
	
	var scoreText : String = gt("Submit Score");
	if (UserSession.IsLoggedIn()) {
		scoreText = gt("View High Scores");
	}
	
	optionDialog.AddOption(scoreText,SubmitScoreWithLogin);

}

function NextVerse() {
	verseManager.GotoNextVerse();
	ReloadGame(false);
}
	
function DestroySelf() {
	Destroy(this.gameObject);
}

function PlayChallenge() {
	gameManager.Cleanup();
	Destroy(this.gameObject);
	GameManager.StartChallenge();
}
				
// Make the contents of the window
function EndGameWindow () {
	
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	var masteredVerses = verseManager.GetMasteredVerses(difficulty);
	var diffString = VerseManager.DifficultyToString(difficulty);
	var nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
	var description = String.Format(gt("You scored {0}"), scoreManager.score);
	var title : String = gt("Verse completed!");
	
	needToSelectDifficulty = true;
	
	if (gameManager.showingSolution) {
		title = gt("Game Over");
	}
	
    if (!scoreManager.WasVerseMastered()) {
		description = String.Format(gt("You made {0} mistakes"), scoreManager.mistakes);
	} else if (scoreManager.isHighScore) {
		description = String.Format(gt("New high score {0}!"), scoreManager.score);
	} 
	
	description += GetStatsMessage();
	
	var optionDialog = DialogManager.CreateOptionDialog(title,description);
		
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime) && 
	(scoreManager.WasVerseMastered());
	optionDialog.onClose = DestroySelf;
	
	optionDialog.AddOption(String.Format(gt("Play Challenge (All Verses)"), nextDifficultyString),
				PlayChallenge);
				
	if ((difficulty == difficulty.Hard) || (gameManager.DidRanOutOfTime) || !scoreManager.WasVerseMastered()) {
		optionDialog.AddOption(gt("Try again"), TryAgain);
	} else {
		optionDialog.AddOption(String.Format(gt("Next level"), nextDifficultyString), NextLevel);
	}
	
	optionDialog.AddOption(gt("Next verse"), NextVerse);
	
	if (UserSession.IsLoggedIn()) {
		SubmitScore(false);
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
	
	if (GameManager.GetChallengeModeEnabled()) {
		EndGameWindowForChallenge();
	} else {
		EndGameWindow();
	}
}

function Start() {
	ShowEndOfGameOptions();
}

function Awake () {
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}

function Update () {

}