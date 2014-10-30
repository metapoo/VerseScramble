#pragma strict
import UnityEngine.UI;

public var button : Button;
public var verseset : VerseSet;
public var label : Text;
public var normalColor : Color;
public var verseSetsManager : VerseSetsManager;
public var createVerseSet : boolean = false;
static var selectedButton : VerseSetButton = null;

function Awake() {
	normalColor = button.colors.normalColor;
	verseSetsManager = GameObject.Find("VerseSetsManager").GetComponent(VerseSetsManager);
		
}

function Start () {
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
}

function AddToScrollView(scrollContent : RectTransform, index : int) {
	var rt : RectTransform = GetComponent(RectTransform);
	
	rt.SetParent(scrollContent, false);
	var labelTransform : RectTransform = label.GetComponent(RectTransform);
	labelTransform.offsetMin.x = 30;
	labelTransform.offsetMin.y = 10;
	labelTransform.offsetMax.x = -30;
	labelTransform.offsetMax.y = -10;
}

function Metadata() : Hashtable {
	return verseset.GetMetadata(); 
}

function SetVerseSet(vs : VerseSet) {
	verseset = vs;
	label.text = String.Format("{0}", vs.setname);
}

function Highlight() {
	var rt : RectTransform = GetComponent(RectTransform);	
	//Debug.Log("selected button = " + selectedButton);
	if (selectedButton != null) {
		selectedButton.UnHighlight();
	}
	
	button.colors.normalColor = button.colors.highlightedColor;
	selectedButton = this;
	
}

function UnHighlight() {
	button.colors.normalColor = normalColor;
	
}

function HandleApiVerseSetShow(resultData : Hashtable) {
	if (this == null) return;
	
	var versesetData : Hashtable = resultData["verseset"];
	var versesData : Array = resultData["verses"];
	var highScore : int = 0;
	var difficulty : int = 0;
	var mastered : boolean = false;

	if (resultData.ContainsKey("high_score")) {
		highScore = resultData["high_score"];
	}
	if (resultData.ContainsKey("difficulty")) {
		difficulty = resultData["difficulty"];
	}
	if (resultData.ContainsKey("mastered")) {
		mastered = resultData["mastered"];
	}
	
	var metadata : Hashtable = verseset.GetMetadata();
	var currentHighScore : int = metadata["high_score"];
	var currentDifficulty : int = metadata["difficulty"];
	
	if (mastered) difficulty += 1;
	
	var changed : boolean = false;
	
	if (highScore >= currentHighScore) {
		metadata["high_score"] = highScore;
		changed = true;
	}
	
	if (difficulty > currentDifficulty) {
		metadata["difficulty"] = difficulty;
		changed = true;
	}
	
	if (changed) {
		verseset.SaveMetadata(metadata);
	}
	
	VerseManager.LoadVerseSetData(versesetData);
	verseset.LoadVersesData(versesData);
	verseSetsManager.ShowVerses();
	
}

function HandleOnClick() {
	if (createVerseSet) {
		var url : String = ApiManager.GetUrl("/verseset/create");
		Application.OpenURL(url);
		return;
	}
	
	VerseManager.verseIndex = 0;
	VerseManager.SetCurrentVerseSet(verseset);
	Highlight();
	var apiManager : ApiManager = ApiManager.GetInstance();
	
	var handleError : Function = function() {
		apiManager.GetApiCache("verseset/show",
		new Hashtable({"verseset_id":verseset.onlineId}),
		new Hashtable({"handler":HandleApiVerseSetShow}));
	};
	
	if (verseset.isOnline && (verseset.verses.length == 0)) {
		apiManager.CallApi("verseset/show",
		new Hashtable({"verseset_id":verseset.onlineId}),
		new Hashtable({"handler":HandleApiVerseSetShow, 
		"errorHandler":handleError}));
	} else {
		verseSetsManager.ShowVerses();
	}
}

function Update () {

}