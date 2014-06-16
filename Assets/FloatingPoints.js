#pragma strict

var startTime : float;
var ttl : float;
var startingScale : float;

function Start () {
	rigidbody2D.velocity = new Vector3(0,4,0);
	renderer.sortingLayerID = 0;
	renderer.sortingOrder = 1;	
	renderer.material.color.a = 1.0;
	startTime = Time.time;
	startingScale = transform.localScale.x;
	transform.localScale = new Vector3(0,0,1.0f);
	Debug.Log("startingScale = " + startingScale);
}

function Update () {
	var timeElapsed = Time.time - startTime;
	var scale = startingScale*timeElapsed / (ttl*0.15f);
	if (scale > startingScale) scale = startingScale;
	Debug.Log("scale = " + scale);
	transform.localScale = new Vector3(scale,scale,1.0f);
	
	var duration = 0.33f*ttl;
	
	var alpha = (ttl - timeElapsed) / (duration);
	
	if (alpha < 0) {
		Destroy(this);
		return;
	} else if (alpha > 1) {
		alpha = 1;
	}
	Debug.Log("alpha = " + alpha);
	Debug.Log("time = " + timeElapsed + " ttl = " + ttl);
	renderer.material.color.a = alpha;
}

function SetPoints(dScore : float, right : boolean) {
		
	var plusminus = "+";
	var textMesh = GetComponent(TextMesh);
	
	textMesh.color = new Color(0.2,1.0,0.2,1.0);
	if (!right) {
		plusminus = "";
		if (dScore == 0) plusminus = "-";
		textMesh.color = new Color(1.0,0.1,0.1,1.0);
	}
	Debug.Log(String.Format("SetPoints = {0}{1}",plusminus,dScore));
	textMesh.text = String.Format("{0}{1}",plusminus,dScore);
}