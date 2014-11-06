using UnityEngine;
using System;
using UnityEngine.UI;
using System.Collections;

[System.Serializable]
public class AnimationManager: MonoBehaviour {
 
    public static AnimationManager instance ;
    
    public static AnimationManager Instance() {
 
		if (instance == null) {
			GameObject notificationObject = GameObject.Find("AnimationManager");
            	
			// Because the TextManager is a component, we have to create a GameObject to attach it to.
			if (notificationObject == null) {
				notificationObject = new GameObject("AnimationManager");
				// Add the DynamicObjectManager component, and set it as the defaultCenter
				instance = notificationObject.AddComponent<AnimationManager>();
 			}
		}
		return instance;
    }
 
    public static AnimationManager GetInstance()
    {
        return Instance();
    }   
 
	public static IEnumerator ZoomTo(Camera camera,float endFOV,float duration) {
		float rate = 1.0f/duration;
		float t = 0.0f;
		float startFOV = camera.fieldOfView;
		while (t < 1.0f) {
			t += Time.deltaTime * rate;
			camera.fieldOfView = startFOV + (endFOV - startFOV)*t;
			yield return null; 
		}
	}

	public static IEnumerator Rotation(Transform thisTransform,
                                       Quaternion endRotation,
                                       float duration) {
		float rate = 1.0f/duration;
		float t = 0.0f;
		Quaternion startRotation = thisTransform.rotation;
		while (t < 1.0f) {
			t += Time.deltaTime * rate;
			thisTransform.rotation = Quaternion.Lerp(startRotation, endRotation, t);
			yield return null; 
		}
	}

	public static IEnumerator Translation(Transform thisTransform,Vector3 endPos,float duration) {
		float rate = 1.0f/duration;
		float t = 0.0f;
		Vector3 startPos = thisTransform.localPosition;
		while (t < 1.0f) {
			Debug.Log(t);
			t += Time.deltaTime * rate;
			thisTransform.localPosition = Vector3.Lerp(startPos, endPos, t);
			yield return null; 
		}
	}

	public void TranslationBy(Transform thisTransform,Vector3 dPos,float duration)  {
		Vector3 endPos = thisTransform.localPosition + dPos;
		StartCoroutine(Translation(thisTransform, endPos, duration));
	}


	public static IEnumerator FadeMeshRenderer(MeshRenderer meshRenderer,
                                               float endAlpha,
                                               float duration) {
		float rate = 1.0f/duration;
		float t = 0.0f;
		float startAlpha = meshRenderer.material.color.a;
		while (t < 1.0f) {
			t += Time.deltaTime * rate;
			var tmp_cs1 = meshRenderer.material.color;
            tmp_cs1.a = startAlpha + (endAlpha - startAlpha)*t;
            meshRenderer.material.color = tmp_cs1;
		yield return null;
		}
	}


	public static IEnumerator FadeOverTime(Text text,
                                           float startAlpha,
                                           float endAlpha,
                                           float duration) {
		float rate = 1.0f/duration;
		float t = 0.0f;
		while (t < 1.0f) {
			t += Time.deltaTime * rate;
			text.color = new Color(text.color.r,text.color.b, text.color.g,
							   startAlpha + (endAlpha - startAlpha) * t);
			yield return null;
		}
	}

	public static IEnumerator ScaleOverTime(Transform thisTransform,
                                            Vector3 endScale,
                                            float duration) {
		float rate = 1.0f/duration;
		Vector3 startScale = thisTransform.localScale;
		float t = 0.0f;
		while (t < 1.0f) {
			t += Time.deltaTime * rate;
			thisTransform.localScale = Vector3.Lerp(startScale, endScale, t);
			yield return null;
		}
	}
}
