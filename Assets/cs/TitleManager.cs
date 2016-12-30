using UnityEngine;
using System;
using UnityEngine.SceneManagement;

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
		if (!us.IsUrlDirected()) {
			Debug.Log ("Loading versesets");
			VerseSceneManager.loadVersesets ();
			Debug.Log ("Done loading versesets");
		}
	}
	
	public void Start() {
		if (PlayerPrefs.HasKey("language") && !stayInTitleScreen) {
			string language = VerseManager.GetLanguage();
			VerseManager vm = VerseManager.GetInstance();
			Action<string> loadHandler = LoadVerseSetsMenu;
			vm.SwitchLanguage(language, loadHandler);
		}
	}
	
	public void Update() {
	
	}
}

