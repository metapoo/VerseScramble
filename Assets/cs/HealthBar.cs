using UnityEngine;
using System;
using UnityEngine.UI;
using System.Collections;


public class HealthBar:MonoBehaviour{
	
	public GameManager gameManager;
	public float currentPercentage = 0.0f;
	public float targetPercentage = 0.0f;
	public float maxLength;
	public Text healthLabel;
	
	public RectTransform rectTransform;
	public Image image;
	
	public bool IsEmpty() {
		return targetPercentage == 0;
	}
	
	public bool IsRed() {
		return targetPercentage < 0.50f;
	}
	
	public bool IsYellow() {
		return targetPercentage < 1.00f;
	}
	
	public bool IsGreen()  {
		return targetPercentage >= 1.00f;
	}
	
	public void SetColor(Color color) {
		image.color = color;
	}
	
	public float GetHeight() {
		return (float)rectTransform.sizeDelta[1];
	}
	
	public void SetProgress(float p) {
		currentPercentage = p;
		healthLabel.text = String.Format("{0}x", Mathf.RoundToInt(p*100.0f));
		if (p > 1.0f) {
			p = 1.0f;
		}
		Vector2 newSize = new Vector2(maxLength*p, GetHeight());
		rectTransform.sizeDelta = newSize;
		
		if (IsRed()) {
			SetColor(Color.red);
		} else if (IsYellow()) {
			SetColor(Color.yellow);
		} else {
			SetColor(Color.green);
		}
	}
	
	public IEnumerator SetPercentage(float p) {
		//Debug.Log("set healthbar pct = " + p);
		targetPercentage = p;
		float endPercentage = targetPercentage;
		float startPercentage = currentPercentage;
		
		// make sure percentage is not below 0.05f for graphic purposes
		if (startPercentage < 0.05f) {
			startPercentage = 0.05f;
		}
		
		if (endPercentage == 0) {
			if (startPercentage <= 0.05f) {
				startPercentage = 0.0f;
			}
		}
		float duration = 1.0f;
		float rate = 1.0f/duration;
		float t = 0.0f;
		while (t < 1.0f) {
			if (endPercentage != targetPercentage) {
				// pct changed during animation, cancel it
				break;
			}
			t += Time.deltaTime * rate;
			SetProgress(startPercentage + (endPercentage-startPercentage)*t);
			yield return null;
		}
		SetProgress(endPercentage);
	}
	
	public void Start() {
		maxLength = (float)rectTransform.sizeDelta[0];
	}
	
	public void Update() {
	}
}
