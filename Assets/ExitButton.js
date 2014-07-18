#pragma strict

var gameManager : GameManager;
var level : String;
var sndSelect : AudioClip;


function OnMouseDown() {
    var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
    var hit : RaycastHit2D = Physics2D.GetRayIntersection(ray,Mathf.Infinity);
    var wasReallyHit : boolean = false;  
    if ((hit.collider != null) && (hit.collider.transform == transform))
    {
    	wasReallyHit = true;
    }
    // fix bug where onmousedown is triggered when it shouldn't be
	if (!wasReallyHit)  {
		Debug.Log("exit button not really hit");
		return;
	}
	
	if (gameManager != null) {
		gameManager.Cleanup();
	}
	Application.LoadLevel(level);
	Debug.Log("load level " + level);
}

function OnMouseUp() {
}

function Start () {
	var sr : SpriteRenderer = GetComponent("SpriteRenderer");
	sr.color = new Color(80.0/255.0, 89.0/255.0, 184.0/255.0, 1f);
}

function Update () {

}
