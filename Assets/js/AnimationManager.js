#pragma strict

import UnityEngine.UI;

class AnimationManager extends MonoBehaviour {
 
    static var instance:AnimationManager ;
    
    static function Instance() : AnimationManager {
 
		if (instance == null) {
			var notificationObject:GameObject = GameObject.Find("AnimationManager");
            	
			// Because the TextManager is a component, we have to create a GameObject to attach it to.
			if (notificationObject == null) {
				notificationObject = new GameObject("AnimationManager");
				// Add the DynamicObjectManager component, and set it as the defaultCenter
				instance = notificationObject.AddComponent(AnimationManager);
 			}
		}
		return instance;
    }
 
    public static function GetInstance () : AnimationManager
    {
        return Instance();
    }   
 
	public static function ZoomTo(camera : Camera, endFOV: float, duration : float) {
		var rate : float = 1.0/duration;
		var t : float = 0.0;
		var startFOV = camera.fieldOfView;
		while (t < 1.0) {
			t += Time.deltaTime * rate;
			camera.fieldOfView = startFOV + (endFOV - startFOV)*t;
			yield; 
		}
	}

	public static function Rotation(thisTransform : Transform, endRotation : Quaternion, duration : float) {
		var rate : float = 1.0/duration;
		var t : float = 0.0;
		var startRotation : Quaternion = thisTransform.rotation;
		while (t < 1.0) {
			t += Time.deltaTime * rate;
			thisTransform.rotation = Quaternion.Lerp(startRotation, endRotation, t);
			yield; 
		}
	}

	public static function Translation(thisTransform : Transform, endPos : Vector3, duration : float) : IEnumerator {
		var rate : float = 1.0/duration;
		var t : float = 0.0;
		var startPos = thisTransform.localPosition;
		while (t < 1.0) {
			Debug.Log(t);
			t += Time.deltaTime * rate;
			thisTransform.localPosition = Vector3.Lerp(startPos, endPos, t);
			yield; 
		}
	}

	public function TranslationBy(thisTransform : Transform, dPos : Vector3, duration : float)  {
		var endPos = thisTransform.localPosition + dPos;
		Translation(thisTransform, endPos, duration);
	}


	public static function FadeMeshRenderer(meshRenderer : MeshRenderer, endAlpha : float, duration : float) {
		var rate : float = 1.0/duration;
		var t : float = 0.0f;
		var startAlpha : float = meshRenderer.material.color.a;
		while (t < 1.0) {
			t += Time.deltaTime * rate;
			meshRenderer.material.color.a = startAlpha + (endAlpha - startAlpha)*t;
		yield;
		}
	}


	public static function FadeOverTime(text : UnityEngine.UI.Text, startAlpha : float, endAlpha : float, duration : float) {
		var rate : float = 1.0/duration;
		var t : float = 0.0f;
		while (t < 1.0) {
			t += Time.deltaTime * rate;
			text.color = new Color(text.color.r,text.color.b, text.color.g,
							   startAlpha + (endAlpha - startAlpha) * t);
			yield;
		}
	}

	public static function ScaleOverTime (thisTransform : Transform, endScale : Vector3, duration : float) {
		var rate : float = 1.0/duration;
		var startScale = thisTransform.localScale;
		var t : float = 0.0;
		while (t < 1.0) {
			t += Time.deltaTime * rate;
			thisTransform.localScale = Vector3.Lerp(startScale, endScale, t);
			yield;
		}
	}
}
