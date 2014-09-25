#pragma strict

public var button : Button;
public var label : Text;
private var normalColor : Color;
static var selectedButton : NavigationButton = null;


function Start () {
	button = GetComponent(Button);
	normalColor = button.colors.normalColor;
	button.onClick.AddListener(HandleOnClick);
}

function HandleOnClick() {
	Highlight();
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