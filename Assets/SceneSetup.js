#pragma strict

function resizeBackground(mainCam : Camera, background : SpriteRenderer) {
	if (background.sprite == null) return;
	var w = background.sprite.bounds.size.x;
	var h = background.sprite.bounds.size.y;
	var camW = mainCam.pixelWidth;
	var camH = mainCam.pixelHeight;
	var camX = 2*mainCam.ScreenToWorldPoint(new Vector3(camW, 0f, 0f)).x;
	var camY = 2*mainCam.ScreenToWorldPoint(new Vector3(0f, camH, 0f)).y;
	background.transform.localScale.x = camX/w;
	background.transform.localScale.y = camY/h;
}

function Start () {
	var background : GameObject = GameObject.Find("BG");
	var mainCam : GameObject = GameObject.Find("Main Camera");
	if ((background != null) && (mainCam != null)) {
		resizeBackground(mainCam.camera, background.GetComponent("SpriteRenderer"));
	}
}

function Update () {

}