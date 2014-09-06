#pragma strict

public var exitButton : BoxCollider2D;
public var mainCam : Camera;
public var background : Transform;

function Start () {
	var w = mainCam.pixelWidth;
	var h = mainCam.pixelHeight;
	exitButton.transform.position = new Vector3(mainCam.ScreenToWorldPoint(new Vector3(w, 0f, 0f)).x-0.75f,
									  mainCam.ScreenToWorldPoint(new Vector3(0f, 0f,0f)).y+0.75f,
									  0);
	//yield WaitForSeconds(1);
	//UserSession.GetUserSession().HandleURL("verserain://com.hopeofglory.verserain/verseset/540a149f3f7ab072f26e3489/www.verserain.com");
}

function Update () {

}