using UnityEngine;
using System;
using UnityEngine.UI;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Collections;
using System.Globalization;

public enum Difficulty {Easy, Medium, Hard, Impossible};

[RequireComponent(typeof(AudioSource))]

public class GameManager:MonoBehaviour{
	
	public AudioClip victorySnd;
	public SkyManager skyManager;
	public PanCamera wordLabelContainer;
	public Camera mainCam;
	public WordLabel wordLabel;
	public BoxCollider2D topWall;
	public BoxCollider2D bottomWall;
	public BoxCollider2D leftWall;
	public BoxCollider2D rightWall;
	public BoxCollider2D medWall;
	public bool finished = false;
	public Difficulty difficulty = Difficulty.Easy;
	public ScoreManager scoreManager;
	public VerseManager verseManager;
	public Hashtable verseMetadata;
	public int timeUntilHint ;
	public SpriteRenderer background;
	public AudioClip sndSuccess1;
	public AudioClip sndSuccess2;
	public AudioClip sndSuccess75;
	public AudioClip sndSuccess50;
	public AudioClip sndSuccess25;
	public AudioClip sndSuccess12;
	
	public AudioClip sndFailure1;
	public AudioClip sndExplode1;
	public AudioClip sndSelect;
	public Button refreshButton;
	public Button hintButton;
	public Text feedbackLabel;
	public Text introReferenceLabel;
	public Text panelReferenceLabel;
	public Text difficultyLabel;
	public HealthBar healthBar;
	public float wordScale;
	public Text setProgressLabel;
	public int updateCount = 0;
	public int line = 0;
	public string[] separators = new string[]{"、","，", "，","。","！","；","：","?",",",";",":","？",".","’","”","!"};
	
	public bool needToSelectDifficulty = true;
	public DifficultyOptions difficultyOptions;
	public EndOfGameOptions endOfGameOptions;
	public int numWordsReleased = 0;
	public bool gameStarted = false;
	public bool showingSolution = false;
	public bool DidRanOutOfTime = false;
	
	bool wordHinted = false;
	
	public static string lastDiffSpoken;
	public static bool needToRecordPlay = true;
	public static string currentWord;
	public static List<string> words = new System.Collections.Generic.List<string>();
	public static List<WordLabel> wordLabels = new System.Collections.Generic.List<WordLabel>();
	public static List<WordLabel> scrambledWordLabels = new System.Collections.Generic.List<WordLabel>();
	public static int wordIndex;
	public static int score = 0;
	public static int highScore = 0;
	public static Rect screenBounds;
	public static bool screenBoundsComputed = false;
	public static int streak = 0;
	public static int moves = 0;
	public static float lastWordTime;
	public static int challengeModeState = -1;
	public static List<WordLabel> activeWordLabels = new System.Collections.Generic.List<WordLabel>();

	private static Hashtable langConfig = new Hashtable();

	Rect windowRect;
	
	public static void SetChallengeModeEnabled(bool enabled) {
		int enabledInt = 0;
		if (enabled) enabledInt = 1;
		challengeModeState = enabledInt;
		PlayerPrefs.SetInt("challenge_mode", enabledInt);
	}
	
	public static bool GetChallengeModeEnabled() {
		if (challengeModeState == -1) {
			return PlayerPrefs.GetInt("challenge_mode") == 1;
		} else {
			return (challengeModeState == 1);
		}
	}
	
	
	public void OnGUI() {
	
	}
	
	public static string GetReviewURL() {
		string url = "https://itunes.apple.com/us/app/verse-rain-fun-bible-verse/id928732025?ls=1&mt=8";
					
		if (Application.platform == RuntimePlatform.Android) {
			url = "https://play.google.com/store/apps/details?id=com.hopeofglory.verserain";
		}
		return url;
	}
	
	public void ExitToVerseList() {
		audio.PlayOneShot(sndSelect, 1.0f);
		Cleanup();
		Application.LoadLevel("versesets");
	}
	
	public bool CanShowSolution() {
		return ((wordIndex < wordLabels.Count) && !finished && gameStarted && !GetChallengeModeEnabled());	
	}
	
	public IEnumerator HandleCountTimeFinished() {
		if (scoreManager.isHighScore && scoreManager.WasVerseMastered()) {
			audio.PlayOneShot(victorySnd, 1.0f);
			yield return new WaitForSeconds(0.5f);
			skyManager.LookAtRainbow();
			skyManager.ShowRainbow();
			yield return new WaitForSeconds(3.0f);
		} else {
			yield return new WaitForSeconds(2.0f);
		}
		
		ShowEndOfGameOptions();
	}
	
	public void ShowSolution() {
		if (!CanShowSolution()) {
			if (finished) {
				ShowEndOfGameOptions();
				return;
			}
			audio.PlayOneShot(sndFailure1,1.0f);
			return;
		}
		if (showingSolution) {
			EndOfGameOptions endPopup = (EndOfGameOptions)GameObject.FindObjectOfType(typeof(EndOfGameOptions));
			if (endPopup == null) {
				ShowEndOfGameOptions();
			}
			return;
		}
		
		audio.PlayOneShot(sndSelect,1.0f);
		showingSolution = true;
		
		if (wordIndex < 0) return;
		
		for(int i=wordIndex;i<wordLabels.Count;i++) {
			WordLabel wordObject = wordLabels[i];
			wordObject.returnToVerse();
		}
	
	}
	
	public void SetupWalls() {
		int w = (int)mainCam.pixelWidth;
		int h = (int)mainCam.pixelHeight;
		float thickness = 0.2f;
		
		topWall.size = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(w*2.0f, 0f, 0f)).x, thickness);
		topWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, (float)h ,0f)).y + 0.5f*thickness);	
		
		medWall.size = topWall.size;
		medWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, h*0.8f,0f)).y +thickness*0.1f);	
		
		bottomWall.size = topWall.size;
		bottomWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).y - thickness*0.5f);	
		
		leftWall.size = new Vector2(thickness, mainCam.ScreenToWorldPoint(new Vector3(0f, h*100.0f, 0f)).y);
		leftWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).x - 0.5f*thickness, 0f);	
		
		rightWall.size = leftWall.size;
		rightWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3((float)w, 0f, 0f)).x+0.5f*thickness, 0f);
		
		screenBounds = new Rect(leftWall.center.x+0.5f*thickness,topWall.center.y-0.5f*thickness,
		rightWall.center.x-leftWall.center.x-1.0f*thickness,
		topWall.center.y-bottomWall.center.y-1.0f*thickness);
		
		screenBoundsComputed = true;
	}
	
	public void HandleWordWrong() {
		streak = 0;
		
		ShowHint();	
		
		audio.PlayOneShot(sndFailure1, 0.5f);
			
		if (!healthBar.IsEmpty()) {
			return;
		}
		
		if (finished) return;
		
	}
	
	public bool CheckWordSubsetMatches(WordLabel wLabel1,WordLabel wLabel2) {
		int minLength = Mathf.Min(wLabel1.word.Length, wLabel2.word.Length);
		for(int i =0;i<minLength;i++) {
			string c1 = wLabel1.word[i].ToString();
			string c2 = wLabel2.word[i].ToString();
			// ignore separators
			bool hasSep = false;
			if (c1 != c2) {
				foreach(string s in separators) {
					if ((s == c1) || (s == c2)) {
						hasSep = true;
						break;
					}
				}
				if (hasSep) {
					continue;
				}
				return false;
			}
		}
		return true;
	}
	
	public WordLabel CheckForActiveDuplicate(WordLabel wordLabel) {
		
		WordLabel wLabel = wordLabels[wordIndex];
		
		if (wLabel == wordLabel) return null;
		
		if (CheckWordSubsetMatches(wLabel, wordLabel)) {
			return wLabel;
		}
		
		return null;
	}
	
	
	public float GetProgress() {
		float verseProgress = 0.0f;
		
		if (finished) {
			verseProgress = 1.0f;
		} else {
			if (wordLabels.Count > 0) {
				verseProgress = (wordIndex*1.0f) / (1.0f*wordLabels.Count);
			} else {
				verseProgress = 0.0f;
			}
		}
		if (GetChallengeModeEnabled()) {
			int versesCount = VerseManager.GetCurrentVerses().Count;
			if (versesCount == 0) {
				return 0.0f;
			}
			float setProgress = (VerseManager.verseIndex+verseProgress) / (1.0f* versesCount);
			return setProgress;
		} else {
			return verseProgress;
		}
	}
	
	public void HandleProgress() {
		GameObject terrain = GameObject.Find("GroundTerrain");
		float p = GetProgress()*3.0f;
		terrain.SendMessage("SetTargetProgress", p);
	}
	
	public int HandleWordCorrect(WordLabel wordLabel) {
	
		float timeSinceLastWord = Time.time - lastWordTime;
		lastWordTime = Time.time;
		
		if (timeSinceLastWord < 5) {
			streak += 1;
		}
		
		AudioClip snd = sndSuccess75;
		
		switch (streak) {
			case 0: snd = sndSuccess75; break;
			case 1: snd = sndSuccess50; break;
			case 2: snd = sndSuccess25; break;
			case 3: snd = sndSuccess12; break;
			case 4: snd = sndSuccess2; break;
			case 5: snd = sndSuccess1; break;
		}
		
		if (streak > 5) {
			if ((streak % 2) == 0) {
				snd = sndSuccess2;
			} else {
				snd = sndSuccess1;
			}
		}
		
		audio.PlayOneShot(snd, 0.25f);
		HandleProgress();
		
		bool wasHinting = wordLabel.hinting;
		
		foreach(WordLabel wLabel in wordLabels) {
			wLabel.hinting = false;
		}
		
		// no credit for hinting
		if (wasHinting) return 0;
		
		return scoreManager.HandleWordCorrect(timeSinceLastWord);
	}
	
	public void SetupUI() {
		feedbackLabel.text = "";
		introReferenceLabel.text = "";
		panelReferenceLabel.text = "";
		difficultyLabel.text = "";
		feedbackLabel.enabled = false;
		StartCoroutine(healthBar.SetPercentage(healthBar.targetPercentage));	
		SyncSetProgressLabel();
	}
	
	public void SyncSetProgressLabel() {
		setProgressLabel.active = GetChallengeModeEnabled();
		setProgressLabel.text = String.Format("{0}/{1}", VerseManager.verseIndex+1, VerseManager.GetCurrentVerses().Count);
	}
	
	public IEnumerator showFeedback(string feedbackText,float time) {
		feedbackLabel.enabled = true;
		var tmp_cs1 = feedbackLabel.color;
        tmp_cs1.a = 1.0f;
        feedbackLabel.color = tmp_cs1;
		float animDuration = 0.25f;
		feedbackLabel.transform.localScale = new Vector3(0.0f,0.0f,1.0f);
		StartCoroutine(AnimationManager.ScaleOverTime(feedbackLabel.transform, new Vector3(1.0f,1.0f,1.0f), animDuration));
		feedbackLabel.text = feedbackText;
		yield return new WaitForSeconds(time+animDuration);
		// there could be another feedback animation running, in which case we want to let that one take over
		if (feedbackText == feedbackLabel.text) {
			StartCoroutine(AnimationManager.FadeOverTime(feedbackLabel,1.0f,0.0f,animDuration));
		}
	}
	
	public void ShowEndOfGameOptions() {
		Instantiate(endOfGameOptions, new Vector3(0.0f,0.0f,0.0f), Quaternion.identity);	
	}
	
	public void ShowDifficultyOptions() {
		Instantiate(difficultyOptions, new Vector3(0.0f,0.0f,0.0f), Quaternion.identity);
	}
	
	public void EnableWordColliders() {
		
		foreach(WordLabel wordLabel in wordLabels) {
			wordLabel.collider2D.enabled = true;
		}
	}
	
	public string nextWord() {
		if (wordIndex == -1) return null;
		wordHinted = false;
		wordIndex += 1;
		if (wordIndex >= words.Count) {
			currentWord = null;
			wordIndex = -1;
			
			EnableWordColliders();
			if (!showingSolution) {
				StartCoroutine(showFeedback(TextManager.GetText("Awesome!"),3.0f));
				StartCoroutine(HandleVerseFinished());
			} else {
				//ShowEndOfGameOptions();
			}
			return null;
		}
		currentWord = words[wordIndex];
		return currentWord;
	}
	
	
	public IEnumerator AnimateIntro() {
		
		float duration = 0.25f;
		Vector3 endScale = new Vector3(1.0f,1.0f,1.0f);
		Verse verse = VerseManager.GetCurrentVerse();
		SetVerseReference(verse.reference, verse.version);	
		introReferenceLabel.enabled = true;
		var tmp_cs2 = introReferenceLabel.color;
        tmp_cs2.a = 1.0f;
        introReferenceLabel.color = tmp_cs2;
		introReferenceLabel.transform.localScale = Vector3.zero;
		StartCoroutine(AnimationManager.ScaleOverTime(introReferenceLabel.transform, endScale, duration));
		
		verseManager.SayVerseReference();	
	
		yield return new WaitForSeconds(3.0f);
	
		StartCoroutine(AnimationManager.FadeOverTime(introReferenceLabel, 1.0f, 0.0f, duration));
		
		yield return new WaitForSeconds(duration);
		
		
	}
	
	public IEnumerator RecordPlay() {
	
		while (!VerseManager.loaded) {
			yield return new WaitForSeconds(1.0f);
		}
	
		VerseSet verseset = VerseManager.currentVerseSet;
		if (verseset == null) {
			return false;
		}
		string versesetId = verseset.onlineId;
		if (versesetId != null) {
			Hashtable options = new Hashtable();
			options.Add("errorHandler",null);
			Hashtable arguments = new Hashtable();
			arguments.Add("verseset_id",versesetId);
			ApiManager.GetInstance().CallApi("verseset/record_play", arguments);
		}
		needToRecordPlay = false;
	}
	
	public static GameManager GetInstance() {
		return (GameManager)GameObject.FindObjectOfType(typeof(GameManager));
	}
	
	public IEnumerator Start() {
		if (langConfig.Count == 0) {
			langConfig.Add("en",new System.Collections.Generic.List<int>(new int[]{20,10,5}));
			langConfig.Add("zh",new System.Collections.Generic.List<int>(new int[]{10,6,3}));
			langConfig.Add("ko",new System.Collections.Generic.List<int>(new int[]{11,6,3}));
			langConfig.Add("ja",new System.Collections.Generic.List<int>(new int[]{11,6,3}));
		}

		if (needToRecordPlay) {
			StartCoroutine(RecordPlay());
		}
		SetupWalls();
		SetupUI();	
		DidRanOutOfTime = false;
	
		while (!VerseManager.loaded) {
			yield return new WaitForSeconds(0.1f);
		}
		UnityEngine.Debug.Log("VerseManager.loaded, GameManager starting");
		
		Verse verse = VerseManager.GetCurrentVerse();
		panelReferenceLabel.text = verse.reference;
		
		difficulty = verseManager.GetCurrentDifficulty();
		
		if (needToSelectDifficulty) { 
		   if (verseManager.GetCurrentDifficultyAllowed() == (int)Difficulty.Easy) {
				verseManager.SetDifficulty(Difficulty.Easy);
				BeginGame();
			} else {
				ShowDifficultyOptions();
			}
		} else {
			verseManager.SetDifficulty(difficulty);
			BeginGame();
		}
		needToSelectDifficulty = true;
		
	}
	
	public void SetVerseReference(string reference,string version) {
		string diffString = VerseManager.DifficultyToString(verseManager.GetCurrentDifficulty());
		string label = reference;
		
		if (version != null) {
			label += String.Format(" ({0})", version.ToLower());
		}
		
		introReferenceLabel.text = label;
		panelReferenceLabel.text = label;
		difficultyLabel.text = diffString;
	}
	
	public void ProcessClause(string clause,List<string> clauseArray) {
		bool combined = false;
		if (clauseArray.Count > 0) {
			// combine with previous clause if too small
			string previousClause = clauseArray[clauseArray.Count-1];
			//Debug.Log("phraseLength = " + phraseLength + " clause length = " + clause.Length + " prev clause length = " + previousClause.Length);
				
			// if clause length is 2 or less just glob it on
			if (clause.Length <= 2) {
				clauseArray[clauseArray.Count-1] += clause;
				combined = true;
			}	
		}
		
		if (!combined) {
			clauseArray.Add(clause);
		}
	}
	
		
	public bool IsSeparator(string s,char c,char n,bool languageIsWestern) {
		if (s[0] != c) return false;
			
		if (languageIsWestern) {
			// make sure space is after separator
			return (n == ' ');
		} else {
			return true;
		}
	}
		
	public List<string> SplitVerse(string verse) {

	    
		string language = VerseManager.GetVerseLanguage();
		bool isChinese = VerseManager.IsLanguageChinese(language);
		
		List<int> phraseLengths = (List<int>)langConfig["en"];
		Debug.Log ("lang config = " + JSONUtils.HashtableToJSON(langConfig));
		Debug.Log ("lang config = " + langConfig.Count);
		if (langConfig.Contains(language)) {
			phraseLengths = (System.Collections.Generic.List<int>)langConfig[language];
		} else {
			if (isChinese) {
				phraseLengths = (System.Collections.Generic.List<int>)langConfig["zh"];
			}
		}
		
		float clauseBreakMultiplier = 1.0f;
		int difficultyInt = (int)VerseManager.GetDifficultyFromInt((int)difficulty);
		int phraseLength = phraseLengths[difficultyInt];
			
		//Debug.Log("SplitVerse = " + verse );
		
		//Debug.Log("phrase length = " + phraseLength);
		List<string> clauseArray = new System.Collections.Generic.List<string>();
		List<string> phraseArray = new System.Collections.Generic.List<string>();
		string localClause = "";
		
		// filter out paranthesis, unwanted characters
		verse = Regex.Replace(verse, "\\(.*\\)","");
		verse = Regex.Replace(verse, "\\（.*\\）","");
		verse = Regex.Replace(verse, "\\[.*\\]","");
		//verse = Regex.Replace(verse, "」|「|『|』","");
		verse = Regex.Replace(verse, "\n|\t|\r", " ");
		verse = Regex.Replace(verse, "\\s+", " ");

		Debug.Log ("verse after regex filters = " + verse);

		int i = 0;
		bool languageIsWestern = VerseManager.IsLanguageWestern(language);
	
		
		int numSeps = 0;
		int numSpaces = 0;
		
		foreach(char c in verse) {	
			
			localClause = localClause + c;
			char n = ' ';
			if (i < (verse.Length-1)) {
				n = verse[i+1];
			}
			foreach(string s in separators) {
				if (IsSeparator(s,c,n,languageIsWestern)	) {
					if ((localClause != "") && (localClause != " ")) {
						//Debug.Log("process " + clause);
						ProcessClause(localClause, clauseArray);
					}
					localClause = "";
					numSeps += 1;
				}
			}
			
			if (c == ' ') {
				numSpaces += 1;
			}
			
			i += 1;
		}
		
		float spaceSepRatio = (numSeps+1.0f)/(numSpaces+1.0f);
		
		if ((localClause != "") && (localClause != " ") && (localClause != "  ")) {
			ProcessClause(localClause, clauseArray);
		}
		
			
		string phrase = "";
		int phraseLengthForClause = 0;
		bool isCharacterBased = VerseManager.IsCharacterBased(language) && (spaceSepRatio > 1.5f);
	
		//Debug.Log("clause array = " + clauseArray);
		
		foreach(string clause in clauseArray) {
			// check for special '\' marker which we cannot split on
			List<int> nobreakMarkers = new System.Collections.Generic.List<int>();
			float numPhrase = (float)Mathf.RoundToInt((clause.Length + 0.0f)/phraseLength);
			if (numPhrase == 0) numPhrase = 1.0f;
			int breakLength = Mathf.RoundToInt((clause.Length + 0.0f)/numPhrase);
			//Debug.Log("break length = " + breakLength);
			
			for(i=0;i<clause.Length;i++) {
				if (clause[i] == ' ') {
					nobreakMarkers.Add(i);
				} else if ((i % breakLength == 0) && isCharacterBased) {
					nobreakMarkers.Add(i);
				}
			}
			
			nobreakMarkers.Add(clause.Length-1);
			//Debug.Log("nobreak markers = " + nobreakMarkers);
			
			//Debug.Log("clause.Length > phraseLength*clauseBreakMultiplier = " + clause.Length + " >" + phraseLength + "*"+ clauseBreakMultiplier);
			int l = 0;
            if (clause.Length > phraseLength*clauseBreakMultiplier) {
				
				int divisor = Mathf.RoundToInt(1.0f*clause.Length/phraseLength);
				l = 0;
				
				while (l < clause.Length) {
					if (difficulty == Difficulty.Hard) {
						phraseLengthForClause = phraseLength;
					} else {
						phraseLengthForClause = Mathf.RoundToInt((float)(clause.Length/divisor));
					}
					
					if ((l + phraseLengthForClause*1.5f) > clause.Length) {
						phraseLengthForClause = clause.Length - l;	
					}
									
					// glob onto the closest no break marker
					if (nobreakMarkers.Count > 0) {
						int best = 100;
						int bestIndex = -1;
						foreach(int index in nobreakMarkers) {
							int diff = Mathf.Abs(index - (phraseLengthForClause + l));
							if ((diff < best) && (index >= l)) {
								bestIndex = index;
								best = diff;
								//Debug.Log("best index = " + index + " best diff = " +  best);
							}
						}
						if (bestIndex != -1) {
							phraseLengthForClause = bestIndex+1-l;
						}
					}
					
					phrase = clause.Substring(l, phraseLengthForClause);
					
					// filter out no break markers
					phrase = phrase.Replace("／","");
					phrase = phrase.Replace("/","");
					
					if (isChinese) { phrase = phrase.Replace(" ",""); }
					
					// filter out leading or trailing spaces
					if ((phrase.Length > 0) && (phrase[0] == ' ')) {
						phrase = phrase.Substring(1,phrase.Length-1);
					}
					//Debug.Log("phrase.Length = " + phrase.Length);
					if ((phrase.Length > 0) && (phrase[phrase.Length-1] == ' ')) {
						phrase = phrase.Substring(0,phrase.Length-1);
					}
	
					
					l = l + phraseLengthForClause;
					
					if ((phrase != "") && (phrase != " ") && (phrase != "  ")) {
						if (isChinese) {phrase = phrase.Replace(" ","");}
						phraseArray.Add(phrase);
						
					}
				}	
			} else {
				// filter out no break markers
				
				string clauseCopy = clause.Replace("／","");
				clauseCopy = clauseCopy.Replace("/","");
				if (isChinese) {clauseCopy = clauseCopy.Replace(" ","");}
				phraseArray.Add(clauseCopy);
			}
			
			// combine phrases for long laundry lists
			if (phraseArray.Count > 1) {
				l = phraseArray.Count;
				string curPhrase = phraseArray[l-1];
				string prevPhrase = phraseArray[l-2];
				
				int curWords = curPhrase.Trim().Split(' ').Length;
				int prevWords = prevPhrase.Trim().Split(' ').Length;
				
				// try to handle laundry lists, be more generous
				bool hasCommas = ((curPhrase.EndsWith(",") || curPhrase.EndsWith("、")) && (curWords < 2) &&
				 (prevPhrase.EndsWith(",") || curPhrase.EndsWith("、")) && (prevWords < 2));
				 
				if ((difficulty != Difficulty.Hard) && hasCommas && ((curPhrase.Length + prevPhrase.Length - 2) < phraseLength*2.0f)) {
				 UnityEngine.Debug.Log("COMBINE(" + prevPhrase + " | " + curPhrase + ")");
				 	string lastPhrase = phraseArray[phraseArray.Count-1];
				 	phraseArray.RemoveAt(phraseArray.Count-1);
				 
					prevPhrase += " " + lastPhrase;
					phraseArray[l-2] = prevPhrase;
				}
			}
		}
		UnityEngine.Debug.Log("# blocks = " + phraseArray.Count);
		return phraseArray;
	
	}
	
	public void Cleanup() {
		foreach(WordLabel wObject in wordLabels) {
			Destroy(wObject.gameObject);
		}
		activeWordLabels.Clear();
		wordLabels.Clear();
		scrambledWordLabels.Clear();
		needToRecordPlay = true;
	}
	
	public void BeginGame() {
		line = 0;
		wordLabelContainer.Reset();
		skyManager.ZoomOut();
		skyManager.LookAtTerrain();
		skyManager.HideRainbow();
		
		StartCoroutine(SetupVerse());
		
		introReferenceLabel.enabled = false;
		string diffString = VerseManager.DifficultyToString(difficulty);
		string diffSpoken = TextManager.GetText(diffString);
		
		if (lastDiffSpoken != diffSpoken) {
			verseManager.SpeakUtterance(diffSpoken);
			lastDiffSpoken = diffSpoken;
		}
		HandleProgress();
		
		StartCoroutine(AnimateIntro());
	}
	
	public int GetMaxActiveWordIndex() {
		int maxActiveWords = GetMaxWordsActive();
		int maxWords = scrambledWordLabels.Count;
		if ((wordIndex + maxActiveWords) < maxWords) {
			maxWords = wordIndex + maxActiveWords;
		}
		return maxWords;
	}
	
	public void UpdateGravityScale() {
		
		float fellDownEnough = 0.0f;
		
		if (wordIndex <= 0) return;
		if (activeWordLabels.Count == 0) return;
		if (wordIndex >= wordLabels.Count) return;
		
		WordLabel currWordLabel = wordLabels[wordIndex];
		
		foreach(WordLabel wordLabel in activeWordLabels) {
			fellDownEnough += wordLabel.GetPercentFell();
		}
		float f = currWordLabel.GetPercentFell();
		
				
		if (fellDownEnough == 0) {
			fellDownEnough = .1f;
		}
		
		float pct = 1.0f;
		
		pct = fellDownEnough / (1.0f*activeWordLabels.Count);
	
		if (f < pct) {
			pct = 0.5f*f + 0.5f*pct;
		}
		if (pct < .1f) {
			pct = .1f;
		}
		float gravity = 0.1f / (pct*pct);
		//Debug.Log(" pct = " + pct + " gravity = " + gravity);
		foreach(WordLabel wordLabel in activeWordLabels) {
			wordLabel.rigidbody2D.gravityScale = gravity;
		}
		
	}
	
	public int GetMaxWordsActive() {
		
		switch(difficulty) {
			case Difficulty.Easy:
				return 4;
			case Difficulty.Medium:
				return 7;
			case Difficulty.Hard:
				return 12;
			default:
				return 10;

		}
	}
	
	public void SwapWords(int index1,int index2) {
		UnityEngine.Debug.Log("Swap " + index1 + " with " + index2);
		WordLabel word1 = wordLabels[index1];
		WordLabel word2 = wordLabels[index2];
		
		word1.wordIndex = index2;
		word2.wordIndex = index1;
		
		wordLabels[index1] = word2;
		wordLabels[index2] = word1;
	}
	
	public int OrderedIndexOfWord(WordLabel wordLabel) {
		return wordLabels.LastIndexOf(wordLabel);	
	}
	
	public void scrambleWordLabels() {
		scrambledWordLabels = new System.Collections.Generic.List<WordLabel>();
		for(int i=0;i<wordLabels.Count;i++) {
			scrambledWordLabels.Add(wordLabels[i]);
		}
		int maxWordsActive = GetMaxWordsActive();
		int g = Mathf.RoundToInt(GetGroupSize() * 1.25f);
		if (g >= (maxWordsActive-1)) g = (maxWordsActive-1);
		
		int currentIndex = scrambledWordLabels.Count;
		WordLabel temporaryValue = null;
		int randomIndex = 0;
	
	  	// While there remain elements to shuffle...
	  	while (0 != currentIndex) {
	    	// Pick a remaining element...
	    	randomIndex = (int)((currentIndex - g) + Mathf.Floor(UnityEngine.Random.RandomRange(0.0f,1.0f) * g));
	    	if (randomIndex < 0) randomIndex = 0;
	    	currentIndex -= 1;
			int realIndex = OrderedIndexOfWord(scrambledWordLabels[currentIndex]);
			// don't let words get too far away
			if (Mathf.Abs(realIndex - currentIndex) > g*2) {
				UnityEngine.Debug.Log("skip swap, real index: " + realIndex + " curIndex: " + currentIndex);
				continue;
			}
	
	    	// And swap it with the current element.
	    	temporaryValue = scrambledWordLabels[currentIndex];
	    	scrambledWordLabels[currentIndex] = scrambledWordLabels[randomIndex];
	    	scrambledWordLabels[randomIndex] = temporaryValue;
	  	}
	  	
	}
	
	public void AdjustWordScale() {
		WordLabel.ResetVersePosition();
		float minY = screenBounds.y - screenBounds.height;
		float maxX = screenBounds.x + screenBounds.width;
		UnityEngine.Debug.Log("minY = " + minY);
		
		float h = 0.0f;
		WordLabel wordLabel = null;
        for(int i=0;i<wordLabels.Count;i++) {
			wordLabel = wordLabels[i];
			wordLabel.CalculateVersePosition();
			wordLabel.isLastInLine = false;
			wordLabel.isFirstInLine = false;
			h = wordLabel.nonEdgeSize.y;
	        //Debug.Log("verse position = " + wordLabel.versePosition);
		}
		float wordY = (WordLabel.versePosition.y - h);
		
	    UnityEngine.Debug.Log("wordY = " + wordY);
		
		if ((wordY) < minY) {
			wordScale -= 0.025f;
			UnityEngine.Debug.Log("adjust word scale to " + wordScale);
			for(int i=0;i<wordLabels.Count;i++) {
				wordLabel = wordLabels[i];
				wordLabel.SyncFontSize();
			}
			AdjustWordScale();
			return;
		}
		
		WordLabel.ResetVersePosition();
	}
	
	public IEnumerator SetupVerse() {
		SyncSetProgressLabel();
		VerseManager.AddOnlineVerseSetToHistory(VerseManager.GetCurrentVerseSet());
	
		gameStarted = false;
		showingSolution = false;
	
		if (GetChallengeModeEnabled()) {
			scoreManager.resetStatsForChallenge();
		} else {
			scoreManager.reset();
		}
		finished = false;
		difficulty = verseManager.GetCurrentDifficulty();
		int maxWordsActive = GetMaxWordsActive();
		
		Cleanup();
		lastWordTime = Time.time;
		
		WordLabel clone = null;
		
		Verse verse = VerseManager.GetCurrentVerse();
		SetVerseReference(verse.reference, verse.version);
		verseMetadata = verse.GetMetadata();
		//Debug.Log("verse difficulty is " + verseMetadata["difficulty"]);	
		if (verseMetadata["difficulty"] != null) {
			//difficulty = GetDifficultyFromInt(verseMetadata["difficulty"]);
		}
		
		words = SplitVerse(verse.text);
		wordIndex = 0;
		currentWord = words[wordIndex];
		
		if (GetChallengeModeEnabled() && (VerseManager.verseIndex > 0)) {
			int extraTime = scoreManager.CalculateMaxTime();
			int newTime = extraTime + scoreManager.timeLeft;		
			
			float duration = 0.1f*(newTime-scoreManager.timeLeft);
			if ((duration) > 2.0f) duration = 2.0f;
			UnityEngine.Debug.Log("new time = " + newTime + " max time = " + scoreManager.timeLeft);
			StartCoroutine(scoreManager.CountTimeUpTo(newTime));
					
			yield return new WaitForSeconds(duration);
			scoreManager.resetTime();
		} else {
			scoreManager.maxTime = scoreManager.CalculateMaxTime();
		}
		
		int i = 0;
		bool rTL = VerseManager.rightToLeft;
		foreach(string word in words) {
			
			clone = (WordLabel)Instantiate(wordLabel, new Vector3(0.0f,0.0f,0.0f), Quaternion.identity);
			clone.rightToLeft = rTL;
			clone.setWord(word);
			clone.wordIndex = i;
			wordLabels.Add(clone);
			clone.transform.SetParent(wordLabelContainer.transform);
			
			float w = clone.totalSize.x;
			float h = clone.totalSize.y;
			float x = UnityEngine.Random.Range(screenBounds.x+w*0.5f,screenBounds.x+screenBounds.width-w*0.5f);
			float y = screenBounds.y+screenBounds.height+h*2;
			clone.transform.position = new Vector3(x,y,0.0f);
			clone.rigidbody2D.isKinematic = true;
			i += 1;
		}
		
		//AdjustWordScale();
		
		scrambleWordLabels();
		
		yield return new WaitForSeconds(2.5f);
		
		numWordsReleased = 0;	
	
		float dt = 0.1f;
		
		while (numWordsReleased < wordLabels.Count) {
			// don't allow more than maxWordsActive words on screen at the same time
			while (activeWordLabels.Count >= maxWordsActive) {
				yield return new WaitForSeconds(1.0f);
				
			}		
			if (showingSolution || finished) {
				break;
			}
			numWordsReleased = ReleaseWords(numWordsReleased, 1);
			
			yield return new WaitForSeconds(dt);
	
		}
	
		numWordsReleased = wordLabels.Count;
		
	}
	
	public void StartGame() {
		gameStarted = true;
		scoreManager.resetTime();
	}
	
	public WordLabel GetWordLabelAt(int index) {
		if (index < 0) return null;
		if (index >= wordLabels.Count) return null;
		return wordLabels[index];
	}
	
	public int GetGroupSize() {
	 	// try group size = 1
		int groupSize = 3;
		
		switch(difficulty) {
			case Difficulty.Medium:
				groupSize = 4;
				break;
			case Difficulty.Hard:
				groupSize = 5;
				break;
			default:
				break;
		}
		return groupSize;
	}
	
	public int IndexOfActiveWord(WordLabel wordLabel) {
		int index = 0;
		bool found = false;
		foreach(WordLabel wLabel in activeWordLabels) {
			if (wLabel == wordLabel) {
				found = true;
				break;
			}
			index += 1;
		}
		if (found) {
			return index;
		}
		return -1;
	}
	
	public void HandleWordInactive(WordLabel wordLabel) {
		int index = IndexOfActiveWord(wordLabel);
		if (index >= 0) {
			//Debug.Log("remove " + wordLabel.word);
			activeWordLabels.RemoveAt(index);
		}
	}
	
	public int ReleaseWords(int index,int numWords) {
	 	//Debug.Log("release words index = " + index);
	 
		int c  = 0;
		
		int i = 0;
        for(i=index;i<scrambledWordLabels.Count;i++) {
			WordLabel wordObject = scrambledWordLabels[i];
			float h = wordObject.boxCollider2D().size.y;
			var tmp_cs3 = wordObject.transform.position;
            tmp_cs3.y = screenBounds.y+h*2;
            wordObject.transform.position = tmp_cs3;
			wordObject.rigidbody2D.isKinematic = false;
			activeWordLabels.Add(wordObject);
			c += 1;	
			if (c == numWords) {
				break;
			}
		}
		
		return i+1;
	}
	
	public void StartNextDifficulty() {
		verseManager.upgradeDifficultyForVerse(verseMetadata);
		BeginGame();
	}
	
	public void StartAnotherVerse() {
		verseManager.GotoNextVerse();
		BeginGame();
	}
	
	public void HandleRanOutOfTime() {
		DidRanOutOfTime = true;
	
		if (GetChallengeModeEnabled()) {
			foreach(WordLabel wordLabel in wordLabels) {
				wordLabel.collider2D.enabled = false;
			}
		
			StartCoroutine(HandleVerseFinished());
		}
	
	}
	
	public IEnumerator HandleVerseFinished() {
		if (GetChallengeModeEnabled() &&
			!verseManager.IsAtFinalVerseOfChallenge() &&
			!DidRanOutOfTime) {
			finished = true;
			yield return new WaitForSeconds(4.0f);
			StartAnotherVerse();
		} else {
			finished = true;
			gameStarted = false;
			yield return new WaitForSeconds(1.0f);
			//Debug.Log("verse finished");
			scoreManager.HandleFinished();
		}
		HandleProgress();
	}
	
	public void ShowHintFromButton() {
		if (finished) return;
		ShowHint();
		scoreManager.HandleWordWrong();
		audio.PlayOneShot(sndSuccess1, 0.5f);
	}
	
	public void ShowHint() {
		wordHinted = true;	
		if ((wordIndex <= 0) || (wordIndex >= wordLabels.Count)) return;
		WordLabel wObject = wordLabels[wordIndex];
		if ((wObject.word == currentWord) && !wObject.returnedToVerse && !wObject.gotoVerse) {
			StartCoroutine(wObject.HintAt());
		}
		
	}
	
	public void Update() {
		float timeSinceLastWord = Time.time - lastWordTime;
		
		if (!wordHinted && !finished && (timeSinceLastWord > timeUntilHint)) {
			ShowHint();
		}
		refreshButton.active = CanShowSolution() || (finished && !GetChallengeModeEnabled());
		hintButton.active = !GetChallengeModeEnabled();
		
		updateCount += 1;
		
		if (!finished && gameStarted && (updateCount % 10 == 0)) {
			UpdateGravityScale();
		}
	}
	
	public static void StartChallenge() {
		VerseManager vm = (VerseManager)GameObject.FindObjectOfType(typeof(VerseManager));
		VerseManager.verseIndex = 0;
		vm.Save();
		SetChallengeModeEnabled(true);
		
		Application.LoadLevel("scramble");
	}
}
