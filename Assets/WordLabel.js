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

function setWord(w : String) {
	label.text = w;
	word = w;
	var length = word.Length;
	transform.localScale.x = .25*(length+1);
	var ratio = transform.localScale.x/transform.localScale.y;
	label.transform.localScale.x = label.transform.localScale.y/ratio;
}

function Start () {
    var screenBounds = GameManager.screenBounds;
	startPosition = new Vector3(screenBounds.x+screenBounds.width*.1,screenBounds.y-screenBounds.height*0.3);
	versePosition = startPosition;
	gameManager = GameObject.Find("_GM").GetComponent("GameManager");
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
}

function handleReturnedToVerse() {
	transform.position = destination;
	returnedToVerse = true;
	gotoVerse = false;
}

function handleTap () {
	Debug.Log("Tap " + word);
}

function calculateVersePosition () {
	var spacing = 0.0f;
	var wordWidth = renderer.bounds.size.x;
	
	versePosition.x += wordWidth + spacing;
	
	destination = new Vector3(versePosition.x - wordWidth*0.5 - spacing*0.5f, versePosition.y);
	var screenBounds = GameManager.screenBounds;
	var maxX = screenBounds.x + screenBounds.width*0.85;
	var vSpacing = renderer.bounds.size.y;
	
	if (destination.x > maxX) {
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
	rigidbody2D.velocity = new Vector3(0,0,0);
	transform.rotation = new Quaternion.Euler(0,0,0);
	calculateVersePosition();
	gotoVerse = true;
	
	startTime = Time.time;
	gameManager.nextWord();
}

function OnMouseDown() {  
	if (word == GameManager.currentWord) {
		GetComponent(SpriteRenderer).color = Color.white;
		returnToVerse();
		gameManager.wordCorrect();
	} else {
		var oldColor : Color = GetComponent(SpriteRenderer).color;
		GetComponent(SpriteRenderer).color = Color.red;
		yield WaitForSeconds(0.1);
		GetComponent(SpriteRenderer).color = oldColor;
		gameManager.wordWrong();
	}
}
