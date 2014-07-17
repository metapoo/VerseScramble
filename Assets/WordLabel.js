#pragma strict

var label : TextMesh;
var word : String;
var lineNumber : int;
var charPosition : int;
static var versePosition : Vector3;
static var startPosition : Vector3;
var destination : Vector3;
var gotoVerse : boolean = false;
var returnedToVerse : boolean = false;
var startTime : float;
var gameManager : GameManager;
var scoreManager : ScoreManager;
var verseManager : VerseManager;
var hinting : boolean = false;
var floatingPoints : FloatingPoints;
var enFont : Font;
var zhFont : Font;

function SetColor(color : Color) {
	renderer.material.color = color;
}

function GetColor() {
	return renderer.material.color;
}

function SetMeshLength(l : float) {
	var mesh = GetComponent(MeshFilter).mesh;
	var vertices : Vector3[] = mesh.vertices;
	vertices[0] = Vector3(-0.5*l,-0.5,0);
	vertices[1] = Vector3(0.5*l,0.5,0);
	vertices[2] = Vector3(0.5*l,-0.5,0);
	vertices[3] = Vector3(-0.5*l,0.5,0);
	mesh.vertices = vertices;
	mesh.RecalculateBounds();
	
	var boxCollider2D : BoxCollider2D = GetComponent(BoxCollider2D);
	boxCollider2D.size = Vector2(l,1.0);
	var s = 0.25;
	renderer.material.mainTextureScale = Vector2(l*s,1.0*s);
	var ts : Vector2 = renderer.material.mainTextureScale;
	renderer.material.mainTextureOffset = Vector2(Random.RandomRange(0,ts[0]),
	Random.RandomRange(0,ts[1]));
}

function setWord(w : String) {
	var mesh = GetComponent(MeshFilter).mesh;
	
	for (var i=0;i<mesh.vertices.length;i++) {
		Debug.Log("vertex " + i + " = " + mesh.vertices[i]);
	}
	
	var language = verseManager.GetLanguage();

	if (language == "zh") {
		label.font = zhFont;
		label.renderer.material = zhFont.material;
	} else {
		label.font = enFont;
		label.renderer.material = enFont.material;
	}
	
	label.text = w;
	word = w;
	var textWidth = label.renderer.bounds.size.x;
	var textHeight = label.renderer.bounds.size.y;
	
	var spriteWidth = renderer.bounds.size.x;
	var spriteHeight = renderer.bounds.size.y;
	var padding = 0.2;
	
	SetMeshLength(textWidth + padding);
	
}

function Start () {
    var screenBounds = GameManager.screenBounds;
	startPosition = new Vector3(screenBounds.x+screenBounds.width*.075,screenBounds.y-screenBounds.height*0.22);
	versePosition = startPosition;
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}

function FixedUpdate() {
	var m :float = 0.0f;
	rigidbody2D.AddForce(new Vector3(Random.Range(-m,m),
	Random.Range(-m,m),0.0f));
}

function Update () {
	if (gotoVerse) {
		var distance = Vector3.Distance(transform.position, destination);
		var speed: float = 0.5;
		var elapsedTime = (Time.time-startTime);
		transform.position = new Vector3.Lerp(transform.position, destination, speed*elapsedTime);
		if (distance < 0.001) {
			handleReturnedToVerse();
		}
	}
	
	var rotation = transform.eulerAngles.z;
	
	if (Mathf.Abs(rotation - 180.0f) < 60.0f) {
		label.transform.eulerAngles.z = rotation - 180.0f;
	} else {
		label.transform.eulerAngles.z = rotation;
	}
	
}

function handleReturnedToVerse() {
	transform.position = destination;
	returnedToVerse = true;
	gotoVerse = false;
}

function handleTap () {
}

function calculateVersePosition () {
	var spacing = 0.0f;
	var wordWidth = renderer.bounds.size.x;
	
	versePosition.x += wordWidth + spacing;
	
	destination = new Vector3(versePosition.x - wordWidth*0.5 - spacing*0.5f, versePosition.y);
	var screenBounds = GameManager.screenBounds;
	var maxX = screenBounds.x + screenBounds.width*0.95;
	var vSpacing = renderer.bounds.size.y;
	
	if ((destination.x + wordWidth*0.5) > maxX) {
		versePosition = new Vector3(startPosition.x,
									versePosition.y-vSpacing,
									0);
		calculateVersePosition();
	}
}

function returnToVerse () {
	collider2D.enabled = false;
	rigidbody2D.fixedAngle = true;
	rigidbody2D.gravityScale = 0;
	rigidbody2D.isKinematic = true;
	rigidbody2D.velocity = new Vector3(0,0,0);
	transform.rotation = new Quaternion.Euler(0,0,0);
	calculateVersePosition();
	gotoVerse = true;
	
	startTime = Time.time;
	gameManager.nextWord();
}

function HintAt() {
	hinting = true;
	
	while (hinting) {
		Blink();
		yield WaitForSeconds(0.4);
	}		
}

function Blink() {
	var blinkColor : Color = Color(0.3,0.8,0.3,1.0);
	SetColor(blinkColor);
	yield WaitForSeconds(0.2);
	SetColor(Color.white);
}

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
	 
	var dScore = 0;
	var right = false;
	hinting = false;
	
	if (returnedToVerse) {
		VerseManager.SpeakUtterance(word);
		Blink();
		return;
	}
	
	if (word == GameManager.currentWord) {
		SetColor(Color.white);
		returnToVerse();
		dScore = gameManager.HandleWordCorrect();
		right = true;
		VerseManager.SpeakUtterance(word);
	} else {
		dScore = gameManager.HandleWordWrong();
		SetColor(Color(0.8,0.3,0.3,1.0));
		yield WaitForSeconds(0.1);
		SetColor(Color.white);
	}
	
	if (dScore != 0) {
		var clone : FloatingPoints;
		clone = Instantiate(floatingPoints, transform.position, Quaternion.identity);
		clone.SetPoints(dScore, right);
	}
}
