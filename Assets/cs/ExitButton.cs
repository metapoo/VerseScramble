namespace CSDEP
{
using UnityEngine;
using System;
using UnityEngine.SceneManagement;


public class ExitButton:MonoBehaviour{
	
	public GameManager gameManager;
	public string level;
	public AudioClip sndSelect;
	
	
	public void OnMouseDown() {
	    Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	    RaycastHit2D hit = Physics2D.GetRayIntersection(ray,Mathf.Infinity);
	    bool wasReallyHit = false;  
	    if ((hit.collider != null) && (hit.collider.transform == transform))
	    {
	    	wasReallyHit = true;
	    }
	    // fix bug where onmousedown is triggered when it shouldn't be
		if (!wasReallyHit)  {
			Debug.Log("exit button not really hit");
			return;
		}
		
		if (gameManager != null) {
			gameManager.Cleanup();
		}
//		Application.LoadLevel(level);
		SceneManager.LoadScene(level);
		Debug.Log("load level " + level);
	}
	
	public void OnMouseUp() {
	}
	
	public void Start() {
		SpriteRenderer sr = GetComponent<SpriteRenderer>();
		sr.color = new Color(80.0f/255.0f, 89.0f/255.0f, 184.0f/255.0f, 1f);
	}
	
	public void Update() {
	
	}

}
}
