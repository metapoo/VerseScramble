using UnityEngine;
using System;
using UnityEngine.UI;
using System.Collections;


public class ScoreManager:MonoBehaviour{
	
	public Text scoreLabel;
	public Text scoreLabelShadow;
	public Text timeLabel;
	public Text timeLabelShadow;
	
	public bool isHighScore = false;
	public int score = 0;
	public int streak = 0;
	public int moves = 0;
	public int maxTime = 0;
	public int mistakes = 0;
	public int correct = 0;
	public Camera mainCamera;
	public GameManager gameManager;
	public VerseManager verseManager;
	public Hashtable verseMetadata;
	public Hashtable versesetMetadata;
	public int highScore;
	public float totalElapsedTime = 0.0f;
	public float elapsedTime = 0.0f;
	public int timeLeft = 0;
	public int startTime;
	public int challengeStartTime;
	public AudioClip sndSelect;
	public HealthBar healthBar;
	public float startingHealth = 0.0f;
	public float healthBarUnits = 0.0f;
	
	public float GetAccuracy() {
		float accuracy = Mathf.RoundToInt((correct*1.0f)/(mistakes+correct+0.0f)*1000.0f)*1.0f/10.0f;
		if (accuracy < 0.001f) accuracy = 0.0f;
		return accuracy;
	}
	
	public int HandleWordCorrect(float timeSinceLast) {
		float dHealth = (5.0f-healthBarUnits)*0.01f;
		if (dHealth < 0.01f) dHealth = 0.01f;
		
		UpdateHealthBar(healthBarUnits + dHealth);
		
		int baseTime = 5;
		if (moves == 0) {
			baseTime = 10;
		}
		
		if (timeSinceLast < 3) {
			streak += 1;
			if (streak == 5) {
				StartCoroutine(gameManager.showFeedback(TextManager.GetText("Nice Streak!"), 1.0f));
			} else if (streak == 10) {
				StartCoroutine(gameManager.showFeedback(TextManager.GetText("You're doing great!"), 1.0f));
			} else if (streak == 15) {
				StartCoroutine(gameManager.showFeedback(TextManager.GetText("Hallelujah!"), 1.0f));
			}
		}
		moves = moves + 1;
		int dScore = Mathf.RoundToInt(100.0f * healthBarUnits );
		score += dScore;
		correct += 1;
		//Debug.Log("dScore = " + dScore + " " + maxTime + " " + totalElapsedTime);
		return dScore;
	}
	
	public void UpdateHealthBar(float newHealth) {
		if (newHealth < 0) newHealth = 0.0f;
		healthBarUnits = newHealth;
		StartCoroutine(healthBar.SetPercentage(healthBarUnits));
	}
	
	public string HandleWordWrong() {
		streak = 0;
		int dScore = 0;
		Difficulty difficulty = gameManager.difficulty;
	
		float dHealth = 0.2f*healthBarUnits;
		if (dHealth < 0.05f) dHealth = 0.05f;
		if (dHealth > 0.30f) dHealth = 0.30f;
		dHealth *= -1.0f;
		
		mistakes += 1;
		UpdateHealthBar(healthBarUnits + dHealth);
		
		int baseDTime = 4;
		
		if (difficulty == Difficulty.Easy) {
			baseDTime = 0;
		} else if (difficulty == Difficulty.Medium) {
			baseDTime = 2;
		}
		int dTime = -1*mistakes - baseDTime;
		maxTime += dTime;
		return String.Format("{0}s", dTime);
	}
	
	public void updateHighScoreLabel() {
	}
	
	public void updateScoreLabel() {

		//scoreLabel.text = String.Format("{0}: {1}",gt("Score"), score.ToString());
		scoreLabel.text = score.ToString("0000000");
		scoreLabelShadow.text = scoreLabel.text;
		
		if (timeLeft < 0) timeLeft = 0;
		
		string digits = "00";
		
		if (GameManager.GetChallengeModeEnabled()) {
			digits = "000";
		}
		
		timeLabel.text = timeLeft.ToString(digits);
		timeLabelShadow.text = timeLabel.text;
	
	}
	
	public int CalculateMaxTime() {
		int n = GameManager.words.Count;
		if (n == 0) return 0;
		
		int secondsPerBlock = (int)3.0f;
		if (gameManager.difficulty == Difficulty.Medium) {
			secondsPerBlock = (int)4.5f;
		} else if (gameManager.difficulty == Difficulty.Easy) {
			secondsPerBlock = (int)6.0f;
		}
		Debug.Log("seconds per block = " + secondsPerBlock);
		
		return Mathf.RoundToInt((float)(8+n*secondsPerBlock));
		
	}
	
	public void resetStatsForChallenge() {
		moves = 0;
		streak = 0;
		maxTime = timeLeft;
		updateScoreLabel();
		UpdateHealthBar(healthBarUnits);
	}
	
	public void resetStats() {
		isHighScore = false;
		UpdateHealthBar(startingHealth);
		moves = 0;
		streak = 0;
		score = 0;
		mistakes = 0;
		correct = 0;
		maxTime = CalculateMaxTime();
		updateScoreLabel();
		
	}
	
	public void SetupUI() {
		updateScoreLabel();
	}
	
	public IEnumerator CountTimeUpTo(int newTime) {
		float dt = 0.1f;
		int diff = newTime-maxTime;
		if (diff > 20) {
			dt = 2.0f/diff;
		}
		while (newTime > maxTime) {
			maxTime += 1;
			audio.PlayOneShot(sndSelect, 1.0f);
			yield return new WaitForSeconds(dt);
		}
	}
	
	public IEnumerator CountTimeLeft() {
		yield return new WaitForSeconds(0.3f);
		float dt = 2.0f/timeLeft;
		if (dt > 0.25f) dt = 0.25f;
		int dTime = 1;
		
		dTime = Mathf.RoundToInt(timeLeft / 20.0f);
		if (dTime < 1) dTime = 1;
		if (dTime > 5) dTime = 5;
		
		while (timeLeft > 0) {
			if (timeLeft < dTime) {
				dTime = timeLeft;
			}
			score += Mathf.RoundToInt(10.0f*difficultyMultiplier(gameManager.difficulty)*healthBarUnits) * dTime;
			timeLeft -= dTime;
			audio.PlayOneShot(sndSelect, 1.0f);
			yield return new WaitForSeconds(dt);
		}
		yield return new WaitForSeconds(0.5f);
		HandleCountTimeLeftFinished();
	}
	
	public void HandleFinished() {
		if (gameManager.DidRanOutOfTime) {
			StartCoroutine(CountTimeLeft());
			return;
		}
		
		if (!GameManager.GetChallengeModeEnabled() || 
		   (verseManager.IsAtFinalVerseOfChallenge())) {
			StartCoroutine(CountTimeLeft());
		}
	}
	
	public bool WasVerseMastered() {
		return (healthBar.IsGreen() || (mistakes == 0));
	}
	
	public void HandleCountTimeLeftFinished() {
		
		if (GameManager.GetChallengeModeEnabled()) {
			if (score > highScore) {
				highScore = score;
				isHighScore = true;
				versesetMetadata["high_score"] = highScore;
				VerseSet verseset = VerseManager.GetCurrentVerseSet();
				verseset.SaveMetadata(versesetMetadata);
			}
			
			if (WasVerseMastered()) {
				verseManager.HandleVerseSetMastered(gameManager.difficulty, versesetMetadata);
			}
		} else {
			if (score > highScore) {
				highScore = score;
				isHighScore = true;
				Verse verse = VerseManager.GetCurrentVerse();
				verseMetadata["high_score"] = highScore;
				verse.SaveMetadata(verseMetadata);
			}
			
			if (WasVerseMastered()) {
				verseManager.HandleVerseMastered(gameManager.difficulty, verseMetadata);
			}
		}
		
		updateHighScoreLabel();
		StartCoroutine(gameManager.HandleCountTimeFinished());	
	}
	
	public void resetTimeForChallenge() {
		challengeStartTime = (int)Time.time;
	}
	
	public void resetTime() {
		startTime = (int)Time.time;
		if (GameManager.GetChallengeModeEnabled()) {
			if (VerseManager.verseIndex == 0) {
				resetTimeForChallenge();
			}
		}
	}
	
	public void reset() {
		if (!GameManager.GetChallengeModeEnabled()) {
			Verse verse = VerseManager.GetCurrentVerse();
			verseMetadata = verse.GetMetadata();
			highScore = (int)verseMetadata["high_score"];
		} else {
			VerseSet verseset = VerseManager.GetCurrentVerseSet();
			if (!UnityEngine.Object.ReferenceEquals(verseset, null)) {
				versesetMetadata = verseset.GetMetadata();
				highScore = (int)versesetMetadata["high_score"];
			}
		}
		updateHighScoreLabel();
		resetTime();	
	}
	
	public float difficultyMultiplier(Difficulty difficulty) {
		float m = 1.0f;
		
		switch(difficulty) {
			case Difficulty.Easy:
				return 1.0f*m;
			case Difficulty.Medium:
				return 2.0f*m;
			case Difficulty.Hard:
				return 3.0f*m;
			default:
				return 1.0f;
		}
	}
	
	public IEnumerator Start() {
		while (!VerseManager.loaded) {
			yield return new WaitForSeconds(0.1f);
		}
		totalElapsedTime = 0.0f;
		resetStats();
		reset();
		SetupUI();
	}
	
	public void Update() {
		if (!gameManager.finished && !gameManager.showingSolution) {
			
			if (gameManager.gameStarted) {
				float newTime = Time.time - startTime;
				float dt = newTime - elapsedTime;
				elapsedTime += dt;
				if (GameManager.GetChallengeModeEnabled()) {
					totalElapsedTime += dt;
				} else {
					totalElapsedTime = elapsedTime;
				}
				if (!gameManager.DidRanOutOfTime && (timeLeft <= 0)) {
					gameManager.HandleRanOutOfTime();
					
				}
			} else {
				elapsedTime = 0.0f;
			}
			timeLeft = (int)(maxTime - elapsedTime);
		}
		updateScoreLabel();
	}

}
