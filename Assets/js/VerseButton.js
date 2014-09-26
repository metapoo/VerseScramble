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

function GetColorForDifficulty(difficultyInt : int) {
	switch(difficultyInt) {
		case 1:
			return new Color(0.5f,1.0f,0.5f,1.0f);
		case 2:
			return Color(1.0f,1.0f,0.5f);
		case 3:
			return Color(1.0f,0.5f,0.5f);
		default:
			return Color.white;	
	}
}

function SetVerse(v : Verse) {
	verse = v;
	
	var highScore;
	
	if (Object.ReferenceEquals(v,null)) {
		highScore = verseManager.GetCurrentVerseSet().GetMetadata()["high_score"];
		label.text = String.Format("{0} - {1}: {2}",
			TextManager.GetText("Play Challenge (All Verses)"),
			TextManager.GetText("high"),
			highScore); //this is what will be written in the rows
		
	} else {
		highScore = verse.GetMetadata()["high_score"];
	
		label.text = String.Format("{0} (high: {1})", verse.reference, 
		highScore);
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
	if (Object.ReferenceEquals(verse,null)) {
		StartChallenge();
		return;
	}
	verseManager.verseIndex = verseIndex;
	verseManager.Save();
	GameManager.SetChallengeModeEnabled(false);
	PlayerPrefs.SetInt("verse_scroll_content_anchored_y",
						parentScrollContent.anchoredPosition.y);
	Application.LoadLevel("scramble");
}


function StartChallenge() {
	verseManager.verseIndex = 0;
	verseManager.Save();
	GameManager.SetChallengeModeEnabled(true);
	Application.LoadLevel("scramble");
}

function Update () {

}