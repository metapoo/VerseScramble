import UnityEngine.UI;

static function Translation(thisTransform : Transform, endPos : Vector3, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0;
	var startPos = thisTransform.localPosition;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.localPosition = Vector3.Lerp(startPos, endPos, t);
		yield; 
	}
}

static function TranslationBy(thisTransform : Transform, dPos : Vector3, duration : float) {
	var endPos = thisTransform.localPosition + dPos;
	return Translation(thisTransform, endPos, duration);
}

static function FadeOverTime(text : Text, startAlpha : float, endAlpha : float, duration : float) {
	var rate = 1.0/duration;
	var t = 0.0f;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		text.color.a = startAlpha + (endAlpha - startAlpha) * t;
		yield;
	}
}

static function ScaleOverTime (thisTransform : Transform, endScale : Vector3, duration : float) {
	var rate = 1.0/duration;
	var startScale = thisTransform.localScale;
	var t = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.localScale = Vector3.Lerp(startScale, endScale, t);
		yield;
	}
}

