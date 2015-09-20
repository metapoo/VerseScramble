using UnityEngine;
using System;


public class FloatingPoints:MonoBehaviour{
	
	public float startTime;
	public float ttl;
	public float startingScale;
	public TextMesh shadow;
	
	public void Start() {
		GetComponent<Rigidbody2D>().velocity = (Vector2)new Vector3(0.0f,4.0f,0.0f);
		var tmp_cs1 = GetComponent<Renderer>().material.color;
        tmp_cs1.a = 1.0f;
        GetComponent<Renderer>().material.color = tmp_cs1;
		var tmp_cs2 = shadow.gameObject.GetComponent<Renderer>().material.color;
        tmp_cs2.a = 1.0f;
        shadow.gameObject.GetComponent<Renderer>().material.color = tmp_cs2;
		startTime = Time.time;
		startingScale = transform.localScale.x;
		transform.localScale = new Vector3(0.0f,0.0f,1.0f);
		var tmp_cs3 = transform.position;
        tmp_cs3.z = 2.0f;
        transform.position = tmp_cs3;
	}
	
	public void Update() {
		float timeElapsed = Time.time - startTime;
		float scale = startingScale*timeElapsed / (ttl*0.15f);
		if (scale > startingScale) scale = startingScale;
		
		transform.localScale = new Vector3(scale,scale,1.0f);
		
		float duration = 0.33f*ttl;
		
		float alpha = (ttl - timeElapsed) / (duration);
		
		if (alpha <= 0) {
			Destroy(this.gameObject);
			return;
		} else if (alpha > 1) {
			alpha = 1.0f;
		}
		var tmp_cs4 = GetComponent<Renderer>().material.color;
        tmp_cs4.a = alpha;
        GetComponent<Renderer>().material.color = tmp_cs4;
		var tmp_cs5 = shadow.gameObject.GetComponent<Renderer>().material.color;
        tmp_cs5.a = alpha;
        shadow.gameObject.GetComponent<Renderer>().material.color = tmp_cs5;
	}
	
	public void SetPoints(float dScore,bool right) {
			
		string plusminus = "+";
		TextMesh textMesh = GetComponent<TextMesh>();
		
		textMesh.color = new Color(0.2f,1.0f,0.2f,1.0f);
		
		if (!right) {
			plusminus = "";
			if (dScore == 0) plusminus = "-";
			textMesh.color = new Color(1.0f,0.1f,0.1f,1.0f);
		}
	
		textMesh.text = String.Format("{0}{1}",plusminus,dScore);
		shadow.text = textMesh.text;
	}
	
	public void SetString(string str,bool right) {
		TextMesh textMesh = GetComponent<TextMesh>();
		textMesh.color = new Color(0.2f,1.0f,0.2f,1.0f);
		if (!right) {
			textMesh.color = new Color(1.0f,0.1f,0.1f,1.0f);
		}
		textMesh.text = str;
		shadow.text = textMesh.text;
	}


}