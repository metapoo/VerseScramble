namespace CSDEP
{
using UnityEngine;
using System;


public class MedWall:MonoBehaviour{
	
	public GameManager gameManager;
	
	public void Start() {
	
	}
	
	public void Update() {
	
	}
	
	public void OnTriggerEnter2D(Collider2D col) 
	{
		if (!gameManager.gameStarted) {
			gameManager.StartGame();
		}
	}

}
}
