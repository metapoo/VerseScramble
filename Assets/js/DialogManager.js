#pragma strict

var popupDialog : PopupDialog;

static function CreatePopupDialog(title : String, description : String) {
	var instance : DialogManager = GameObject.Find("DialogManager").GetComponent(DialogManager);
	instance._CreatePopupDialog(title, description);
}

function _CreatePopupDialog(title : String, description : String) {
	var clone : PopupDialog = Instantiate(popupDialog, Vector3.zero, Quaternion.identity);
	
	var canvas = GameObject.Find("Canvas");
	var rt : RectTransform = clone.GetComponent(RectTransform);
	var sizeDelta : Vector2 = rt.sizeDelta;
	var offsetMin : Vector2 = rt.offsetMin;
	
	clone.SetParent(canvas.GetComponent(RectTransform));	
	clone.SetTitle(title);
	clone.SetDescription(description);
}

function Start () {
	
}

function Update () {

}