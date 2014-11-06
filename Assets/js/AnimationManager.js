#pragma strict

import UnityEngine.UI;

static function ZoomTo(camera : Camera, endFOV: float, duration : float) {
	var rate : float = 1.0/duration;
	var t : float = 0.0;
	var startFOV = camera.fieldOfView;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		camera.fieldOfView = startFOV + (endFOV - startFOV)*t;
		yield; 
	}
}

static function Rotation(thisTransform : Transform, endRotation : Quaternion, duration : float) {
	var rate : float = 1.0/duration;
	var t : float = 0.0;
	var startRotation : Quaternion = thisTransform.rotation;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.rotation = Quaternion.Lerp(startRotation, endRotation, t);
		yield; 
	}
}

static function Translation(thisTransform : Transform, endPos : Vector3, duration : float) {
	var rate : float = 1.0/duration;
	var t : float = 0.0;
	var startPos = thisTransform.localPosition;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.localPosition = Vector3.Lerp(startPos, endPos, t);
		yield; 
	}
}

static function TranslationBy(thisTransform : Transform, dPos : Vector3, duration : float)  {
	var endPos = thisTransform.localPosition + dPos;
	Translation(thisTransform, endPos, duration);
}


static function FadeMeshRenderer(meshRenderer : MeshRenderer, endAlpha : float, duration : float) {
	var rate : float = 1.0/duration;
	var t : float = 0.0f;
	var startAlpha : float = meshRenderer.material.color.a;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		meshRenderer.material.color.a = startAlpha + (endAlpha - startAlpha)*t;
		yield;
	}
}


static function FadeOverTime(text : UnityEngine.UI.Text, startAlpha : float, endAlpha : float, duration : float) {
	var rate : float = 1.0/duration;
	var t : float = 0.0f;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		text.color = new Color(text.color.r,text.color.b, text.color.g,
							   startAlpha + (endAlpha - startAlpha) * t);
		yield;
	}
}

static function ScaleOverTime (thisTransform : Transform, endScale : Vector3, duration : float) {
	var rate : float = 1.0/duration;
	var startScale = thisTransform.localScale;
	var t : float = 0.0;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		thisTransform.localScale = Vector3.Lerp(startScale, endScale, t);
		yield;
	}
}

