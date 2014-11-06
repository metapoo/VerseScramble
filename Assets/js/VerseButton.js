#pragma strict

public var button : Button;
public var verse : Verse;
public var label : Text;
public var verseIndex : int;
public var verseManager : VerseManager;
public var parentScrollContent : RectTransform;

function Awake() {
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
	verseManager = GameObject.FindObjectOfType(VerseManager);
}

function GetColorForDifficulty(difficultyInt : int) : Color {
	switch(difficultyInt) {
		case 1:
			return Color(0.5f,1.0f,0.5f,1.0f);
			break;
		case 2:
			return Color(1.0f,1.0f,0.5f);
			break;
		case 3:
			return Color(1.0f,0.5f,0.5f);
			break;
		default:
			return Color.white;	
			break;
	}
}

function SetVerse(v : Verse) {
	verse = v;
	
	var highScore : int;
	
	if (Object.ReferenceEquals(v,null)) {
		var verseset : VerseSet = VerseManager.GetCurrentVerseSet();
		if (Object.ReferenceEquals(verseset, null)) return;
		highScore = verseset.GetMetadata()["high_score"];
		label.text = String.Format("{0} - {1}: {2}",
			TextManager.GetText("Play Challenge (All Verses)"),
			TextManager.GetText("High"),
			highScore); //this is what will be written in the rows
		var versesetDifficulty : int = verseset.GetMetadata()["difficulty"];
		button.colors.normalColor = GetColorForDifficulty(versesetDifficulty);
		
	} else {
		highScore = verse.GetMetadata()["high_score"];
	
//		label.text = String.Format("{0} (high: {1})", verse.reference, 
//		highScore);
		label.text = verse.reference;
		var verseDifficulty : int = v.GetMetadata()["difficulty"];
		button.colors.normalColor = GetColorForDifficulty(verseDifficulty);
	}
}

function AddToScrollView(scrollContent : RectTransform, index : int) {
	var rt : RectTransform = GetComponent(RectTransform);
	
	rt.SetParent(scrollContent, false);
	var labelTransform : RectTransform = label.GetComponent(RectTransform);
	labelTransform.offsetMin.x = 0;
	labelTransform.offsetMin.y = 0;
	labelTransform.offsetMax.x = 0;
	labelTransform.offsetMax.y = 0;
	
	parentScrollContent = scrollContent;
}

function  HandleOnClick() {
	var loginPanel : LoginPanel = GameObject.FindObjectOfType(LoginPanel);
	if (loginPanel != null) {
		return;
	}
	var versesetId : String = VerseManager.currentVerseSet.onlineId;
	GameManager.needToRecordPlay = true;
	
	var playVerse = function() {
		if (Object.ReferenceEquals(verse,null)) {
			StartChallenge();
			return;
		}
	
		VerseManager.verseIndex = verseIndex;
		verseManager.Save();
		GameManager.SetChallengeModeEnabled(false);
		PlayerPrefs.SetInt("verse_scroll_content_anchored_y",
						parentScrollContent.anchoredPosition.y);
	
		Application.LoadLevel("scramble");
	};

	playVerse();
}


function StartChallenge() {
	GameManager.StartChallenge();
}

function Update () {

}