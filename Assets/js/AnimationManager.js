static function Translation (thisTransform : Transform, startPos : Vector3, endPos : Vector3, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.position = Vector3.Lerp(startPos, endPos, t);
		yield; 
	}
}

static function SetTextMeshAlpha (textMesh : TextMesh, alpha : float) {
	var c : Color = textMesh.color;
	textMesh.color = Color(c[0],c[1],c[2],alpha);
}

static function FadeOverTime(textMesh : TextMesh, startAlpha : float, endAlpha : float, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0f;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		SetTextMeshAlpha(textMesh, startAlpha + (endAlpha-startAlpha)*t);
		yield;
	}
}

static function ScaleOverTime (thisTransform : Transform, startScale : Vector3, endScale : Vector3, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.localScale = Vector3.Lerp(startScale, endScale, t);
		yield;
	}
}


static function ChangeFontOverTime (guiText : GUIText, startFont : float, endFont : float, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		guiText.fontSize = startFont + (endFont - startFont) *t;
		yield;
	}
}
