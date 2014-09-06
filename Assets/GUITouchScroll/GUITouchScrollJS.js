@script ExecuteInEditMode()

import TextManager;

//Original Script in C from http://www.mindthecube.com/blog/2010/09/adding-iphone-touches-to-unitygui-scrollview/comment-page-1#comment-2935

public var customSkin : GUISkin; // this sets an optionSkin to load from skins

public var rowEasyStyle : GUIStyle; 
public var rowMediumStyle : GUIStyle;
public var rowHardStyle : GUIStyle; 

public var windowStyle : GUIStyle;
public var headerStyle : GUIStyle;

// Internal variables for managing touches and drags
private var selected : int = -1;
private var scrollVelocity : float = 0f;
private var timeTouchPhaseEnded = 0f;
private var previousDelta : float = 0f;

public var xOffset : float;
public var yOffset : float;
public var scrollPosition : Vector2 ;
public var mainCam : Camera;
public var inertiaDuration : float = 5.0f;
// size of the window and scrollable list
public var numRows : int;
public var rowSize : Vector2;
public var padding : float;
public var rowHeight : float;
public var catWidth : float;
public var leftMargin : float;
public var topMargin : float;
public var bottomMargin : float;
public var rightMargin : float;
public var scrollBarWidth : float;
public var currentVerseSet : VerseSet;

public var verseManager : VerseManager;
public var sceneSetup : SceneSetup;
private var maxScrollVelocity : int = 2000;
private var windowRect :Rect;   // calculated bounds of the window that holds the scrolling list
private var listSize : Vector2; // calculated dimensions of the scrolling list placed inside the window


function updateScrollVelocity(touch : Touch) {
	var dt = touch.deltaTime;
	if (dt == 0) dt = 0.01;

	// impart momentum, using last delta as the starting velocity
	// ignore delta = 10)
	scrollVelocity = 0.25f*touch.deltaPosition.y / dt + scrollVelocity*0.75f;
	if (scrollVelocity > maxScrollVelocity) scrollVelocity = maxScrollVelocity;
	if (scrollVelocity < -1*maxScrollVelocity) scrollVelocity = -1*maxScrollVelocity;
	Debug.Log("scrollVelocity = " + scrollVelocity + " delta time = " + touch.deltaTime);
}
	
function Update() //check for touch
{
	if (Input.touchCount != 1) //if this is a short touch
	{
		selected = -1;
		
		if ( scrollVelocity != 0.0f )
		{
			// slow down over time
			var t : float;
			t = Time.time;
			t = t - timeTouchPhaseEnded;
			t = t / inertiaDuration;
			var frameVelocity : float = Mathf.Lerp(scrollVelocity, 0, t);
			scrollPosition.y += frameVelocity * Time.deltaTime;
			
			// after N seconds, we’ve stopped
			if (t >= inertiaDuration) scrollVelocity = 0.0f;
		}
		return;
	}

	var touch : Touch = Input.touches[0];
	var	fInsideList = IsTouchInsideList(touch.position);

	
	if (touch.phase == TouchPhase.Began && fInsideList)
	{
		previousDelta = 0.0f;
		scrollVelocity = 0.0f;
	}
	else if (touch.phase == TouchPhase.Canceled || !fInsideList)
	{
		previousDelta = 0f;
	}
	else if (touch.phase == TouchPhase.Moved && fInsideList)
	{
		// dragging
		previousDelta = touch.deltaPosition.y;
		scrollPosition.y += touch.deltaPosition.y;
		updateScrollVelocity(touch);
	}
	else if (touch.phase == TouchPhase.Ended && fInsideList)
	{
		updateScrollVelocity(touch);
		timeTouchPhaseEnded = Time.time;
	}
}

function HandleRowSelected(selected : int) {
	PlayerPrefs.SetInt("scrollPositionY",scrollPosition.y);
	Debug.Log("selecting verse " + selected);
	verseManager.verseIndex = selected;
	verseManager.Save();
	GameManager.SetChallengeModeEnabled(false);
	Application.LoadLevel("scramble");
}

function StartChallenge() {
	verseManager.verseIndex = 0;
	verseManager.Save();
	GameManager.SetChallengeModeEnabled(true);
	Application.LoadLevel("scramble");
}


function Start () 
{
	TextManager.LoadLanguage(verseManager.GetLanguage());
	maxScrollVelocity = Screen.height*4;
	verseManager.LoadVerses();
	var previousY = scrollPosition.y;
	scrollPosition.y = PlayerPrefs.GetInt("scrollPositionY",previousY);
}

public static function AutoResize(screenWidth:int, screenHeight:int):void
{
    var resizeRatio:Vector2 = Vector2(Screen.width / parseFloat(screenWidth), Screen.height / parseFloat(screenHeight));
    GUI.matrix = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, Vector3(resizeRatio.x, resizeRatio.y, 1.0));
}

function OnGUI () //this deals with the display
{
	var h = Screen.height;
	var w = Screen.width;
	padding = 0.009*h;
	rowHeight = 0.065*h;
	catWidth = 0.2*w;
	scrollBarWidth = 25;
	bottomMargin = 0.1*h;
	
	var customFont = sceneSetup.GetCurrentFont();
	//GUI.skin = customSkin;
	rowEasyStyle.font = customFont;
	rowMediumStyle.font = customFont;
	rowHardStyle.font = customFont;
	windowStyle.font = customFont;
	headerStyle.font = customFont;
	customSkin.button.font = customFont;
	
	windowStyle.fontSize = customSkin.button.fontSize;
	headerStyle.fontSize = customSkin.button.fontSize;
	rowEasyStyle.fontSize = customSkin.button.fontSize;
	rowMediumStyle.fontSize = customSkin.button.fontSize;
	rowHardStyle.fontSize = customSkin.button.fontSize;
	
	windowRect = Rect(2*padding+catWidth,
					  2*padding+rowHeight,
					  Screen.width - (3*padding+catWidth), 
					  Screen.height - (3*padding+rowHeight)); //this draws the bg
	listSize = new Vector2(windowRect.width, windowRect.height-bottomMargin);
	rowSize = new Vector2(windowRect.width-scrollBarWidth, rowHeight-bottomMargin);

	var headerRect = Rect(2*padding+catWidth, 
						  padding,
						  rowSize.x,
						  rowHeight);
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var diffString = verseManager.DifficultyToString(difficulty);
	var totalScore = verseManager.GetCachedTotalScore();
	var gt = TextManager.GetText;
	var verseset : VerseSet = verseManager.GetCurrentVerseSet();
	var verses : Array = verseset.verses;
	var headerText = String.Format("{0}:{1} {2}:{3}/{4} ",
	gt("Total Score"),
	totalScore,
	gt("Mastered"),
	verseManager.GetMasteredVerses(), verses.length);
	GUI.Label(headerRect, headerText, headerStyle);
	
	GUI.Window (0, windowRect, GUI.WindowFunction (DoWindow), "", windowStyle); //this draws the frame
	
	// draw categories
	
	var catHeaderRect = Rect(padding,padding,catWidth,rowHeight);
	GUI.Label(catHeaderRect, TextManager.GetText("Categories"), headerStyle);
	
	var versesets = verseManager.versesets;
	currentVerseSet = verseManager.GetCurrentVerseSet();
	
	for (var i=0;i<versesets.length;i++) {
		verseset = versesets[i];
		var catButtonRect : Rect = Rect(padding,padding+(catHeaderRect.height+padding)*(i+1),
		catHeaderRect.width, catHeaderRect.height);
		var selected : boolean = false;
		if (currentVerseSet == verseset) {
			if (GUI.Button(catButtonRect, verseset.setname, rowEasyStyle)) {
				selected = true;
			}
		} else {
			if (GUI.Button(catButtonRect, verseset.setname, customSkin.button)) {
				selected = true;
			}
		}
		
		if (selected) {
			verseManager.verseIndex = 0;
			verseManager.SetCurrentVerseSet(verseset);
		}
	}
	
}

function GetStyleForDifficulty(difficultyInt : int) {
	switch(difficultyInt) {
		case 1:
			return rowEasyStyle;
		case 2:
			return rowMediumStyle;
		case 3:
			return rowHardStyle;
		default:
			return customSkin.button;	
	}
}

function DoWindow (windowID : int) //here you build the table
{
	var verses = verseManager.GetCurrentVerses();
	var numRows = verses.length;
	var rScrollFrame :Rect = Rect(0, 0, listSize.x, listSize.y);
	var rList :Rect = Rect(0, 0, rowSize.x, (1+numRows)*(rowHeight+padding));
	
	scrollPosition = GUI.BeginScrollView (rScrollFrame, scrollPosition, rList, false, false);
	
	var rBtn :Rect = Rect(0, 0, rowSize.x, rowHeight);
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var diffString = verseManager.DifficultyToString(difficulty);
	
	var versesetMetadata = currentVerseSet.GetMetadata();
	var versesetDifficulty = versesetMetadata["difficulty"];
	
	var rowStyle : GUIStyle;
	var rowLabel : String;
	
	for (var iRow : int = 0; 
		iRow < numRows;
		iRow++ )
	{
       	// draw call optimization: don't actually draw the row if it is not visible
        if ( rBtn.yMax >= scrollPosition.y && 
             rBtn.yMin <= (scrollPosition.y + rScrollFrame.height) )
       	{
			var fClicked : boolean = false;
			var verse : Verse = verses[iRow];
			var metadata = verse.GetMetadata();
			var verseDifficulty : int = metadata["difficulty"];
			var mastered : boolean = false;
			
			if (verseDifficulty > parseInt(difficulty)) {
				mastered = true;
				// verse was mastered
			} 
			
			rowLabel = String.Format("{0} \t\t {1}: {2}",verse.reference,
			TextManager.GetText("high score"),
			metadata["high_score"]); //this is what will be written in the rows
			rowStyle = GetStyleForDifficulty(verseDifficulty);
			fClicked = GUI.Button(rBtn, rowLabel, rowStyle);
			
			// Allow mouse selection, if not running on iPhone.
			if ( fClicked ) //&& Application.platform != RuntimePlatform.IPhonePlayer )
			{
				HandleRowSelected(iRow);
				Debug.Log("Player mouse-clicked on row " + iRow);
			}
		}
	
		rBtn.y += rowHeight + padding;
	}
	
	rowLabel = String.Format("{0} \t\t {1}: {2}",
			TextManager.GetText("Play Challenge (All Verses)"),
			TextManager.GetText("high score"),
			versesetMetadata["high_score"]); //this is what will be written in the rows
	
	rowStyle = GetStyleForDifficulty(versesetDifficulty);
	
	if (GUI.Button(rBtn, rowLabel, rowStyle)) {
		StartChallenge();
		return;
	}
	rBtn.y += rowHeight + padding;

	GUI.EndScrollView();
}

function IsTouchInsideList(touchPos : Vector2) : boolean
{
	var screenPos : Vector2 = new Vector2(touchPos.x, Screen.height - touchPos.y);  // invert y coordinate
	var rAdjustedBounds : Rect = new Rect(windowRect.x, windowRect.y, listSize.x, listSize.y);
	
	return rAdjustedBounds.Contains(screenPos);
}
