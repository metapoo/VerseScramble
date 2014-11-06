using UnityEngine;
using System;

public class DifficultyOptions:MonoBehaviour{
	
	public ScoreManager scoreManager;
	public GameManager gameManager;
	public VerseManager verseManager;
	
	public void StartGame(Difficulty difficulty) {	
		verseManager.SetDifficulty(difficulty);
		gameManager.BeginGame();
		Destroy(this.gameObject);
	}
	
	public void StartHard() {
		StartGame(Difficulty.Hard);
	}
	
	public void StartMedium() {
		StartGame(Difficulty.Hard);
	}
	
	public void StartEasy() {
		StartGame(Difficulty.Hard);
	}
	
	// Make the contents of the window
	public void DifficultyWindow() {
		string title = TextManager.GetText("Choose difficulty");
		
		OptionDialog optionDialog = DialogManager.CreateOptionDialog(title, "");
		
		
		if (verseManager.IsDifficultyAllowed(Difficulty.Hard) ) {
			optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Hard),
			StartHard);
		}
	
		if (verseManager.IsDifficultyAllowed(Difficulty.Medium) ) {
			optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Medium),
			StartMedium);
		}	
	
		optionDialog.AddOption(VerseManager.DifficultyToString(Difficulty.Easy),
			StartEasy);
	
	}
	
	public void Awake() {
		scoreManager = GameObject.Find("ScoreManager").GetComponent<ScoreManager>();
		gameManager = GameObject.Find("GameManager").GetComponent<GameManager>();
		verseManager = GameObject.Find("VerseManager").GetComponent<VerseManager>();
	}
	
	
	public void Start() {
		DifficultyWindow();
	}
	
	public void Update() {
	
	}
}
