#pragma strict
import TextManager;

public var scoreManager : ScoreManager;
public var gameManager : GameManager;
public var verseManager : VerseManager;
public var loginPanel : LoginPanel;
public var needToSelectDifficulty : boolean = false;

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
	var popupDialog : PopupDialog = DialogManager.CreatePopupDialog(TextManager.GetText("High Scores"), text);
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

	var text : String = String.Format("\n{0}: {1}%", TextManager.GetText("Accuracy"), scoreManager.GetAccuracy());
	text += String.Format("\n{0}: {1}s\n", TextManager.GetText("Time"), Mathf.RoundToInt(scoreManager.totalElapsedTime*100.0)/100.0);
	text += String.Format(TextManager.GetText("{0} Blocks"), scoreManager.correct);
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
		var clone : LoginPanel = LoginPanel.ShowLoginPanel(loginPanel, null);
		clone.onLogin = SubmitScoreWithPopup;
	}
}
		
function EndGameWindowForChallenge () {
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var nextDifficulty : Difficulty = verseManager.GetNextDifficulty();
	
	var diffString : String = VerseManager.DifficultyToString(difficulty);
	var nextDifficultyString : String = VerseManager.DifficultyToString(nextDifficulty);
	var text = String.Format(TextManager.GetText("You scored {0}"), scoreManager.score);
	var title = TextManager.GetText("Challenge completed!");
	
	needToSelectDifficulty = true;
	
	if (gameManager.DidRanOutOfTime) {
		text = TextManager.GetText("You ran out of time.");
		title = TextManager.GetText("Game Over");
		
	} else if (scoreManager.isHighScore) {
		text = String.Format(TextManager.GetText("New high score {0}!"), scoreManager.score);
	}	
	
	text += GetStatsMessage();
	
	var optionDialog = DialogManager.CreateOptionDialog(title,text);
	
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime)
	&& scoreManager.WasVerseMastered();
	
	if (scoreManager.WasVerseMastered()) {
		optionDialog.AddOption(TextManager.GetText("Review Verse Rain!"),
								ReviewVerseRain);
	} else {
		optionDialog.AddOption(TextManager.GetText("Back to menu"),BackToMenu);
		
	}

	if ((difficulty == difficulty.Hard) || (gameManager.DidRanOutOfTime) || !scoreManager.WasVerseMastered()) {
		optionDialog.AddOption(TextManager.GetText("Try again"), TryAgainForChallenge);
	} else {
		optionDialog.AddOption(String.Format(TextManager.GetText("Next level"), nextDifficultyString), NextLevelForChallenge);
	}
	
	if (VerseManager.currentVerseSet.onlineId == null) return;

	if (UserSession.IsLoggedIn()) {
		SubmitScore(false);
	}
	
	var scoreText : String = TextManager.GetText("Submit Score");
	if (UserSession.IsLoggedIn()) {
		scoreText = TextManager.GetText("View High Scores");
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
	var diffString = VerseManager.DifficultyToString(difficulty);
	var nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
	var description = String.Format(TextManager.GetText("You scored {0}"), scoreManager.score);
	var title : String = TextManager.GetText("Verse completed!");
	
	needToSelectDifficulty = true;
	
	if (gameManager.showingSolution) {
		title = TextManager.GetText("Game Over");
	}
	
    if (!scoreManager.WasVerseMastered()) {
		description = String.Format(TextManager.GetText("You made {0} mistakes"), scoreManager.mistakes);
	} else if (scoreManager.isHighScore) {
		description = String.Format(TextManager.GetText("New high score {0}!"), scoreManager.score);
	} 
	
	description += GetStatsMessage();
	
	var optionDialog = DialogManager.CreateOptionDialog(title,description);
		
	var mastered = (difficulty == difficulty.Hard) && (!gameManager.DidRanOutOfTime) && 
	(scoreManager.WasVerseMastered());
	optionDialog.onClose = DestroySelf;
	
	optionDialog.AddOption(String.Format(TextManager.GetText("Play Challenge (All Verses)"), nextDifficultyString),
				PlayChallenge);
				
	if ((difficulty == difficulty.Hard) || (gameManager.DidRanOutOfTime) || !scoreManager.WasVerseMastered()) {
		optionDialog.AddOption(TextManager.GetText("Try again"), TryAgain);
	} else {
		optionDialog.AddOption(String.Format(TextManager.GetText("Next level"), nextDifficultyString), NextLevel);
	}
	
	optionDialog.AddOption(TextManager.GetText("Next verse"), NextVerse);
	
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
	scoreManager = GameObject.Find("ScoreManager").GetComponent(ScoreManager);
	gameManager = GameObject.Find("GameManager").GetComponent(GameManager);
	verseManager = GameObject.Find("VerseManager").GetComponent(VerseManager);
}

function Update () {

}