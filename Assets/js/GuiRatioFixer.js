// Use this on a guiText or guiTexture object to automatically have them

// adjust their aspect ratio when the game starts.

public var m_NativeRatio : float ;

function Start() {
   
	var currentRatio = (Screen.width+0.0) / Screen.height;
	transform.localScale.x = 1.0*m_NativeRatio / currentRatio;
}