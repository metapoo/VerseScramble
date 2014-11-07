using UnityEngine;
using System;


public class PanCamera:MonoBehaviour{
	
	public float mouseSensitivity = 0.75f;
	public Vector3 lastPosition ;
	public GameManager gameManager;
	public float minY = 0.0f;
	public float targetY = 0.0f;
	public float curY = 0.0f;
	public float maxY = 0.0f;
	public float velocityY = 0.0f;
	public float dragY = 10.0f;
	public bool mouseDown = false;
	public bool scrolling = false;
	public Camera mainCamera;
	
	// Use this for initialization
	public void Start() {
	}
	
	public void Reset() {
		targetY = 0.0f;
		curY = 0.0f;
		var tmp_cs1 = transform.position;
        tmp_cs1.y = 0.0f;
        transform.position = tmp_cs1;
		scrolling = false;
		mouseDown = false;
	}
	
	public void ScrollY(float dy) {
		targetY += dy;
		maxY = targetY;
		scrolling = true;
	}
	
	public void SyncCurY() {
		if (curY < minY) {
			curY = minY;	
		} else if (curY > maxY) {
			curY = maxY;
		}
			
		var tmp_cs2 = transform.position;
        tmp_cs2.y = curY;
        transform.position = tmp_cs2;
	}
	
	// Update is called once per frame
	public void Update() {
		float dy = (targetY-curY);
		if (!mouseDown) {
			if ((Mathf.Abs(dy) > 0) && scrolling) {
				if (Mathf.Abs(dy) < .01f) {
					curY = targetY;
				} else {
					dy = dy*Time.deltaTime;
					if (Mathf.Abs(dy) < .01f)  {
						if (dy > 0) {
							dy = .01f;
						} else {
							dy = -.01f;
						}
					}
					curY += dy;
				}
			} else {
				scrolling = false;
			}
			
			if (Mathf.Abs(velocityY) > .01f) {
				curY += velocityY;	
				if (velocityY > 0) {
					velocityY -= dragY*Time.deltaTime;
				} else {	
					velocityY += dragY*Time.deltaTime;
				}
				if (Mathf.Abs(velocityY) < 0.5f) {
					velocityY = 0.0f;
				}
			}
		}
		
		SyncCurY();
		
		if (!gameManager.finished && !gameManager.showingSolution) return;
		
		if (Input.GetMouseButtonDown(0))
		{
			mouseDown = true;
			lastPosition = mainCamera.ScreenToWorldPoint(Input.mousePosition);
			
		}
		if (Input.GetMouseButtonUp(0)) {
			mouseDown = false;
		}
			
		if (Input.GetMouseButton(0))
		{
			Vector3 delta = mainCamera.ScreenToWorldPoint(Input.mousePosition) - lastPosition;
			float dPosY = delta.y * mouseSensitivity;
			
			curY = transform.position.y + dPosY;
			velocityY = dPosY*0.5f + velocityY*0.5f;
			
			SyncCurY();
			targetY = curY;
			lastPosition = mainCamera.ScreenToWorldPoint(Input.mousePosition);
		}
	}

}
