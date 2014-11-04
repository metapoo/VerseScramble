#pragma strict

var label : TextMesh;
var shadow : TextMesh;
var bgMiddle : SpriteRenderer;
var bgLeft : SpriteRenderer;
var bgRight : SpriteRenderer;
var word : String;
var bumpSnd : AudioClip;
var bumpSnd2 : AudioClip;
var destination : Vector3;
var gotoVerse : boolean = false;
var returnedToVerse : boolean = false;
var startTime : float;
var gameManager : GameManager;
var scoreManager : ScoreManager;
var verseManager : VerseManager;
var hinting : boolean = false;
var floatingPoints : FloatingPoints;
var oldRotation : Quaternion;
var scoreCredited : float;
var exploding : boolean = false;
var totalSize : Vector3;
var nonEdgeSize : Vector3;
var edgeSize : Vector3;
var wordIndex : int;
var isFirstInLine : boolean;
var isLastInLine : boolean;
var rightToLeft : boolean;
var sndPop : AudioClip;
var sceneSetup : SceneSetup;
var spacing : float = 0.15f;
var alpha : float = 1.0f;

static var versePosition : Vector3;
static var startPosition : Vector3;

private var shrinkingEdges : boolean = false;

function GetPercentFell() : float {
	var maxY : float = gameManager.topWall.center.y;
	var minY : float = gameManager.bottomWall.center.y;
	var y : float = transform.position.y;
	var range : float = (maxY - minY)*.8f;
	var pct : float = (maxY - y) / range;
	if (pct < 0) pct = 0;
	if (pct > 1) pct = 1;
	return pct;
}

function Explode() {
	if (exploding || !returnedToVerse) return;
	
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
	gotoVerse = false;
	returnedToVerse = false;
	
	yield WaitForSeconds(Random.RandomRange(0.0f,0.5f));
	
	while (shrinkingEdges) {
		yield WaitForSeconds(0.1f);
	}

	ResetBubble();
	collider2D.enabled = true;
	rigidbody2D.fixedAngle = false;
	rigidbody2D.isKinematic = false;
	
	rigidbody2D.AddForce (new Vector3(Random.Range(-100,100), Random.Range(300,400), 0));
	rigidbody2D.gravityScale = 1.0;
	rigidbody2D.AddTorque(Random.Range(-100,100));
	audio.PlayOneShot(sndPop, Random.RandomRange(0.5f,1.0f));
	yield WaitForSeconds(2.5f);
	exploding = false;
	rigidbody2D.gravityScale = 0.1;
}

function FixedUpdate() {
}

function SetColor(color : Color) {
	color.a = alpha;
	bgMiddle.renderer.material.color = color;
	if (bgLeft) {
		bgLeft.renderer.material.color = color;
	}
	if (bgRight) {
		bgRight.renderer.material.color = color;
	}
}

function GetColor() {
	return bgMiddle.renderer.material.color;
}

function boxCollider2D() {
	var boxCollider2D : BoxCollider2D = GetComponent(BoxCollider2D);
	return boxCollider2D;
}

function SetBlockLength(l : float, h : float) {
	var elements : Array = [bgLeft, bgRight, bgMiddle];

	for (var el : SpriteRenderer in elements) {
		if (el) {
			el.transform.localScale = Vector3.one;
		}
	}	
	
	var msize : Vector3 = bgMiddle.renderer.bounds.size;
	var dx : float = 0;
	var dw : float = 0;
	if (bgLeft == null) {
		dw += spacing*0.5f;
		dx -= dw*0.5f;
	}
	
	if (bgRight == null) {
		dw += spacing*0.5f;
		dx += dw*0.5f;
	}
	
	var yScale = (h) / msize.y;
	var xScale = (l+dw) / msize.x;
	
	bgMiddle.transform.localScale = Vector3(xScale, yScale, 1.0f);
	bgMiddle.transform.localPosition = Vector3(dx,0,0);
	
	if (bgLeft) {
		bgLeft.transform.localScale = Vector3(yScale, yScale, 1.0f);
		bgLeft.transform.localPosition = Vector3(-l*0.5f,0,0.0f);
	}
	
	if (bgRight) {
		bgRight.transform.localScale = Vector3(yScale, yScale, 1.0f);
		bgRight.transform.localPosition = Vector3(l*0.5f,0,0.0f);
	}
	
	var sm : Vector3 = bgMiddle.renderer.bounds.size;
	
	var sr : Vector3 = Vector3.zero;
	var sl : Vector3 = Vector3.zero;
	
	if (bgLeft) {
		sr = bgLeft.renderer.bounds.size;
		edgeSize = sr;
	}
	
	if (bgRight) {
		sl = bgRight.renderer.bounds.size;
	}
	
	totalSize = new Vector3(edgeSize.x*2.0f+sm.x, sm.y, sm.z);
	nonEdgeSize = new Vector3(sm.x,sm.y,sm.z);
	boxCollider2D().size = Vector2(totalSize.x,totalSize.y);
	
}

function ShrinkLeftEdge(duration : float) {
	while (shrinkingEdges) {
		yield WaitForSeconds(0.1f);
	}
	shrinkingEdges = true;
	var startScale = bgLeft.transform.localScale;
	var endScale = new Vector3(0,startScale.y, startScale.z);
	var dw = 0.5*spacing;
	
	
	// move left edge to the right and shrink
	AnimationManager.ScaleOverTime(bgLeft.transform,endScale, duration);
	//AnimationManager.TranslationBy(bgLeft.transform,new Vector3(-1*dw,0,0), duration);
	
	var oldW = bgMiddle.renderer.bounds.size.x;
	var newW = oldW+dw;
	startScale = bgMiddle.transform.localScale;
	endScale = new Vector3(startScale.x*newW/oldW, startScale.y, startScale.z);
	
	// scale middle to fill in gap, move right to compensate
	AnimationManager.ScaleOverTime(bgMiddle.transform, endScale, duration);
	AnimationManager.TranslationBy(bgMiddle.transform, new Vector3(-0.5f*dw,0,0), duration);
		
	yield WaitForSeconds(duration);
	shrinkingEdges = false;
	Destroy(bgLeft.gameObject);
	bgLeft = null;
	//ResetBubble();
}

function ShrinkRightEdge(duration : float) {
	while (shrinkingEdges) {
		yield WaitForSeconds(0.1f);
	}
	shrinkingEdges = true;
	var startScale = bgRight.transform.localScale;
	var endScale = new Vector3(0,startScale.y, startScale.z);
	var dw = spacing*0.5f;
	
	// move right edge to the right and shrink
	AnimationManager.ScaleOverTime(bgRight.transform,endScale, duration);
	//AnimationManager.TranslationBy(bgRight.transform,new Vector3(dw,0,0), duration);
	

	var oldW = bgMiddle.renderer.bounds.size.x;
	var newW = oldW+dw;
	startScale = bgMiddle.transform.localScale;
	endScale = new Vector3(startScale.x*newW/oldW, startScale.y, startScale.z);
	
	// scale middle to fill in gap, move right to compensate
	AnimationManager.ScaleOverTime(bgMiddle.transform, endScale, duration);
	AnimationManager.TranslationBy(bgMiddle.transform, new Vector3(0.5f*dw,0,0), duration);
	
	yield WaitForSeconds(duration);
	shrinkingEdges = false;
	
	Destroy(bgRight.gameObject);
	bgRight = null;
	//ResetBubble();
}

function reverseString(s : String) {
	var str : String = "";
	for (var i=s.Length-1;i>=0;i--) {
		str += s[i];
	}
	return str;
}

function setWord(w : String) {
	//var mesh = GetComponent(MeshFilter).mesh;
	var wOriginal : String;
	wOriginal = w;
	var language : String = VerseManager.GetVerseLanguage();
	
	if (Application.platform == RuntimePlatform.Android) {
	    if(language=="mn")
	    {
	         w = w.Replace("ө", "ø"); 
	         w = w.Replace("Ө", "Ø");
	         w = w.Replace("ү", "v"); 
	         w = w.Replace("Ү", "Y");
	      }
	}

	if (rightToLeft) {
		label.text = reverseString(w);
	} else {
		label.text = w;
	}
	shadow.text = label.text;
	
	word = wOriginal;
	
	SyncFontSize();
	
	ResetBubble();
}

function SyncFontSize() {
	var fontSize : int = 80.0f*gameManager.wordScale;
	SetFontSize(fontSize);
}

function SetFontSize(size : int) {
	label.fontSize = size;
	shadow.fontSize = size;
	ResetBubble();
}

function ResetBubble() {
	var oldRotation = transform.rotation;
	transform.rotation = Quaternion.identity;
	var lsize = label.renderer.bounds.size;
	var textWidth : float = lsize.x;
	var textHeight : float  = lsize.y;
	var padding : Vector2 = new Vector2(0,textHeight*0.5f);
	var l : float = textWidth;
	var h : float = textHeight+2*padding.y;
	
	SetBlockLength(l, h);
	transform.rotation = oldRotation;
}

function Awake () {
	sceneSetup = GameObject.Find("SceneSetup").GetComponent("SceneSetup");
    scoreManager = GameObject.Find("ScoreManager").GetComponent("ScoreManager");
	gameManager = GameObject.Find("GameManager").GetComponent("GameManager");
	verseManager = GameObject.Find("VerseManager").GetComponent("VerseManager");
}

static function ResetVersePosition() {
    var screenBounds = GameManager.screenBounds;
    var startx = screenBounds.x+screenBounds.width*.075;
    if (VerseManager.rightToLeft) {
    	startx = screenBounds.x+screenBounds.width*(0.925);
    }
    
	startPosition = new Vector3(startx,screenBounds.y-screenBounds.height*0.25);
	versePosition = startPosition;
}

function Start () {
	ResetVersePosition();	
}

function Update () {
	if (gotoVerse) {
		var distance = Vector3.Distance(transform.localPosition, destination);
		var speed: float = 0.5;
		var elapsedTime = (Time.time-startTime);
		transform.localPosition = new Vector3.Lerp(transform.localPosition, destination, speed*elapsedTime);
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
	shadow.transform.eulerAngles = label.transform.eulerAngles;
}

function OnCollisionEnter2D(collision : Collision2D) {
   if (collision) {
   		var v : float = collision.relativeVelocity.magnitude;
   		var snd : AudioClip;
   		if (Random.RandomRange(0.0f,1.0f) > 0.5f) {
   			snd = bumpSnd;
   		} else {
   			snd = bumpSnd2;
   		}
   		var vol : float = v/10.0f;
   		if (vol > 1) vol = 1.0f;
 	   	audio.PlayOneShot(snd, vol);   		
  }
}

function GetPreviousWordLabel() {
	var wordLabel = gameManager.GetWordLabelAt(wordIndex-1);	
	// make sure the word label is returned to verse
	if (!wordLabel.returnedToVerse && !wordLabel.gotoVerse) {
		for (var i=0;i<gameManager.wordLabels.length;i++) {
			var w:WordLabel = gameManager.wordLabels[i];
			if ((w.returnedToVerse || w.gotoVerse) && (w.word == wordLabel.word)) {
				return w;
			}
		}
	}
	return wordLabel;
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
		if (rightToLeft) {
			ShrinkRightEdge(d);
		} else {
			ShrinkLeftEdge(d);
		}
		var pw = GetPreviousWordLabel();
		if (pw) {
			if (rightToLeft) {
				pw.ShrinkLeftEdge(d);
			} else {
				pw.ShrinkRightEdge(d);
			}
		}
	} else {
		if (gameManager.line > 2) {
		
			var panWordLabels : PanCamera = transform.parent.GetComponent(PanCamera);
			if (gameManager.showingSolution) {
				panWordLabels.maxY += totalSize.y;
			} else {
				panWordLabels.ScrollY(totalSize.y);
			}
			
		}
		gameManager.line += 1;
	}
}


function CalculateVersePosition () {
	oldRotation = transform.rotation;
	transform.rotation = new Quaternion.Euler(0,0,0);
	
	var wordWidth = nonEdgeSize.x;
	
	var dx = wordWidth + spacing;

	if (rightToLeft) {
		dx *= -1;
	} 
	
	versePosition.x += dx;
	
	// z = 1 so placed words are drawn behind other wordlabels
	destination = new Vector3(versePosition.x - dx*0.5f, versePosition.y, 1);
	var screenBounds = GameManager.screenBounds;
	var b : float = 0.95;
	var maxX = screenBounds.x + screenBounds.width*b;
	var minX = screenBounds.x + screenBounds.width*(1-b);
	
	var vSpacing = nonEdgeSize.y;
	
	transform.rotation = oldRotation;
	
	if (wordIndex == 0) isFirstInLine = true;
	
	if ((!rightToLeft && (destination.x + wordWidth*0.5) > maxX) ||
	    (rightToLeft && (destination.x - wordWidth*0.5) < minX))
	 {
		versePosition = new Vector3(startPosition.x,
									versePosition.y-vSpacing,
									0);
		isFirstInLine = true;
		CalculateVersePosition();
		var pw = GetPreviousWordLabel();
		if (pw) {
			pw.isLastInLine = true;
		}
	}
}

function IsAvailable() {
	return collider2D.enabled;
}

function returnToVerse () {
	// sync word index incase there is another word label which is duplicate of this one
	if (wordIndex != gameManager.wordIndex) {
		gameManager.SwapWords(wordIndex, gameManager.wordIndex);
	}
	hinting = false;
	collider2D.enabled = false;
	rigidbody2D.fixedAngle = true;
	rigidbody2D.gravityScale = 0;
	rigidbody2D.isKinematic = true;
	rigidbody2D.velocity = new Vector3(0,0,0);
	oldRotation = transform.rotation;
	
	alpha = 0.5f;
	SetColor(Color.white);
	
	//transform.rotation = new Quaternion.Euler(0,0,0);
	CalculateVersePosition();
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
	/*
    var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
    var hit : RaycastHit2D = Physics2D.GetRayIntersection(ray,Mathf.Infinity);
    var wasReallyHit : boolean = false;  
    if ((hit.collider != null) && (hit.collider.transform == transform))
    {
    	wasReallyHit = true;
    }
    // fix bug where onmousedown is triggered when it shouldn't be
	if (!wasReallyHit) return;
	 */
	 
	var dScore = 0;
	var str = "";
	var right = false;
	
	if (returnedToVerse) {
		verseManager.SpeakUtterance(word);
		Blink();
		return;
	}
	
	if (word == GameManager.currentWord) {
		SetColor(Color.white);
		dScore = gameManager.HandleWordCorrect(this);
		right = true;
		verseManager.SpeakUtterance(word);
		scoreCredited = dScore;
		returnToVerse();
	} else {
		str = scoreManager.HandleWordWrong();
		gameManager.HandleWordWrong();
		SetColor(Color(0.8,0.3,0.3,1.0));
		yield WaitForSeconds(0.1);
		right = false;
		SetColor(Color.white);
		
	}
	
	hinting = false;
	
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
	
	if (!gameManager.gameStarted) {
		gameManager.StartGame();
	}

}
