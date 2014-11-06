using UnityEngine;
using System;
using System.Collections.Generic;
using System.Collections;
using System.Globalization;


public class VerseManager:MonoBehaviour{
	
	public string versesetLanguage;
	public int numVerses = 0;
	public int totalScore = -1;
	
	public static TextAsset verseText;
	public static string defaultView = "popular";
	public static bool languageChosen = false;
	public static Hashtable versesetsByView = new Hashtable();
	public static string currentView = null;
	public static VerseSet currentVerseSet = null;
	public static int verseIndex  = 0;
	public static string apiVerseId;
	public static bool rightToLeft = false;
	public static bool loaded = false;
	public static bool offlineVersesLoaded = false;
	public static bool started = false;
	public static bool historyLoaded = false;
	public static Hashtable countries = new Hashtable();
	
	static List<string> RTL_LANGUAGE_CODES = new System.Collections.Generic.List<string>(new string[]{"ar","arc","bcc","bqi","ckb","dv","fa","glk","he","ku","mzn","pnb","ps","sd","ug","ur","yi"});
	
	public static void Unload() {
		foreach(string view in versesetsByView.Keys) {
			List<VerseSet> versesets = versesetsByView[view] as List<VerseSet>;
			
			foreach(VerseSet vs in versesets) {
				vs.HandleRemoved();
			}
			versesets.Clear();
	
		}
		loaded = false;
		offlineVersesLoaded = false;
	
	}
	
	public void SwitchLanguage(string language,Action<string> finishHandler) {
		languageChosen = true;
		SetLanguage(language, finishHandler);
		SetCurrentView(defaultView);
		System.Collections.Generic.List<VerseSet> versesets = GetCurrentVerseSets();
		offlineVersesLoaded = (versesets.Count > 0);
	}
	
	public void Reload() {
		Unload();
		Start();
	}
	
	public static string GetCurrentView(bool withLanguage) {
		string[] parts = currentView.Split('_');
		if (withLanguage) return currentView;
		return parts[0];
	}
	
	public static void SetCurrentView(string view) {
		if (view != "history") {
			view = view+"_"+GetLanguage();
		}
		currentView = view;
		verseIndex = 0;
		List<VerseSet> versesets = GetCurrentVerseSets();
		
		if (currentVerseSet != null) {
			for(int i=0;i<versesets.Count;i++) {
				VerseSet verseset = versesets[i];
				if (verseset.SaveKey() == currentVerseSet.SaveKey()) {
					// current verse set is in view so leave it alone
					return;
				}
			}
		}
		
		if (versesets.Count > 0) {
			currentVerseSet = versesets[0];
		} else {
			currentVerseSet = null;
		}
		UnityEngine.Debug.Log("current view = " + currentView);
	}
	
	public static void AddOnlineVerseSetToHistory(VerseSet verseset) {
		string oldView = GetCurrentView(false);
		int oldIndex = verseIndex;
		VerseSet oldVerseSet = currentVerseSet;
		SetCurrentView("history");
		List<VerseSet> versesets = GetCurrentVerseSets();
		AddOnlineVerseSet(verseset);
		VerseSet vs = versesets[versesets.Count-1];
		
		versesets.Insert(0,vs);
		SetCurrentView(oldView);
		verseIndex = oldIndex;
		currentVerseSet = oldVerseSet;
		UnityEngine.Debug.Log("Add " + verseset.setname + " to verseset history");
	}
	
	public static VerseSet GetCurrentVerseSet() {
	
		if (currentVerseSet != null) {
			//Debug.Log("current verse set = " + currentVerseSet.SaveKey());
			return currentVerseSet;
	 	}
		List<VerseSet> versesets = GetCurrentVerseSets();
		if (versesets.Count == 0) return null;
		VerseSet verseset = versesets[0];
		
		string versesetSaveKey = PlayerPrefs.GetString(String.Format("current_verseset_{0}",GetLanguage()), verseset.SaveKey());
		
		foreach(VerseSet vs in versesets) {
			if (vs.SaveKey() == versesetSaveKey) {
				//Debug.Log("current verse set = " + currentVerseSet.SaveKey());
				return vs;
			}
		}
	
		currentVerseSet = versesets[0];
		//Debug.Log("current verse set (from save) = " + currentVerseSet.SaveKey());
		return currentVerseSet;
	}
	
	public static void SetCurrentVerseSet(VerseSet verseset) {
		UnityEngine.Debug.Log("current verse set = " + verseset.SaveKey());
		currentVerseSet = verseset;
		string language = GetLanguage();
		if (verseset.language != null) {
			SetVerseLanguage(verseset.language);
		} else {
			SetVerseLanguage(language);
		}
		//Debug.Log("verseset set to " + verseset.SaveKey());
		PlayerPrefs.SetString(String.Format("current_verseset_{0}",language), verseset.SaveKey());
	}
	
	public static List<Verse> GetCurrentVerses() {
		VerseSet vs = GetCurrentVerseSet();
		
		if (vs == null) {
			return new System.Collections.Generic.List<Verse>();
		}
		return vs.verses;
	}
	
	public static Verse GetCurrentVerse() {
		System.Collections.Generic.List<Verse> verses = GetCurrentVerses();
		
		if (verseIndex >= verses.Count) {
			verseIndex = 0;
		}
	
		if (verses.Count == 0) {
			SetCurrentView("history");
			LoadVersesLocally();
			verses = GetCurrentVerses();
			if (verses.Count > 0) {
				verseIndex = 0;
				return verses[verseIndex];
			} else {
				return null;
			}
		}
	
		
		return verses[verseIndex];
	}
	
	public static string GetCurrentReference() {
		Verse verse = GetCurrentVerse();
		if (verse != null) {
			return verse.reference;
		}
		return null;
	}
	
	public void SayVerseReference() {
	
		Verse verse = GetCurrentVerse();
		string reference = verse.reference;
		List<string> refParts = new System.Collections.Generic.List<string>(reference.Split(':'));
	
		string language = GetVoiceLanguage();	
		if (IsLanguageChinese(language)) {
			if (refParts.Count < 2) {
				refParts = new System.Collections.Generic.List<string>(reference.Split(new [] {"："},
				StringSplitOptions.None));
			}
			if (refParts.Count == 2) {
				refParts[0] += "章";
				refParts[1] += "節";
			}
		}
			
		foreach(string refPart in refParts) {
			SpeakUtterance(refPart);
		}
	}
	
	public void SpeakUtterance(string word) {
		string voiceLanguage = GetVoiceLanguage();
		SpeakUtterance(word, voiceLanguage);
	}
	
	public IEnumerator SpeakUtteranceViaWeb(string word,string language) {
		// nothing for now
		yield return null;
	}
	
	public void SpeakUtterance(string word,string language) {
	
		if (language == null) return;
		if ((Application.platform!=RuntimePlatform.Android) &&
		    (Application.platform!=RuntimePlatform.IPhonePlayer)) {
		    StartCoroutine(GetInstance().SpeakUtteranceViaWeb(word, language));
		} else {
			VoiceSynth.SpeakUtterance(word,language);
		}
		UnityEngine.Debug.Log(String.Format("Speak utterance: {0} in language {1}", word, language));
	}
	
	// get language localized with region
	public static string GetVoiceLanguage() {
		string language = GetVerseLanguage();
		return GetVoiceLanguage(language);
	}
	
	public static string GetCountryCodeFromLanguage(string language) {
		if (countries.Count == 0) {
		countries.Add("fr","FR");
		countries.Add("en","US");
		countries.Add("zh","TW");
		countries.Add("vi","VN");
		countries.Add("de","DE");
		countries.Add("it","IT");
		countries.Add("da","DK");
		countries.Add("ar","SA");
		countries.Add("cs","CZ");
		countries.Add("fi","FI");
		countries.Add("ur","PK");
		countries.Add("es-ES","ES");
		countries.Add("ja","JP");
		countries.Add("es","MX");
		countries.Add("he","IL");
		countries.Add("ru","RU");
		countries.Add("nl","NL");
		countries.Add("pt","BR");
		countries.Add("no","NO");
		countries.Add("zh-hans","CN");
		countries.Add("id","ID");
		countries.Add("mn","MN");
		countries.Add("ko","KR");
		countries.Add("sv","SE");
		countries.Add("zh-hant","TW");
		countries.Add("sk","SK");
		countries.Add("hi","IN");
		countries.Add("th","TH");
		countries.Add("tr","TR");
		countries.Add("hu","HU");
		countries.Add("ro","RO");
		countries.Add("pl","PL");
		}
		
		if (countries.ContainsKey(language)) {
			return "" + countries[language];
		}
		return null;
	}
	
	// get language localized with region
	public static string GetVoiceLanguage(string language) {
		string country = GetCountryCodeFromLanguage(language);
		if (country != null) {
			string[] parts = language.Split('-');
			language = parts[0];
			return String.Format("{0}-{1}", language, country);
		}
		return null;
	}
	
	public static bool IsLanguageChinese(string language) {
		return (language == "zh") || (language == "zh-hans") || (language == "zh-hant") || (language == "zh-CN") || (language == "zh-TW");
	}
	
	public static bool IsCharacterBased(string language) {
		return ((language == "ja") || IsLanguageChinese(language));
	}
	
	public static bool IsLanguageWestern(string language) {
		return (language == "en") || (language == "de") || (language == "fr") || (language == "es") ||
				(language == "it");
	}
	
	public static VerseManager GetInstance() {
		return (VerseManager)GameObject.FindObjectOfType(typeof(VerseManager));
	}
	
	public static void SetVerseLanguage(string language) {
		PlayerPrefs.SetString("verse_language", language);
		CheckRightToLeft(language);
		
		string gameLanguage = GetLanguage();
		string defaultLanguage = "en";
		// try to load game language as verse language if available
		// and user never "set the language" 
		if ((gameLanguage != language) && (!languageChosen)) {
			bool success = TextManager.LoadLanguageOffline(language);
			if (!success) {
				GetInstance().SetLanguage(defaultLanguage, null);
			} else {
				GetInstance().SetLanguage(language, null);
			}
		}
	}
	
	public static string GetVerseLanguage(){
		string l = PlayerPrefs.GetString("verse_language", "en");
		if (l != null) return l;
		return GetLanguage();
	}
	
	
	public static string GetSystemLanguage() {
		SystemLanguage sl = Application.systemLanguage;
		string fullLang = sl.ToString();
		switch(fullLang) {
			case "English": return "en"; 
			case "Chinese": return "zh-hant";
			case "Korean": return "ko";
			case "Russian": return "ru";
			case "Mongolian": return "mn";
			case "French": return "fr";
			case "Spanish": return "es";
			case "Italian": return "it";
			case "German": return "de";
			default: return "en";
		}
	}
	
	public static string GetLanguage() {
		return PlayerPrefs.GetString("language", GetSystemLanguage());
	}
	
	public void SetLanguage(string language,Action<string> finishHandler) {
		PlayerPrefs.SetString("language", language);
		TextManager.LoadLanguageOffline(language);
		TextManager tm = TextManager.GetInstance();
		StartCoroutine(tm.LoadLanguage(language, finishHandler));
	}
	
	public bool IsAtFinalVerseOfChallenge() {
		System.Collections.Generic.List<Verse> verses = GetCurrentVerses();
		return (GetChallengeModeEnabled()) && (verseIndex >= (verses.Count-1));
	}
	
	public void GotoNextVerse() {
		System.Collections.Generic.List<Verse> verses = GetCurrentVerses();
		verseIndex = verseIndex + 1;
	
		if (verseIndex >= verses.Count) {
			verseIndex = 0;
		}
		
		UnityEngine.Debug.Log("going to verse " + verseIndex);
		Save();
	}
	
	public void Save() {
		string language = GetLanguage();
		PlayerPrefs.SetInt("verseIndex_"+language, verseIndex);
	}
	
	public string MasteredVersesKey(Difficulty difficulty) {
		string diffkey = "easy";
		switch(difficulty) {
			case Difficulty.Easy:
				diffkey = "easy";
				break;
			case Difficulty.Medium:
				diffkey = "medium";
				break;
			case Difficulty.Hard:
				diffkey = "hard";
				break;
			default:
				break;
		}
		string key = diffkey + "_verses_mastered_"+GetLanguage();
		return key;
	}
	
	public static Difficulty GetNextDifficulty(Difficulty difficulty) {
		switch(difficulty) {
			case(Difficulty.Easy):
				difficulty = Difficulty.Medium;
				break;
			case(Difficulty.Medium):
				difficulty = Difficulty.Hard;
				break;
			case(Difficulty.Hard):
				difficulty = Difficulty.Impossible;
				break;
			default:
				break;
		}
		return difficulty;
	}
	
	public void upgradeDifficultyForVerseSet(Hashtable versesetMetadata) {
		Difficulty difficulty = GetDifficultyFromInt((int)versesetMetadata["difficulty"]);
		difficulty = GetNextDifficulty(difficulty);
		versesetMetadata["difficulty"] =(int)difficulty;
		VerseSet verseset = GetCurrentVerseSet();
		verseset.SaveMetadata(versesetMetadata);
	}
	
	
	public void upgradeDifficultyForVerse(Hashtable verseMetadata) {
		Difficulty difficulty = GetDifficultyFromInt((int)verseMetadata["difficulty"]);
		difficulty = GetNextDifficulty(difficulty);
		verseMetadata["difficulty"] =(int)difficulty;
		Verse verse = GetCurrentVerse();
		verse.SaveMetadata(verseMetadata);
	}
	
	public void HandleVerseSetMastered(Difficulty difficulty,Hashtable verseSetMetadata) {
	
		int categoryDifficultyInt = (int)verseSetMetadata["difficulty"];
		int difficultyInt =(int)difficulty;
		
		if (difficultyInt >= categoryDifficultyInt) {
			upgradeDifficultyForVerseSet(verseSetMetadata);
		}	
	}
	
	
	public void HandleVerseMastered(Difficulty difficulty,Hashtable verseMetadata) {
		int verseDifficultyInt = (int)verseMetadata["difficulty"];
		int difficultyInt =(int)difficulty;
		//Debug.Log ( verseDifficultyInt + " vs " + difficultyInt);
		
		if (difficultyInt >= verseDifficultyInt) {
			upgradeDifficultyForVerse(verseMetadata);
		}	
		SyncMasteredVerses(difficulty);	
	}
	
	public void SetMasteredVerses(Difficulty difficulty,int numVerses) {
		string diffkey = MasteredVersesKey(difficulty);
		PlayerPrefs.SetInt(diffkey, numVerses);
	}
	
	public static string DifficultyToString(Difficulty difficulty) {
		switch (difficulty) {
			case Difficulty.Easy: 
				return TextManager.GetText("easy");
			case Difficulty.Medium: 
				return TextManager.GetText("medium");
			case Difficulty.Hard: 
				return TextManager.GetText("hard");
			case Difficulty.Impossible: 
				return TextManager.GetText("impossible");	
			default: 
				return "easy";
		}		
	}
	
	public static bool GetChallengeModeEnabled() {
		return PlayerPrefs.GetInt("challenge_mode") == 1;
	}
	
	public Difficulty GetCurrentDifficulty() {
		Difficulty selectedDifficulty = GetSelectedDifficulty();
		VerseSet verseset = currentVerseSet;
		Verse verse = GetCurrentVerse();
		if (verse == null) {
			return Difficulty.Easy;
		}
	
		Hashtable metadata =	verse.GetMetadata();
		
		if (GetChallengeModeEnabled()) {
			metadata = verseset.GetMetadata();
		}
	
		int maxDifficultyInt = (int)metadata["difficulty"];	
		
		if ((maxDifficultyInt <(int)selectedDifficulty) &&
		    !GetChallengeModeEnabled()) {
			Difficulty cappedDifficulty = GetDifficultyFromInt(maxDifficultyInt);
			SetDifficulty(cappedDifficulty);
			return cappedDifficulty;
		} else {
			return selectedDifficulty;
		}
	}
	
	public bool IsDifficultyAllowed(Difficulty difficulty) {
		return (int)difficulty <=GetCurrentDifficultyAllowed();
	}
	
	public int GetCurrentDifficultyAllowed() {
		Hashtable metadata = null;
	
		if (GameManager.GetChallengeModeEnabled()) {
			metadata = currentVerseSet.GetMetadata();
		} else {
			Verse verse = GetCurrentVerse();
			metadata =	verse.GetMetadata();
		}
		int maxDifficultyInt = (int)metadata["difficulty"];
		return (int)GetDifficultyFromInt(maxDifficultyInt);
	}
	
	public static Difficulty GetDifficultyFromInt(int difficultyInt) {
		switch(difficultyInt) {
			case 0: return Difficulty.Easy; 
			case 1: return Difficulty.Medium;
			case 2: return Difficulty.Hard; 
			case 3: return Difficulty.Impossible;
			default:
				return Difficulty.Easy;
		}
	}
	
	public void SetDifficulty(Difficulty difficulty) {
		PlayerPrefs.SetInt("selected_difficulty_"+GetLanguage(),(int)difficulty);	
	}
	
	public Difficulty GetSelectedDifficulty() {
		int result = PlayerPrefs.GetInt("selected_difficulty_"+GetLanguage(),0);
		return GetDifficultyFromInt(result);
	}
	
	public Difficulty GetNextDifficulty() {
		Difficulty difficulty = GetCurrentDifficulty();
		return GetNextDifficulty(difficulty);
	}
	
	public void SyncMasteredVerses(Difficulty difficulty) {
		int masteredVerses = 0;
		List<Verse> verses = GetCurrentVerses();
		
		foreach(Verse verse in verses) {
			Hashtable verseMetadata =	verse.GetMetadata();
			int currentDifficultyInt = (int)verseMetadata["difficulty"];
			if (currentDifficultyInt >(int)difficulty) {
				masteredVerses += 1;
			}
		}
		SetMasteredVerses(difficulty, masteredVerses);
	}
	
	public static VerseSet AddOnlineVerseSet(VerseSet verseset) {
		List<VerseSet> versesets = GetCurrentVerseSets();
		// if verse set already exists, replace the old one and return the new
		for(int i=0;i<versesets.Count;i++) {
			VerseSet vs = versesets[i];
			if (verseset.SaveKey() == vs.SaveKey()) {
				versesets.RemoveAt(i);
				
				if (vs != verseset) {
					vs.HandleRemoved();
				}
				
				versesets.Add(verseset);
				
				return verseset;
			}
		}
		versesets.Add(verseset);
		return verseset;
	}
	
	public static VerseSet CreateVerseSet(string name) {
		List<VerseSet> versesets = GetCurrentVerseSets();
		VerseSet vs = new VerseSet(name);
		vs.language = GetLanguage();
		versesets.Add(vs);
		return vs;
	}
	
	public static void CheckRightToLeft(string language) {
		for(int i=0;i<RTL_LANGUAGE_CODES.Count;i++) {
			if (language == RTL_LANGUAGE_CODES[i]) {
				rightToLeft = true;
				return;
			}
		}
		rightToLeft = false;
	}
	
	public void LoadOnlineVerse(string verseId) {
		LoadOnlineVerse(verseId, true);
	}
	
	public void HandleVerseShow(Hashtable resultData) {
		Hashtable verseData = (Hashtable)resultData["verse"];
		string versesetId = verseData["verseset_id"].ToString ();
		string verseId = verseData["_id"].ToString ();
		LoadOnlineVerseSet(versesetId, verseId);
	}
		
	public void LoadOnlineVerse(string verseId,bool includeSet) {
		
		Hashtable arguments = new Hashtable();
		arguments.Add("verse_id",verseId);
		Hashtable options = new Hashtable();
		options.Add("handler",HandleVerseShow as Action<Hashtable>);
		
		StartCoroutine(ApiManager.GetInstance().CallApi("verse/show", 
		arguments, 
		options));
		
	}
	
	public void LoadOnlineVerseSet(string versesetId) {
		LoadOnlineVerseSet(versesetId, null);
	}
	
	public static VerseSet LoadVerseSetData(Hashtable versesetData) {
		string language = versesetData["language"] as string;
		string version = versesetData["version"] as string;
		string setname = versesetData["name"] as string;
		string versesetId = versesetData["_id"] as string;
		int verseCount = (int) versesetData["verse_count"];
		//Debug.Log("setname = " + setname + " verse count = " + verseCount);
		VerseSet verseset = VerseSet.GetVerseSet(versesetId, setname, language, version);
		verseset.verseCount = verseCount;
		AddOnlineVerseSet(verseset);
		return verseset;
	}
	
	public void HandleShowVerseSet(Hashtable resultData) {
		Hashtable versesetData = (Hashtable)resultData["verseset"];
		List<object> versesData = (List<object>)resultData["verses"];
		VerseSet verseset = LoadVerseSetData(versesetData);
		SetCurrentVerseSet(verseset);
		verseIndex = 0;
		verseset.LoadVersesData(versesData);
		verseIndex = verseset.IndexOfVerseId(apiVerseId);
		if (verseIndex < 0) verseIndex = 0;
			
		GameManager.SetChallengeModeEnabled((apiVerseId == null));
		GameManager gm = GameManager.GetInstance();
		if (gm != null) {
			gm.SyncSetProgressLabel();
		}
		loaded = true;
		UserSession.GetUserSession().ClearUrlOptions();
//		UnityEngine.Debug.Log("finished loading verse set");
	}
		
	public void LoadOnlineVerseSet(string versesetId,string verseId) {
		SetCurrentView("history");
		apiVerseId = verseId;
		Hashtable arguments = new Hashtable();
		arguments.Add("verseset_id", versesetId);
		Hashtable options = new Hashtable();
		options.Add("handler",HandleShowVerseSet as Action<Hashtable>);
		
		StartCoroutine(ApiManager.GetInstance().CallApi("verseset/show",
		arguments,
		options));
	}
	
	public void LoadVerses() {
		
		UserSession us = UserSession.GetUserSession();
		
		if (us != null) {
			if ((us.verseId != null) && (us.verseId != "")) {
				LoadOnlineVerse(us.verseId);
				return;
			}
			if ((us.versesetId != null) && (us.verseId != "")) {
				LoadOnlineVerseSet(us.versesetId);
				return;
			}
		}
	
		LoadVersesLocally();
	}
	
	public static void LoadVersesLocally() {
		if (offlineVersesLoaded) {
			return;
		}
		UnityEngine.Debug.Log("Loading verses locally..");
		
		string language = GetLanguage();
		
		string filename = String.Format("verses_{0}", language.ToLower());
		
		string fullpath = "Languages/" +  filename ; // the file is actually ".txt" in the end
	 
	 	UnityEngine.Debug.Log(fullpath);
	 	
	    verseText =  (TextAsset)UnityEngine.Resources.Load(fullpath, typeof(TextAsset));
	    
	    if (verseText == null) {
	    	UnityEngine.Debug.Log(fullpath + " not found");
			offlineVersesLoaded = true;
			loaded = true;
			return;
	    }
	    
	 	string previousView = currentView;
	 	SetCurrentView("history");
	
		offlineVersesLoaded = true;
		string lang = GetLanguage();
		SetVerseLanguage(lang);
	  	List<string> lines = new System.Collections.Generic.List<string>(verseText.text.Split('\n'));
	  	string sep = "|";
	  	string name = null;
	  	VerseSet verseset = null;
	  	Verse verse = null;
	  	
	  	foreach(string line in lines) {
	  		if ((line.Length > 0) && (line[0] == '|')) {
	  			name = line.Replace("|","");
	  			verseset = CreateVerseSet(name);
	  			continue;
	  		}
	  		string[] parts = line.Split(new string[]{sep}, System.StringSplitOptions.None);
	  		if (parts.Length != 2) continue;
	  		
	  		string text = parts[1];
	  		string[] deleteLetters = new string[]{"“","”"};
	  		string[] spaceLetters = new string[]{"-","—","  ","\t"};
	  		
	  		foreach(string badLetter in deleteLetters) {
		  		text = text.Replace(badLetter,"");
		  	}
		  	foreach(string badLetter in spaceLetters) {
		  		text = text.Replace(badLetter," ");
		  	}
		  	
	  		string reference  = parts[0];
	  		verse = new Verse(reference, text, verseset);
	  		
	  		verseset.AddVerse(verse);  	
	  	}
	  	Load();
	  	loaded = true;
	  	if (previousView != null) {
	  		SetCurrentView(previousView);
	  	}
	  	
	}
	
	public static List<VerseSet> GetCurrentVerseSets() {
		return GetVerseSets(currentView);
	}
	
	public static void ClearVerseSets(string view) {
		if (view != "history") {
			view = view + "_" + GetLanguage();
		}
		List<VerseSet> vs = (List<VerseSet>)versesetsByView[view];
		if (vs != null) {
			vs.Clear();
		}
	}
	
	public static List<VerseSet> GetVerseSets(string view) {
		if (versesetsByView.ContainsKey(view)) {
			return (List<VerseSet>)versesetsByView[view];
		}
		versesetsByView[view] = new System.Collections.Generic.List<VerseSet>();
		return (List<VerseSet>)versesetsByView[view];
	}
	
	public void Awake() {
	}
	
	public static void Load() {
		verseIndex = PlayerPrefs.GetInt("verseIndex_"+GetLanguage(), 0);
	}
	
	public void Start() {
		if (!started) {
			SetCurrentView(defaultView);		
		}
		LoadVerses();
		Load();
		started = true;
	}
	
	public void Update() {
	
	}

}
