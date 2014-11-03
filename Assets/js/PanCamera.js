var mouseSensitivity : float = 1.0f;
var lastPosition : Vector3 ;
var gameManager : GameManager;
var minY : float = 0.0f;
var targetY : float = 0.0f;
var curY : float = 0.0f;
var maxY : float = 0.0f;
var velocityY : float = 0.0f;
var dragY : float = 10.0f;
var mouseDown : boolean = false;
var scrolling : boolean = false;

// Use this for initialization
function Start () {
}

function Reset() {
	targetY = 0.0f;
	curY = 0.0f;
	transform.position.y = 0;
	scrolling = false;
	mouseDown = false;
}

function ScrollY(dy : float) {
	targetY += dy;
	maxY = targetY;
	scrolling = true;
}

function SyncCurY() {
	if (curY < minY) {
		curY = minY;	
	} else if (curY > maxY) {
		curY = maxY;
	}
		
	transform.position.y = curY;
}

// Update is called once per frame
function Update () {
	var dy : float = (targetY-curY);
	if (!mouseDown) {
		if ((Mathf.Abs(dy) > 0) && scrolling) {
			if (Mathf.Abs(dy) < .01f) {
				curY = targetY;
			} else {
				dy = dy*Time.deltaTime;
				if (Mathf.Abs(dy) < .01f)  {
					if (dy > 0) {
						dy = .01f;
					} else {
						dy = -.01f;
					}
				}
				curY += dy;
			}
		} else {
			scrolling = false;
		}
		
		if (Mathf.Abs(velocityY) > .01f) {
			curY += velocityY*Time.deltaTime;	
			if (velocityY > 0) {
				velocityY -= dragY*Time.deltaTime;
			} else {	
				velocityY += dragY*Time.deltaTime;
			}
			if (Mathf.Abs(velocityY) < 0.5f) {
				velocityY = 0.0f;
			}
		}
	}
	
	SyncCurY();
	
	if (!gameManager.finished && !gameManager.showingSolution) return;
	
	if (Input.GetMouseButtonDown(0))
	{
		mouseDown = true;
		velocityY = 0.0f;
		lastPosition = Input.mousePosition;
	}
	if (Input.GetMouseButtonUp(0)) {
		mouseDown = false;
	}
		
	if (Input.GetMouseButton(0))
	{
		var delta : Vector3 = Input.mousePosition - lastPosition;
		velocityY = delta.y * mouseSensitivity;
		curY = transform.position.y + velocityY*Time.deltaTime;
		SyncCurY();
		targetY = curY;
		lastPosition = Input.mousePosition;
	}
}
