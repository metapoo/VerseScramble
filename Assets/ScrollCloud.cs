using UnityEngine;
using System.Collections;

public class ScrollCloud : MonoBehaviour {
	public float scrollSpeed = 1.0f;

	// Use this for initialization
	void Start () {

	}
	
	void Update() {
		Vector3 position = transform.position;
		float dx = Time.deltaTime*scrollSpeed;
		position.x += dx;
		if ((6670.0f - position.x) < dx) {
			position.x = 0;
		}
		transform.position = position;

	}
}
