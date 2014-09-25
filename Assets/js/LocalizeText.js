#pragma strict
import UnityEngine.UI;

function Start () {
	var text = GetComponent(Text);
	text.text = TextManager.GetText(text.text);
}

function Update () {

}