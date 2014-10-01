#pragma strict

var optionButton : OptionButton;
var title : String;
var description : String;
var titleText : Text;
var descriptionText : Text;
var numOptions : int = 0;

function HandleOkayButtonClick() {
	Destroy(this.gameObject);
}

function SetParent(prt : RectTransform) {
	var rt : RectTransform = GetComponent(RectTransform);
	var oldPosition = rt.anchoredPosition;
	var oldScale = rt.localScale;
	
	rt.SetParent(prt);
	
	rt.anchoredPosition = oldPosition;
	rt.localScale = oldScale;
	
	SetTitle("TITLE");
	SetDescription("DESCRIPTION");
	
}

function SetTitle(_title : String) {
	titleText.text = TextManager.GetText(_title);
	title = _title;
}

function SetDescription(_description : String) {
	descriptionText.text = TextManager.GetText(_description);
	description = _description;
}

function CloseDialog() {
	Destroy(this.gameObject);
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
	var windowPadding = 60;
	var buttonPadding = 30;
	var height = (rt.sizeDelta.y + buttonPadding);
	rt.anchoredPosition.y = windowPadding + height * (numOptions - 1);
	GetComponent(RectTransform).sizeDelta.y += height;
}

function Start () {
	SetTitle(title);
	SetDescription(description);
}

function Update () {

}