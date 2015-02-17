using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;


public class EndOfGameOptions:MonoBehaviour{
	
	public ScoreManager scoreManager;
	public GameManager gameManager;
	public VerseManager verseManager;
	public LoginPanel loginPanel;
	public bool needToSelectDifficulty = false;
	
	public void BackToMenu() {
		gameManager.Cleanup();
		Destroy(this.gameObject);
		Application.LoadLevel("versesets");
	}
	
	public void SaveTotalScore(Hashtable resultData) {
		if (UserSession.IsLoggedIn()) {
			UserSession us = UserSession.GetUserSession();
			if (resultData.ContainsKey("total_score")) {
				us.totalScore = (int)resultData["total_score"];
				us.Save();
			}
		}
	}
	
	public void ShowHighScores(Hashtable resultData) {
		SaveTotalScore(resultData);
	
		string text = "";
		List<object> scores = (List<object>)resultData["scores"];
		int i = 1;
		foreach(Hashtable score in scores) {
			text += i + ". " + score["username"] + " - " + score["score"] + "\n";
			i += 1;
		}
		PopupDialog popupDialog = DialogManager.CreatePopupDialog(TextManager.GetText("High Scores"), text);
		popupDialog.SetHeight(1200.0f);
		popupDialog.CenterOnScreen();
		popupDialog.OnClose = ShowEndOfGameOptions;
	}
		
	public void SubmitScore(bool showPopup) {
		//Debug.Log("showPopup = " + showPopup);
		if (!showPopup) {
			if (!ApiManager.IsConnectedToInternet()) {
				Debug.Log("skipping submit score because not connected to internet");
				return;
			}
		}
		
		int score = scoreManager.score;
		string versesetId = VerseManager.currentVerseSet.onlineId;
		
		if (String.IsNullOrEmpty(versesetId)) return;
		
		string userId = UserSession.GetUserSession().userId;
		string hashTarget = String.Format("{0}-{1}-{2}-{3}",userId,versesetId,score,ApiManager.secretKey);
		string hash = ApiManager.Md5(hashTarget);
		int mistakes = scoreManager.mistakes;
		bool mastered = scoreManager.WasVerseMastered();
		int difficulty = (int)VerseManager.GetDifficultyFromInt((int)gameManager.difficulty);
		float elapsedTime = scoreManager.totalElapsedTime;
		int correct = scoreManager.correct;
		Action<Hashtable> handler = SaveTotalScore;
		
		if (showPopup) {
			handler = ShowHighScores;
		}
		
		Hashtable arguments = new Hashtable();
		arguments.Add("score",score);
		arguments.Add("verseset_id",versesetId);
		arguments.Add("hash",hash);
		arguments.Add("mistakes",mistakes);
		arguments.Add("mastered",mastered);
		arguments.Add("difficulty",difficulty);
		arguments.Add("elapsed_time",elapsedTime);
		arguments.Add("correct",correct);
		arguments.Add("is_challenge",GameManager.GetChallengeModeEnabled());
		
		Hashtable options = new Hashtable();
		options.Add("handler",handler);
		options.Add("errorHandler",null);
		
		StartCoroutine(ApiManager.GetInstance().CallApi("leaderboard/verseset/submit_score",
		arguments, options));
	}
	
	public string GetStatsMessage() {
	
		string text = String.Format("\n{0}: {1}%", TextManager.GetText("Accuracy"), scoreManager.GetAccuracy());
		text += String.Format("\n{0}: {1}s\n", TextManager.GetText("Time"), Mathf.RoundToInt(scoreManager.totalElapsedTime*100.0f)/100.0f);
		text += String.Format(TextManager.GetText("{0} Blocks"), scoreManager.correct);
		return text;
	}
	
	public void ReviewVerseRain() {
		string url = GameManager.GetReviewURL();
		Application.OpenURL(url);
	}
	
	public void TryAgain() {
		needToSelectDifficulty = false;
		ReloadGame(needToSelectDifficulty);
	}
	
	public void TryAgainForChallenge() {
		VerseManager.verseIndex = 0;
		TryAgain();
	}
	
	public void NextLevel() {
		verseManager.SetDifficulty(verseManager.GetNextDifficulty());
		needToSelectDifficulty = false;
		ReloadGame(needToSelectDifficulty);
	}
	
	public void NextLevelForChallenge() {
		VerseManager.verseIndex = 0;
		NextLevel();
	}
	
	public void SubmitScoreWithPopup() {
		SubmitScore(true);
	}
	
	public void SubmitScoreWithLogin() {
		if (UserSession.IsLoggedIn()) {
			SubmitScore(true);
		} else {
			LoginPanel clone = LoginPanel.ShowLoginPanel(loginPanel, null);
			clone.onLogin = SubmitScoreWithPopup;
		}
	}
			
	public void EndGameWindowForChallenge() {
		Difficulty difficulty = verseManager.GetCurrentDifficulty();
		Difficulty nextDifficulty = verseManager.GetNextDifficulty();
		
		string nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
		string text = String.Format(TextManager.GetText("You scored {0}"), scoreManager.score);
		string title = TextManager.GetText("Challenge completed!");
		
		needToSelectDifficulty = true;
		
		if (gameManager.DidRanOutOfTime) {
			text = TextManager.GetText("You ran out of time.");
			title = TextManager.GetText("Game Over");
			
		} else if (scoreManager.isHighScore) {
			text = String.Format(TextManager.GetText("New high score {0}!"), scoreManager.score);
		}	
		
		text += GetStatsMessage();
		
		OptionDialog optionDialog = DialogManager.CreateOptionDialog(title,text);

		if (scoreManager.WasVerseMastered()) {
			optionDialog.AddOption(TextManager.GetText("Review Verse Rain!"),
									ReviewVerseRain);
		} else {
			optionDialog.AddOption(TextManager.GetText("Back to menu"),BackToMenu);
			
		}
	
		if ((difficulty == Difficulty.Hard) || (gameManager.DidRanOutOfTime) || !scoreManager.WasVerseMastered()) {
			optionDialog.AddOption(TextManager.GetText("Try again"), TryAgainForChallenge);
		} else {
			optionDialog.AddOption(String.Format(TextManager.GetText("Next level"), nextDifficultyString), NextLevelForChallenge);
		}
		
		if (VerseManager.currentVerseSet.onlineId == null) return;
	
		if (UserSession.IsLoggedIn()) {
			SubmitScore(false);
		}
		
		string scoreText = TextManager.GetText("Submit Score");
		if (UserSession.IsLoggedIn()) {
			scoreText = TextManager.GetText("View High Scores");
		}
		
		optionDialog.AddOption(scoreText,SubmitScoreWithLogin);
	
	}
	
	public void NextVerse() {
		verseManager.GotoNextVerse();
		ReloadGame(false);
	}
		
	public void DestroySelf() {
		Destroy(this.gameObject);
	}
	
	public void PlayChallenge() {
		gameManager.Cleanup();
		Destroy(this.gameObject);
		GameManager.StartChallenge();
	}
					
	// Make the contents of the window
	public void EndGameWindow() {
		
		Difficulty difficulty = verseManager.GetCurrentDifficulty();
		Difficulty nextDifficulty = verseManager.GetNextDifficulty();
		string nextDifficultyString = VerseManager.DifficultyToString(nextDifficulty);
		string description = String.Format(TextManager.GetText("You scored {0}"), scoreManager.score);
		string title = TextManager.GetText("Verse completed!");
		
		needToSelectDifficulty = true;
		
		if (gameManager.showingSolution) {
			title = TextManager.GetText("Game Over");
		}
		
	    if (scoreManager.WasVerseMastered()) {
			description = String.Format(TextManager.GetText("New high score {0}!"), scoreManager.score);
		} 
		
		description += GetStatsMessage();
		
		OptionDialog optionDialog = DialogManager.CreateOptionDialog(title,description);
			
		optionDialog.onClose = DestroySelf;

		optionDialog.AddOption(TextManager.GetText("Next verse"), NextVerse);

		if ((difficulty == Difficulty.Hard) || (gameManager.DidRanOutOfTime) || !scoreManager.WasVerseMastered()) {
			// don't show next level
		} else {
			optionDialog.AddOption(String.Format(TextManager.GetText("Next level"), nextDifficultyString), NextLevel);
		}

		if (verseManager.IsFinalVerse() && scoreManager.WasVerseMastered() && !gameManager.DidRanOutOfTime) {
			optionDialog.AddOption(String.Format(TextManager.GetText("Play Challenge"), nextDifficultyString),
			                       PlayChallenge);
		} else {
			optionDialog.AddOption(TextManager.GetText("Try again"), TryAgain);
		}
		

		if (UserSession.IsLoggedIn()) {
			SubmitScore(false);
		}
		
	}
	
	public void ReloadGame(bool needToSelectDifficulty) {
		Debug.Log("Reloading game");
		gameManager.Cleanup();
		Destroy(this.gameObject);
		StartCoroutine(scoreManager.Start());
		
		gameManager.needToSelectDifficulty = needToSelectDifficulty;
		StartCoroutine(gameManager.Start());
	}
	
	public void ShowEndOfGameOptions() {
		
		if (GameManager.GetChallengeModeEnabled()) {
			EndGameWindowForChallenge();
		} else {
			EndGameWindow();
		}
	}
	
	public void Start() {
		ShowEndOfGameOptions();
	}
	
	public void Awake() {
		scoreManager = GameObject.Find("ScoreManager").GetComponent<ScoreManager>();
		gameManager = GameObject.Find("GameManager").GetComponent<GameManager>();
		verseManager = GameObject.Find("VerseManager").GetComponent<VerseManager>();
	}
	
	public void Update() {
	
	}
}
