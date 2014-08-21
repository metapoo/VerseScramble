#pragma strict

var label : TextMesh;
var bgMiddle : SpriteRenderer;
var bgLeft : SpriteRenderer;
var bgRight : SpriteRenderer;
var word : String;
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
var oldRotation : Quaternion;
var scoreCredited : float;
var exploding : boolean = false;
var totalSize : Vector3;
var nonEdgeSize : Vector3;
var shrinkEdgeFactor : float = 0.5f;
var wordIndex : int;
var isFirstInLine : boolean;
var isLastInLine : boolean;
private var shrinkingEdges : boolean = false;

function Explode() {
	if (exploding || !returnedToVerse) return;
	
	ResetBubble();
	exploding = true;
	var wasReturnedToVerse = returnedToVerse;
	
	if (scoreCredited > 0) {
		var clone : FloatingPoints;
		clone = Instantiate(floatingPoints, transform.position, Quaternion.identity);
		clone.SetPoints(-1*scoreCredited, false);
		scoreManager.score -= scoreCredited;
		scoreCredited = 0;
	}
	
	versePosition = startPosition;
	hinting = false;
	collider2D.enabled = true;
	rigidbody2D.fixedAngle = false;
	rigidbody2D.isKinematic = false;
	gotoVerse = false;
	returnedToVerse = false;
	rigidbody2D.AddForce (new Vector3(Random.Range(-100,100), Random.Range(300,400), 0));
	rigidbody2D.gravityScale = 1.0;
	rigidbody2D.AddTorque(Random.Range(-100,100));
	yield WaitForSeconds(3);
	exploding = false;
	rigidbody2D.gravityScale = 0.1;
}

function FixedUpdate() {
}

function SetColor(color : Color) {
	bgMiddle.renderer.material.color = color;
	bgLeft.renderer.material.color = color;
	bgRight.renderer.material.color = color;
	
}

function GetColor() {
	return bgMiddle.renderer.material.color;
}

function boxCollider2D() {
	var boxCollider2D : BoxCollider2D = GetComponent(BoxCollider2D);
	return boxCollider2D;
}

function SetBlockLength(l : float, h : float) {
	var elements = [bgLeft, bgRight, bgMiddle];
	
	for (var el in elements) {
		el.transform.localScale = Vector3.one;
	}
	
	var padding = bgLeft.bounds.size.x + bgRight.bounds.size.y;
	l -= padding;
	var size : Vector3 = bgMiddle.renderer.bounds.size;
	
	var yScale = h / size.y;
	var xScale = l / size.x;
	bgMiddle.transform.localScale = Vector3(xScale, yScale, 1.0f);
	bgMiddle.transform.localPosition = Vector3(0,0,0);
	bgLeft.transform.localScale = Vector3(yScale, yScale, 1.0f);
	bgLeft.transform.localPosition = Vector3(-l*0.5f,0,0.0f);
	bgRight.transform.localScale = Vector3(yScale, yScale, 1.0f);
	bgRight.transform.localPosition = Vector3(l*0.5f,0,0.0f);
	
	var sm = bgMiddle.renderer.bounds.size;
	var sr = bgLeft.renderer.bounds.size;
	var sl = bgRight.renderer.bounds.size;
	var f = shrinkEdgeFactor;
	totalSize = new Vector3(sl.x+sm.x+sr.x, sm.y, sm.z);
	nonEdgeSize = new Vector3(totalSize.x-f*sl.x-f*sr.x,sm.y,sm.z);
	boxCollider2D().size = Vector2(totalSize.x,totalSize.y);
	
	for (var el in elements) {
		Debug.Log(el.transform.position);
	}
}

function ShrinkLeftEdge(duration : float) {
	while (shrinkingEdges) {
		yield WaitForSeconds(0.1f);
	}
	shrinkingEdges = true;
	var startScale = bgLeft.transform.localScale;
	var endScale = new Vector3(0,startScale.y, startScale.z);
	var dw = bgLeft.renderer.bounds.size.x;
	
	var f = shrinkEdgeFactor;
	
	// move right edge to the right and shrink
	AnimationManager.ScaleOverTime(bgLeft.transform,endScale, duration);
	AnimationManager.TranslationBy(bgLeft.transform,new Vector3(-1*dw*f,0,0), duration);
	
	var oldW = bgMiddle.renderer.bounds.size.x;
	var newW = oldW+dw;
	startScale = bgMiddle.transform.localScale;
	endScale = new Vector3(startScale.x*newW/oldW, startScale.y, startScale.z);
	
	// scale middle to fill in gap, move right to compensate
	AnimationManager.ScaleOverTime(bgMiddle.transform, endScale, duration);
	AnimationManager.TranslationBy(bgMiddle.transform, new Vector3(-0.5f*dw*f,0,0), duration);
		
	yield WaitForSeconds(duration);
	shrinkingEdges = false;
}

function ShrinkRightEdge(duration : float) {
	while (shrinkingEdges) {
		yield WaitForSeconds(0.1f);
	}
	shrinkingEdges = true;
	var startScale = bgRight.transform.localScale;
	var endScale = new Vector3(0,startScale.y, startScale.z);
	var dw = bgRight.renderer.bounds.size.x;
	
	var f = shrinkEdgeFactor;
	
	// move right edge to the right and shrink
	AnimationManager.ScaleOverTime(bgRight.transform,endScale, duration);
	AnimationManager.TranslationBy(bgRight.transform,new Vector3(dw*f,0,0), duration);
	

	var oldW = bgMiddle.renderer.bounds.size.x;
	var newW = oldW+dw;
	startScale = bgMiddle.transform.localScale;
	endScale = new Vector3(startScale.x*newW/oldW, startScale.y, startScale.z);
	
	// scale middle to fill in gap, move right to compensate
	AnimationManager.ScaleOverTime(bgMiddle.transform, endScale, duration);
	AnimationManager.TranslationBy(bgMiddle.transform, new Vector3(dw*0.5f*f,0,0), duration);
	
	yield WaitForSeconds(duration);
	shrinkingEdges = false;
}

function setWord(w : String) {
	//var mesh = GetComponent(MeshFilter).mesh;
	
	var language = verseManager.GetLanguage();

	if (language == "zh") {
		label.font = zhFont;
		label.renderer.material = zhFont.material;
		label.fontSize = 85;
		label.fontStyle = FontStyle.Normal;
		label.color = Color.black;
	} else {
		label.font = enFont;
		label.renderer.material = enFont.material;
		label.fontSize = 80;
		label.fontStyle = FontStyle.Normal;
		label.color = Color.black;
	}
	
	label.text = w;
	word = w;
	
	ResetBubble();
}

function ResetBubble() {
	var size = label.renderer.bounds.size;
	var textWidth = size.x;
	var textHeight = size.y;
	var padding = new Vector2(0.5,0.5);
	var l = textWidth + padding.x;
	var h = textHeight + padding.y;
	SetBlockLength(l, h);
}

function Start () {
    var screenBounds = GameManager.screenBounds;
	startPosition = new Vector3(screenBounds.x+screenBounds.width*.075,screenBounds.y-screenBounds.height*0.25);
	versePosition = startPosition;
	scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
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
		transform.rotation = Quaternion.Lerp(oldRotation,new Quaternion.Euler(0,0,0),
		elapsedTime*2);
		
	}
	
	var rotation = transform.eulerAngles.z;
	
	if (Mathf.Abs(rotation - 180.0f) < 60.0f) {
		label.transform.eulerAngles.z = rotation - 180.0f;
	} else {
		label.transform.eulerAngles.z = rotation;
	}
	
}

function GetPreviousWordLabel() {
	return gameManager.GetWordLabelAt(wordIndex-1);	
}

function GetNextWordLabel() {
	return gameManager.GetWordLabelAt(wordIndex+1);	
}

function handleReturnedToVerse() {
	transform.localPosition = destination;
	returnedToVerse = true;
	gotoVerse = false;
	
	var d = 0.25f;
	if (!isFirstInLine) {
		ShrinkLeftEdge(d);
		var pw = GetPreviousWordLabel();
		if (pw) {
			pw.ShrinkRightEdge(d);
		}
	}
}


function calculateVersePosition () {
	oldRotation = transform.rotation;
	transform.rotation = new Quaternion.Euler(0,0,0);
	var spacing = 0.0f;
	var wordWidth = nonEdgeSize.x;
	
	versePosition.x += wordWidth + spacing;
	
	// z = 1 so placed words are drawn behind other wordlabels
	destination = new Vector3(versePosition.x - wordWidth*0.5 - spacing*0.5f, versePosition.y, 1);
	var screenBounds = GameManager.screenBounds;
	var maxX = screenBounds.x + screenBounds.width*0.95;
	var padding = 0.25f;
	var vSpacing = nonEdgeSize.y + padding;
	
	transform.rotation = oldRotation;
	
	if (wordIndex == 0) isFirstInLine = true;
	
	if ((destination.x + wordWidth*0.5) > maxX) {
		versePosition = new Vector3(startPosition.x,
									versePosition.y-vSpacing,
									0);
		isFirstInLine = true;
		calculateVersePosition();
		var pw = GetPreviousWordLabel();
		if (pw) {
			pw.isLastInLine = true;
		}
	}
}

function returnToVerse () {
	// sync word index incase there is another word label which is duplicate of this one
	wordIndex = gameManager.wordIndex;
	
	collider2D.enabled = false;
	rigidbody2D.fixedAngle = true;
	rigidbody2D.gravityScale = 0;
	rigidbody2D.isKinematic = true;
	rigidbody2D.velocity = new Vector3(0,0,0);
	oldRotation = transform.rotation;

	//transform.rotation = new Quaternion.Euler(0,0,0);
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
	var str = "";
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
		scoreCredited = dScore;
	} else {
		dScore = scoreManager.HandleWordWrong();
		gameManager.HandleWordWrong();
		SetColor(Color(0.8,0.3,0.3,1.0));
		yield WaitForSeconds(0.1);
		right = false;
		SetColor(Color.white);
		
	}
	
	if ((dScore != 0) || (str != "")) {
		var clone : FloatingPoints;
		clone = Instantiate(floatingPoints, transform.position, Quaternion.identity);
	}
	
	if (dScore != 0) {
		clone.SetPoints(dScore, right);
	}
	
	if (str != "") {
		clone.SetString(str, right);
	}
}
