#pragma strict

var optionButton : OptionButton;
var title : String;
var description : String;
var titleText : Text;
var descriptionText : Text;
var numOptions : int = 0;
var descriptionPanel : RectTransform;
var windowPadding = 60;
var buttonPadding = 30;
	
function HandleOkayButtonClick() {
	CloseDialog();
}

function CloseDialog() {
	GameManager.endPopup = null;
	Destroy(this.gameObject);
}

function PlaceBottom() {
	var rt: RectTransform = GetComponent(RectTransform);
	rt.anchorMax.y = 0.05f;
	rt.anchorMin.y = 0.05f;
	rt.pivot.y = 0.0f;
}

function SetParent(prt : RectTransform) {
	var rt : RectTransform = GetComponent(RectTransform);
	var oldPosition = rt.anchoredPosition;
	var oldScale = rt.localScale;
	
	rt.SetParent(prt);
	
	rt.anchoredPosition = oldPosition;
	rt.localScale = oldScale;
	
}

function SetTitle(_title : String) {
	titleText.text = _title;
	title = _title;
}

function SetDescription(_description : String) {
	descriptionText.text = _description;
	description = _description;
	if (description == "") {
		GetComponent(RectTransform).sizeDelta.y -= (descriptionPanel.sizeDelta.y + buttonPadding);
		descriptionPanel.sizeDelta.y = 0;
	}
}

function AddOption(label : String, handler : Function) {
	numOptions += 1;
	var optButton : OptionButton = Instantiate(optionButton, Vector3.zero, Quaternion.identity);
	optButton.SetParent(GetComponent(RectTransform));
	optButton.SetLabel(label);
	
	var button : Button = optButton.GetComponent(Button);
	button.onClick.AddListener(function() {handler();});
	button.onClick.AddListener(CloseDialog);
	var rt : RectTransform = optButton.GetComponent(RectTransform);
	
	var height = (rt.sizeDelta.y + buttonPadding);
	rt.anchoredPosition.y = windowPadding + height * (numOptions - 1);
	GetComponent(RectTransform).sizeDelta.y += height;
}

function Start () {
}

function Update () {

}