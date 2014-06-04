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
var hinting : boolean = false;

function setWord(w : String) {
	label.text = w;
	word = w;
	var textWidth = label.renderer.bounds.size.x;
	var sr : SpriteRenderer = GetComponent("SpriteRenderer");
	var spriteWidth = sr.sprite.bounds.size.x;
	
	var padding = spriteWidth*0.5;
	var length = word.Length;
	transform.localScale.x = (textWidth + padding) / spriteWidth;
	var yAdjust = 0.65f;
	transform.localScale.y = yAdjust*transform.localScale.y;
	
	var ratio = transform.localScale.x/transform.localScale.y*yAdjust;
	
	label.transform.localScale.x = label.transform.localScale.y/ratio;
	label.transform.localScale.y = label.transform.localScale.y*(1/yAdjust);
	
}

function Start () {

    var screenBounds = GameManager.screenBounds;
	startPosition = new Vector3(screenBounds.x+screenBounds.width*.1,screenBounds.y-screenBounds.height*0.3);
	versePosition = startPosition;
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
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
	rigidbody2D.isKinematic = true;
	rigidbody2D.velocity = new Vector3(0,0,0);
	transform.rotation = new Quaternion.Euler(0,0,0);
	calculateVersePosition();
	gotoVerse = true;
	
	startTime = Time.time;
	gameManager.nextWord();
}

function HintAt() {
	var oldColor : Color = GetComponent(SpriteRenderer).color;
	var blinkColor : Color = Color(0.2,0.8,0.2,1.0);
	hinting = true;
	
	while (hinting) {
		GetComponent(SpriteRenderer).color = blinkColor;
		yield WaitForSeconds(0.2);
		GetComponent(SpriteRenderer).color = oldColor;
		yield WaitForSeconds(0.2);
	}		
}

function OnMouseDown() {  
	hinting = false;
	if (word == GameManager.currentWord) {
		GetComponent(SpriteRenderer).color = Color.white;
		returnToVerse();
		gameManager.HandleWordCorrect();
	} else {
		var oldColor : Color = GetComponent(SpriteRenderer).color;
		GetComponent(SpriteRenderer).color = Color(1.0,0.5,0.5,0.8);
		yield WaitForSeconds(0.1);
		GetComponent(SpriteRenderer).color = oldColor;
		gameManager.HandleWordWrong();
	}
}
