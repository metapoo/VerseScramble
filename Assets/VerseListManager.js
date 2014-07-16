#pragma strict

public var exitButton : BoxCollider2D;
public var mainCam : Camera;
public var background : Transform;

function resizeBackground() {
/*
	var w = background.renderer.bounds.size.x;
	var h = background.renderer.bounds.size.y;
	var camW = mainCam.pixelWidth;
	var camH = mainCam.pixelHeight;
	var camX = 2*mainCam.ScreenToWorldPoint(new Vector3(camW, 0f, 0f)).x;
	var camY = 2*mainCam.ScreenToWorldPoint(new Vector3(0f, camH, 0f)).y;
	background.transform.localScale.x = camX/w;
	background.transform.localScale.y = camY/h;
	*/
}

function Start () {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	exitButton.transform.position = new Vector3(mainCam.ScreenToWorldPoint(new Vector3(w, 0f, 0f)).x-0.75f,
									  mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).y+0.75f,
									  0);
	resizeBackground();
}

function Update () {

}