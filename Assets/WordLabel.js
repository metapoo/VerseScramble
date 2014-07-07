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

function setWord(w : String) {
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
	var sr : SpriteRenderer = GetComponent("SpriteRenderer");
	var spriteWidth = sr.sprite.bounds.size.x;
	
	var padding = spriteWidth*0.5;
	var length = word.Length;
	transform.localScale.x = (textWidth + padding) / spriteWidth;
	var yAdjust = 0.6f;
	transform.localScale.y = yAdjust*transform.localScale.y;
	
	var ratio = transform.localScale.x/transform.localScale.y*yAdjust;
	
	label.transform.localScale.x = label.transform.localScale.y/ratio;
	label.transform.localScale.y = label.transform.localScale.y*(1/yAdjust);
	
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
	var dScore = 0;
	var right = false;
	hinting = false;
	if (word == GameManager.currentWord) {
		GetComponent(SpriteRenderer).color = Color.white;
		returnToVerse();
		dScore = gameManager.HandleWordCorrect();
		right = true;
		VerseManager.SpeakUtterance(word);
	} else {
		var oldColor : Color = GetComponent(SpriteRenderer).color;
		GetComponent(SpriteRenderer).color = Color(1.0,0.5,0.5,0.8);
		yield WaitForSeconds(0.1);
		GetComponent(SpriteRenderer).color = oldColor;
		dScore = gameManager.HandleWordWrong();
	}
	
	if (true) {
		var clone : FloatingPoints;
		clone = Instantiate(floatingPoints, transform.position, Quaternion.identity);
		clone.SetPoints(dScore, right);
	}
}
