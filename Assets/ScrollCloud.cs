using UnityEngine;
using System.Collections;

public class ScrollCloud : MonoBehaviour {
	public float scrollSpeed = 0.05f;

	// Use this for initialization
	void Start () {
	
	}
	
	void Update() {
		float offset = Time.time * scrollSpeed;
		renderer.material.SetTextureOffset("_MainTex", new Vector2(offset, 0));
	}
}
