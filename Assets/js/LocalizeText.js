#pragma strict
import UnityEngine.UI;
var originalText : String;
var text : Text;

function Awake() {
	text = GetComponent(Text);
	originalText = text.text;
}

function Start () {
	text.text = TextManager.GetText(originalText);
	Debug.Log(originalText + " -> " + text.text);
}

function Update () {

}