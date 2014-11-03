#pragma strict

var bgCamera : Transform;
var rainbow : MeshRenderer;

function LookAtRainbow() {
	
	AnimationManager.Rotation(bgCamera, new Quaternion.Euler(-25,5,0), 2.0f);
}

function LookAtTerrain() {
	AnimationManager.Rotation(bgCamera, new Quaternion.Euler(-0,0,0), 2.0f);
}

function ShowRainbow() {
	rainbow.active = true;
	AnimationManager.FadeMeshRenderer(rainbow, 1.0f, 2.0f);
}

function HideRainbow() {
	AnimationManager.FadeMeshRenderer(rainbow, 0.0f, 2.0f);
}

function Start () {
	rainbow.active = false;
}

function Update () {
}