#pragma strict

var okayButton : Button;
var title : String;
var description : String;
var titleText : Text;
var descriptionText : Text;

function HandleOkayButtonClick() {
	Destroy(this.gameObject);
}

function SetTitle(_title : String) {
	titleText.text = TextManager.GetText(_title);
	title = _title;
}

function SetDescription(_description : String) {
	descriptionText.text = TextManager.GetText(_description);
	description = _description;
}

function Start () {
	okayButton.onClick.AddListener(HandleOkayButtonClick);
	SetTitle(title);
	SetDescription(description);
}

function Update () {

}