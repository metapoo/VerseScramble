using UnityEngine;
using System.Collections;

public class CameraRotate : MonoBehaviour {
	public float rate;
	public float rotateX = 0;
	public static Vector3 cameraRotation;
	bool started = false;

	// Use this for initialization
	void Start () {
		cameraRotation.x = rotateX;
		transform.eulerAngles = cameraRotation;
	}
	
	// Update is called once per frame
	void Update () {

		transform.RotateAround (Vector3.zero, Vector3.up, rate * Time.deltaTime);
		cameraRotation = transform.eulerAngles;

	}
}
