#pragma strict

public var defaultFont : Font;
static var hiRes : boolean;
static var isPhone : boolean;

function GetIsPhone() : boolean {
	var w : float = Screen.width;
	var h : float = Screen.height;
	var dpi : float = Screen.dpi;
	if (dpi == 0) dpi = 200.0f;
	
	Debug.Log("Screen.dpi = " + dpi);
	var l : float = Mathf.Sqrt(w*w+h*h);
	var inches : float = l / dpi;
	Debug.Log("diagonal screen inches = " + inches);
	return inches < 6.0f;
}

function Start () {
	isPhone = GetIsPhone();
}


function Update () {

}