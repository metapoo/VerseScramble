#pragma strict

var mainCam : Camera;
var wordLabel : WordLabel;
var topWall : BoxCollider2D;
var bottomWall: BoxCollider2D;
var leftWall : BoxCollider2D;
var rightWall : BoxCollider2D;
var verseReference : GUIText;
var scoreLabel : TextMesh;
var feedbackLabel : TextMesh;
var shouldStartNextVerse : boolean = false;
var verseText : TextAsset;
var verses : Array = new Array();
var references : Array = new Array();
var verseIndex = 0;

static var currentWord : String;
static var words : Array = new Array();
static var wordObjects : Array = new Array();
static var wordIndex : int;
static var score = 0;
static var highScore = 0;
static var screenBounds : Rect;
static var streak : int = 0;
static var lastWordTime : float;

function SetupWalls () {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;

	topWall.size = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(w*2.0f, 0f, 0f)).x, 1f);
	topWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, h,0f)).y + 0.5f);	
	
	bottomWall.size = topWall.size;
	bottomWall.center = new Vector2(0f, mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).y - 0.5f);	
	
	leftWall.size = new Vector2(1f, mainCam.ScreenToWorldPoint(new Vector3(0f, h*2.0f, 0f)).y);
	leftWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).x - 0.5f, 0f);	
	
	rightWall.size = leftWall.size;
	rightWall.center = new Vector2(mainCam.ScreenToWorldPoint(new Vector3(w, 0f, 0f)).x+0.5f, 0f);

	screenBounds = Rect(leftWall.center.x,topWall.center.y,
	rightWall.center.x-leftWall.center.x,
	topWall.center.y-bottomWall.center.y);
}

function wordCorrect() {
	var elapsedTime : float = Time.time - lastWordTime;
	lastWordTime = Time.time;
	addScore(Mathf.Max((4-elapsedTime),1)*(1+streak*0.5));
	Debug.Log("elapsed time: " + elapsedTime);
	if (elapsedTime < 2) {
		streak += 1;
		if (streak == 5) {
			showFeedback("Nice Streak!", 1);
		} else if (streak == 10) {
			showFeedback("You're doing great!", 1);
		} else if (streak == 15) {
			showFeedback("Hallelujah!", 1);
		}
		updateScoreLabel();
	}
}

function wordWrong() {
	streak = 0;
	addScore(-10);
}

function setScore(newScore : int) {
	if (newScore < 0) newScore = 0;
	score = newScore;
	if (score > highScore) {
		highScore = score;
	}
	updateScoreLabel();
}

function updateScoreLabel() {
	scoreLabel.text = " score: " + score + " high: " + highScore + "  streak: " + streak ;
}

function addScore(dScore : int) {
	setScore(score+dScore);
}

function SetupUI() {
/*
	verseReference.gameObject.transform.position = new Vector3(
		screenBounds.x+screenBounds.width*0.1f,
		screenBounds.y-screenBounds.height*0.15f);
		*/
	scoreLabel.gameObject.transform.position = new Vector3(
		screenBounds.x+screenBounds.width*0.9f,
		screenBounds.y-screenBounds.height*0.15f);
	feedbackLabel.gameObject.transform.position = new Vector3(
		screenBounds.x+screenBounds.width*0.5f,
		screenBounds.y-screenBounds.height*0.7f
	);
	feedbackLabel.text = "";
	setScore(0);
}

function showFeedback(feedbackText : String, time : float) {
	feedbackLabel.text = feedbackText;
	yield WaitForSeconds(time);
	feedbackLabel.text = "";
}

function nextWord() {
	if (wordIndex == -1) return null;
	wordIndex += 1;
	if (wordIndex >= words.length) {
		currentWord = null;
		wordIndex = -1;
		showFeedback("Awesome!",3);
		shouldStartNextVerse = true;
		return null;
	}
	currentWord = words[wordIndex];
	return currentWord;
}

function Start () {
	
	SetupWalls();
	SetupUI();
	LoadVerses();
	StartNewVerse();
}

function LoadVerses() {
  	var lines = verseText.text.Split("\n"[0]);
  	var line : String;
  	for (line in lines) {
  		Debug.Log(line);
  		var parts = line.Split([": "], System.StringSplitOptions.None);
  		if (parts.Length != 2) continue;
  		
  		var verse = parts[1];
  		var badLetter : String;
  		for (badLetter in new Array(",",":",".","“","”",";")) {
	  		verse = verse.Replace(badLetter,"");
	  	}
	  	for (badLetter in new Array("-","—","  ","\t")) {
	  		verse = verse.Replace(badLetter," ");
	  	}
	  	
  		var reference = parts[0];
  		verses.push(verse);
  		references.push(reference);
  		Debug.Log("parts[1] = " + parts[1]);
  		Debug.Log("reference = " + reference + " verse = " + verse);
  	}
}

function SetVerseReference (reference : String) {
	verseReference.text = reference;
}

function StartNewVerse() {
	lastWordTime = Time.time;
	streak = 0;
	setScore(0);
	updateScoreLabel();
	var wordObject : WordLabel;
	for (wordObject in wordObjects) {
		Destroy(wordObject.gameObject);
	}
	wordObjects.clear();
	
	var clone : WordLabel;
	
	SetVerseReference(references[verseIndex]);
	var verse : String = verses[verseIndex];
	words = verse.Split(" "[0]);
	wordIndex = 0;
	currentWord = words[wordIndex];
	
	for (word in words) {
		
		clone = Instantiate(wordLabel, new Vector3(0,0,0), Quaternion.identity);
		clone.setWord(word);
		wordObjects.push(clone);
		var w = clone.renderer.bounds.size.x;
		var h = clone.renderer.bounds.size.y;
		var x = Random.Range(screenBounds.x+w*0.5,screenBounds.x+screenBounds.width-w*0.5);
		var y = Random.Range(screenBounds.y-screenBounds.height+h*0.5,screenBounds.y-h*0.5);
		clone.transform.position = new Vector3(x,y,0);
	}
	verseIndex += 1;
}

function delayStartNewVerse() {
		shouldStartNextVerse = false;
		yield WaitForSeconds(3);
		StartNewVerse();
}

function Update () {
	if (shouldStartNextVerse) {
		delayStartNewVerse();
	}
}