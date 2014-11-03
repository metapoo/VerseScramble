var mouseSensitivity : float = 1.0f;
var lastPosition : Vector3 ;
var gameManager : GameManager;

// Use this for initialization
function Start () {
}

// Update is called once per frame
function Update () {
	if (!gameManager.finished && !gameManager.showingSolution) return;
	
	if (Input.GetMouseButtonDown(0))
	{
		lastPosition = Input.mousePosition;
	}
		
	if (Input.GetMouseButton(0))
	{
		var delta : Vector3 = Input.mousePosition - lastPosition;
		transform.Translate(0, delta.y * mouseSensitivity*Time.deltaTime, 0);
		lastPosition = Input.mousePosition;
	}
}
