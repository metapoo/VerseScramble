var mouseSensitivity : float = 1.0f;
var lastPosition : Vector3 ;
var gameManager : GameManager;
var minY : float = 0.0f;
var targetY : float = 0.0f;
var curY : float = 0.0f;
var maxY : float = 0.0f;

// Use this for initialization
function Start () {
}

function Reset() {
	targetY = 0.0f;
	curY = 0.0f;
	transform.position.y = 0;
}

function ScrollY(dy : float) {
	targetY += dy;
	maxY = targetY;
}

// Update is called once per frame
function Update () {
	var dy : float = (targetY-curY);
	if (Mathf.Abs(dy) > .01) {
		transform.position.y += dy*Time.deltaTime;
		curY = transform.position.y;
	}	
	
	if (!gameManager.finished && !gameManager.showingSolution) return;
	
	if (Input.GetMouseButtonDown(0))
	{
		lastPosition = Input.mousePosition;
	}
		
	if (Input.GetMouseButton(0))
	{
		var delta : Vector3 = Input.mousePosition - lastPosition;
		curY = transform.position.y + delta.y * mouseSensitivity*Time.deltaTime;
		if (curY < minY) {
			curY = minY;	
		} else if (curY > maxY) {
			curY = maxY;
		}
		transform.position.y = curY;
		targetY = curY;
		lastPosition = Input.mousePosition;
	}
}
