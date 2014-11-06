using UnityEngine;
using System;

public class TitleManager:MonoBehaviour{
	
	public static bool stayInTitleScreen;
	
	public void Awake() {
		Application.targetFrameRate = 60;
		string language = VerseManager.GetLanguage();
		if (!TextManager.IsLoaded()) {
			TextManager.LoadLanguageOffline(language);
			TextManager tm = TextManager.GetInstance();
			StartCoroutine(tm.LoadLanguage(language, null));
		}
	}
	
	public void LoadVerseSetsMenu(string language) {
		UserSession us = UserSession.GetUserSession();
		if ((us.verseId == null) && (us.versesetId == null)) {			
			Application.LoadLevel("versesets");
		}
	}
	
	public void Start() {
		if (PlayerPrefs.HasKey("language") && !stayInTitleScreen) {
			string language = VerseManager.GetLanguage();
			VerseManager vm = VerseManager.GetInstance();
			vm.SwitchLanguage(language, LoadVerseSetsMenu as Action<string>);
		}
	}
	
	public void Update() {
	
	}
}

