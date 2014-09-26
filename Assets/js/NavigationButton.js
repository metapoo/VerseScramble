#pragma strict

public var button : Button;
public var label : Text;
public var view : String;
public var verseSetsManager : VerseSetsManager;

private var normalColor : Color;
static var selectedButton : NavigationButton = null;

function Awake() {
	normalColor = button.colors.normalColor;
	verseSetsManager = GameObject.FindObjectOfType(VerseSetsManager);
	button = GetComponent(Button);
	button.onClick.AddListener(HandleOnClick);
}

function Start () {
}

function HandleOnClick() {
	Highlight();
	VerseManager.SetCurrentView(view);
	verseSetsManager.ShowVerseSets();
	verseSetsManager.ShowVerses();
}

function Highlight() {
	var rt : RectTransform = GetComponent(RectTransform);	
	if (selectedButton != null) {
		selectedButton.UnHighlight();
	}
	selectedButton = this;
	button.colors.normalColor = button.colors.highlightedColor;
}

function UnHighlight() {
	button.colors.normalColor = normalColor;
}

function Update () {

}