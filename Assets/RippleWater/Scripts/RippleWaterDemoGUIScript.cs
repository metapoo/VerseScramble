using UnityEngine;
using System.Collections;

public class RippleWaterDemoGUIScript : MonoBehaviour {

	public Transform waterObject; //This is the transform with the RippleWater Component
	private RippleWater wc;

	void Start () 
	{
		if (waterObject != null)
		{
			wc = waterObject.GetComponent<RippleWater>();
		}
		else
		{
			Debug.LogError("RippleWaterDemoGUIScript - No Reference to RippleWater GameObject");
		}
	}

	void OnGUI ()
	{
		if (waterObject != null)
		{
			//Draw the demo Control Panel in top left corner.
			GUI.Box(new Rect(0,0,298,242),"");
			GUILayout.BeginArea(new Rect(2,2,296,240));

			GUILayout.BeginHorizontal();
			GUILayout.Label("Dampening",GUILayout.Width(70));
			wc.dampening = GUILayout.HorizontalSlider(wc.dampening,0.001f,0.4f,GUILayout.Width(180));
			GUILayout.Label(wc.dampening.ToString("F"));
			GUILayout.EndHorizontal();

			GUILayout.BeginHorizontal();
			GUILayout.Label("Speed",GUILayout.Width(70));
			wc.speed = GUILayout.HorizontalSlider(wc.speed,0.5f,2f,GUILayout.Width(180));
			GUILayout.Label(wc.speed.ToString("F"));
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal();
			GUILayout.Label("Rain",GUILayout.Width(70));
			wc.rain = GUILayout.Toggle(wc.rain,"");
			GUILayout.EndHorizontal();

			GUILayout.BeginHorizontal();
			GUILayout.Label("Rain Density",GUILayout.Width(70));
			wc.rainDensity = GUILayout.HorizontalSlider(wc.rainDensity,0.1f,2f,GUILayout.Width(180));
			GUILayout.Label(wc.rainDensity.ToString("F"));
			GUILayout.EndHorizontal();

			GUILayout.BeginHorizontal();
			GUILayout.Label("Rain Momentum",GUILayout.Width(70));
			wc.rainMomentum = GUILayout.HorizontalSlider(wc.rainMomentum,0.1f,3f,GUILayout.Width(180));
			GUILayout.Label(wc.rainMomentum.ToString("F"));
			GUILayout.EndHorizontal();

			GUILayout.BeginHorizontal();
			GUILayout.Label("Waves",GUILayout.Width(70));
			wc.waves = GUILayout.Toggle(wc.waves,"");
			GUILayout.EndHorizontal();

			GUILayout.BeginHorizontal();
			GUILayout.Label("Wave Strength",GUILayout.Width(70));
			wc.waveStrength = GUILayout.HorizontalSlider(wc.waveStrength,0.1f,8f,GUILayout.Width(180));
			GUILayout.Label(wc.waveStrength.ToString("F"));
			GUILayout.EndHorizontal();

			if(GUILayout.Button("Reset"))
			{
				wc.dampening = 0.01f;
				wc.speed = 1f;
				wc.rain = false;
				wc.rainDensity = 0.11f;
				wc.rainMomentum = 1f;
				wc.waves = false;
				wc.waveStrength = 1f;
			}	
			GUILayout.EndArea();
		}
	}
}
