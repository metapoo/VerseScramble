using UnityEngine;
using System.Collections;

public class RippleWaterCam : MonoBehaviour {

	private Ray ray;
	private RaycastHit hit;

	public Transform waterObject; //This is the transform with the RippleWater Component
	public float strength = 30f;  //The Strength of the water manipulation effect

	private RippleWater wc; 

	void Start ()
	{
		if (waterObject != null)
		{
			wc = waterObject.GetComponent<RippleWater>();
		}
		else
		{
			Debug.LogError("RippleWaterCam - No Reference to RippleWater Object");
		}
	}
	void Update () 
	{
		if (waterObject != null)
		{
			if(Input.GetMouseButton(0))
			{
				//	On Left click, push the water down at point of click, To do this:
				//	-Subtract waterObject's position from the hit Point.
				//	-Divide by the scale of the water quad drawn by the RippleWater Component.
				//	-Multiply by the resolution, Resulting in the indices of the vertex clicked on.
				//	-Pass these indices to the RippleWater.SmoothDepress function, followed by a strength parameter.

				ray = camera.ScreenPointToRay(Input.mousePosition);
				if (Physics.Raycast (ray.origin, ray.direction, out hit, 10000))
				{
					Vector3 hitLoc = hit.point;

					hitLoc -= waterObject.position;
					hitLoc.x /= wc.size.x;
					hitLoc.z /= wc.size.y;
					hitLoc.x *= wc.res;
					hitLoc.z *= wc.res;

					wc.smoothDepress((int)(hitLoc.x), (int)(hitLoc.z), 0.05f * strength * Time.deltaTime);
				}
			}
			if(Input.GetMouseButton(1))
			{
				//	On Right click, pull the water up at point of click. The same as pushing, but with a negative strength parameter.
				ray = camera.ScreenPointToRay(Input.mousePosition);
				if (Physics.Raycast (ray.origin, ray.direction, out hit, 10000))
				{
					Vector3 hitLoc = hit.point;

					hitLoc -= waterObject.position;
					hitLoc.x /= wc.size.x;
					hitLoc.z /= wc.size.y;
					hitLoc.x *= wc.res;
					hitLoc.z *= wc.res;

					wc.smoothDepress((int)(hitLoc.x), (int)(hitLoc.z), -0.05f * strength * Time.deltaTime);
				}
			}
		}
	}
}
