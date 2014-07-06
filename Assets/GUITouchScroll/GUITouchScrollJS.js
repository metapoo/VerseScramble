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
public var windowMargin : Vector2;

public var listMargin : Vector2;
public var verseManager : VerseManager;
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
		selected = TouchToRowIndex(touch.position);
		previousDelta = 0.0f;
		scrollVelocity = 0.0f;
	}
	else if (touch.phase == TouchPhase.Canceled || !fInsideList)
	{
		selected = -1;
		previousDelta = 0f;
	}
	else if (touch.phase == TouchPhase.Moved && fInsideList)
	{
		// dragging
		selected = -1;
		previousDelta = touch.deltaPosition.y;
		scrollPosition.y += touch.deltaPosition.y;
		updateScrollVelocity(touch);
	}
	else if (touch.phase == TouchPhase.Ended && fInsideList)
	{
		updateScrollVelocity(touch);
/*
		// Was it a tap, or a drag-release?
		if ( selected > -1 )
		{
			Debug.Log("Player iphone selected row " + selected);
			HandleRowSelected(selected);
		}
		else
		{
*/
		timeTouchPhaseEnded = Time.time;
	}
//	}
}

function HandleRowSelected(selected : int) {
	PlayerPrefs.SetInt("scrollPositionY",scrollPosition.y);
	Debug.Log("selecting verse " + selected);
	verseManager.verseIndex = selected;
	verseManager.Save();
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
	//GUI.skin = customSkin;
	
	var rowHeight = 50;
	windowRect = Rect(windowMargin.x + xOffset, windowMargin.y	+yOffset,
					  Screen.width - (2*windowMargin.x) + xOffset, Screen.height - windowMargin.y*2); //this draws the bg
	listSize = new Vector2(windowRect.width - 2*listMargin.x, windowRect.height - 2*listMargin.y-10);
	rowSize = new Vector2(windowRect.width - 2*listMargin.x - 30, rowHeight);

	var headerRect = Rect(windowMargin.x + xOffset + listMargin.x, yOffset,
						  rowSize.x,rowHeight);
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var diffString = verseManager.DifficultyToString(difficulty);
	var totalScore = verseManager.GetCachedTotalScore();
	var gt = TextManager.GetText;
	var headerText = String.Format("{0}: {1} \t {2}: {3} \t {4}: {5}/{6} ",
	gt("Score"),
	totalScore,
	gt("Difficulty"),
	diffString, 
	gt("Mastered"),
	verseManager.GetMasteredVerses(), verseManager.verses.length);
	GUI.Label(headerRect, headerText, headerStyle);
	
	GUI.Window (0, windowRect, GUI.WindowFunction (DoWindow), "", windowStyle); //this draws the frame
	
	// draw categories
	
	var padding = 20;
	var extraTopPadding = 5;
	var catHeaderRect = Rect(padding,yOffset,headerRect.x-1.5*padding,rowHeight);
	GUI.Label(catHeaderRect, TextManager.GetText("Categories"), headerStyle);
	
	var categories = verseManager.categories;
	var currentCategory = verseManager.GetCurrentCategory();
	
	for (var i=0;i<categories.length;i++) {
		var category : String = categories[i];
		var catButtonRect : Rect = Rect(padding,extraTopPadding+yOffset+(catHeaderRect.height+5)*(i+1),
		catHeaderRect.width, catHeaderRect.height);
		var selected : boolean = false;
		if (category == currentCategory) {
			if (GUI.Button(catButtonRect, category, rowEasyStyle)) {
				selected = true;
			}
		} else {
			if (GUI.Button(catButtonRect, category, customSkin.button)) {
				selected = true;
			}
		}
		
		if (selected) {
			verseManager.verseIndex = 0;
			verseManager.SetCurrentCategory(category);
		}
	}
	
}

function DoWindow (windowID : int) //here you build the table
{
	var refs = verseManager.GetCurrentReferences();
	var numRows = refs.length;
	var rScrollFrame :Rect = Rect(listMargin.x, listMargin.y, listSize.x, listSize.y);
	var rList :Rect = Rect(0, 0, rowSize.x, numRows*rowSize.y);
	
	scrollPosition = GUI.BeginScrollView (rScrollFrame, scrollPosition, rList, false, false);
	
	var rBtn :Rect = Rect(0, 0, rowSize.x, rowSize.y);
	var difficulty : Difficulty = verseManager.GetCurrentDifficulty();
	var diffString = verseManager.DifficultyToString(difficulty);
	
	for (var iRow : int = 0; 
		iRow < numRows;
		iRow++ )
	{
       	// draw call optimization: don't actually draw the row if it is not visible
        if ( rBtn.yMax >= scrollPosition.y && 
             rBtn.yMin <= (scrollPosition.y + rScrollFrame.height) )
       	{
			var fClicked : boolean = false;
			var reference = refs[iRow];
			var metadata = verseManager.GetVerseMetadata(reference);
			var verseDifficulty : int = metadata["difficulty"];
			var mastered : boolean = false;
			
			if (verseDifficulty > parseInt(difficulty)) {
				mastered = true;
				// verse was mastered
			} 
			
			var rowLabel : String = String.Format("{0} \t\t {1}: {2}",reference,
			TextManager.GetText("high score"),
			metadata["high_score"]); //this is what will be written in the rows
	
			if (verseDifficulty == 1) {
				fClicked = GUI.Button(rBtn, rowLabel, rowEasyStyle);
			} else if (verseDifficulty == 2) {
				fClicked = GUI.Button(rBtn, rowLabel, rowMediumStyle);
			} else if (verseDifficulty == 3) {
				fClicked = GUI.Button(rBtn, rowLabel, rowHardStyle);
			} else {
				fClicked = GUI.Button(rBtn, rowLabel, customSkin.button);
			}			
			// Allow mouse selection, if not running on iPhone.
			if ( fClicked ) //&& Application.platform != RuntimePlatform.IPhonePlayer )
			{
				HandleRowSelected(iRow);
				Debug.Log("Player mouse-clicked on row " + iRow);
			}
		}
	
		rBtn.y += rowSize.y;
	}
	GUI.EndScrollView();
}


function TouchToRowIndex(touchPos : Vector2) : int //this checks which row was touched
{
	var irow: int = -1;
	
	// clip touchPos to visible part of the list
	var listSize : Vector2 = Vector2(windowRect.width - 2*listMargin.x,
									 windowRect.height - 2*listMargin.y);
	var rScrollFrame :Rect = Rect(listMargin.x, listMargin.y, listSize.x, listSize.y);
	
	var yy :float = Screen.height - touchPos.y; // invert y coordinate
	yy += scrollPosition.y; // adjust for scroll position
	yy -= windowMargin.y;   // adjust for window y offset
	yy -= listMargin.y;     // adjust for scrolling list offset within the window
	irow = yy / rowSize.y;

	irow = Mathf.Min(irow, numRows); // they might have touched beyond last row

	return irow;
}

function IsTouchInsideList(touchPos : Vector2) : boolean
{
	var screenPos : Vector2 = new Vector2(touchPos.x, Screen.height - touchPos.y);  // invert y coordinate
	var rAdjustedBounds : Rect = new Rect(listMargin.x + windowRect.x, listMargin.y + windowRect.y, listSize.x, listSize.y);
	
	return rAdjustedBounds.Contains(screenPos);
}
