using UnityEngine;
using System;

public class SkyManager:MonoBehaviour{
	
	public Transform bgCamera;
	public Camera bgCamCam;
	public MeshRenderer rainbow;
	
	public void LookAtRainbow() {
		
		StartCoroutine(AnimationManager.Rotation(bgCamera, Quaternion.Euler(-25.0f,0.0f,0.0f), 2.0f));
	}
	
	public void LookAtTerrain() {
		StartCoroutine(AnimationManager.Rotation(bgCamera, Quaternion.Euler(0.0f,0.0f,0.0f), 2.0f));
	}
	
	public void ShowRainbow() {
		rainbow.active = true;
		StartCoroutine(AnimationManager.FadeMeshRenderer(rainbow, 1.0f, 2.0f));
	}
	
	public void HideRainbow() {
		StartCoroutine(AnimationManager.FadeMeshRenderer(rainbow, 0.0f, 2.0f));
	}
	
	public void ZoomOut() {
		StartCoroutine(AnimationManager.ZoomTo(bgCamCam, 70.0f, 2.0f));
	}
	
	public void Start() {
		bgCamCam.fieldOfView = 50.0f;
		bgCamera.rotation = Quaternion.Euler(-25.0f,0.0f,0.0f);
		rainbow.active = false;
	}
	
	public void Update() {
	}
}
