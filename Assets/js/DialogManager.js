#pragma strict

var popupDialog : PopupDialog;
var optionDialog : OptionDialog;

static function GetInstance() : DialogManager {
	var go : GameObject = GameObject.Find("DialogManager");
	var instance : DialogManager;
	if (go == null) {
		go = new GameObject("DialogManager");
    	instance = go.AddComponent(typeof(DialogManager));
	} else {
	 	instance = go.GetComponent(DialogManager);
	}
	return instance;
}

static function CreatePopupDialog(title : String, description : String) : PopupDialog {
	return GetInstance()._CreatePopupDialog(title, description);
}

static function CreateOptionDialog(title : String, description : String) : OptionDialog {
	return GetInstance()._CreateOptionDialog(title, description);
}

function GetParent() : RectTransform {
	var canvas = GameObject.Find("Canvas");
	return canvas.GetComponent(RectTransform);
}

function _CreateOptionDialog(title : String, description : String) : OptionDialog {
	var clone : OptionDialog = Instantiate(optionDialog, Vector3.zero, Quaternion.identity);
	clone.SetParent(GetParent());	
	clone.SetTitle(title);
	clone.SetDescription(description);
	return clone;
}

function _CreatePopupDialog(title : String, description : String) : PopupDialog {
	var clone : PopupDialog = Instantiate(popupDialog, Vector3.zero, Quaternion.identity);
	var canvas = GameObject.Find("Canvas");
	clone.SetParent(GetParent());	
	clone.SetTitle(title);
	clone.SetDescription(description);
	return clone;
}

function Start () {
	
}

function Update () {

}