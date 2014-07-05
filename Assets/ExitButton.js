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
	if (!wasReallyHit) return;
	
	audio.PlayOneShot(sndSelect,1.0);
	if (gameManager != null) {
		gameManager.Cleanup();
	}
	Application.LoadLevel(level);
	Debug.Log("load level " + level);
	Destroy(this.gameObject);
}

function OnMouseUp() {
}

function Start () {

}

function Update () {

}

function OnDrawGizmos() {
	var b = collider2D.bounds;
	var t = transform;
	
	// Draw BoxColliders
    if (b != null) { 
		var tl = new Vector3(t.position.x - (b.size.x / 2), t.position.y + (b.size.y / 2), 0f);
        var bl = new Vector3(t.position.x - (b.size.x / 2), t.position.y - (b.size.y / 2), 0f);
        var br = new Vector3(t.position.x + (b.size.x / 2), t.position.y - (b.size.y / 2), 0f);
        var tr = new Vector3(t.position.x + (b.size.x / 2), t.position.y + (b.size.y / 2), 0f);
        Gizmos.color = Color.red;
        Gizmos.DrawLine (tl, bl);
        Gizmos.DrawLine (bl, br);
        Gizmos.DrawLine (br, tr);
        Gizmos.DrawLine (tr, tl);
    }
}