#pragma strict

public var maxLength : float = 0;
public var gameManager : GameManager;
public var currentPercentage : float = 0;
public var targetPercentage : float = 0;

function SetColor(color : Color) {
	renderer.material.color = color;
}

function SetMeshBounds(l : float, h:float) {
	var mesh = GetComponent(MeshFilter).mesh;
	var vertices : Vector3[] = mesh.vertices;
	vertices[0] = Vector3(0,-0.5*h,0);
	vertices[1] = Vector3(l,0.5*h,0);
	vertices[2] = Vector3(l,-0.5*h,0);
	vertices[3] = Vector3(0,0.5*h,0);
	mesh.vertices = vertices;
	mesh.RecalculateBounds();
	
	var s = 1.0;
	renderer.material.mainTextureScale = Vector2(l*s,1.0*s);
}

function GetHeight() {
	return maxLength*0.08f;
}

function IsEmpty() {
	return targetPercentage == 0;
}

function IsRed() {
	return targetPercentage < 0.33f;
}

function IsYellow() {
	return targetPercentage < 0.66f;
}

function IsGreen() {
	return targetPercentage >= 0.66f;
}

function SetProgress(p : float) {
	currentPercentage = p;
	SetMeshBounds(maxLength * p, GetHeight());
	
	if (IsRed()) {
		SetColor(Color.red);
	} else if (IsYellow()) {
		SetColor(Color.yellow);
	} else {
		SetColor(Color.green);
	}
}

function SetPercentage(p : float) {
	Debug.Log("set healthbar pct = " + p);
	targetPercentage = p;
	var endPercentage = targetPercentage;
	var startPercentage = currentPercentage;
	var duration = 0.5f;
	var rate = 1.0/duration;
	var t = 0.0f;
	while (t < 1.0) {
		if (endPercentage != targetPercentage) {
			// pct changed during animation, cancel it
			return;
		}
		t += Time.deltaTime * rate;
		SetProgress(startPercentage + (endPercentage-startPercentage)*t);
		yield;
	}
}

function Start () {
	maxLength = 0;
}

function Update () {
}