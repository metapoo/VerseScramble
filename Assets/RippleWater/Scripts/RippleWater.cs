using UnityEngine;
using System.Collections;

public class RippleWater : MonoBehaviour {

	public Material mat; // Material to apply to the generated mesh
	public Vector2 size = new Vector2(10f,10f); // Scale of the mesh generated
	public int res = 128; // Resolution of the mesh generated
	public float dampening = 0.01f; // Strength of the dampening applied to the water
	public float speed = 1f; // Multiplier for the overall speed of the waves.

	//huge lists for mesh, HideInInspector to avoid huge lag from debug inspector.
	[HideInInspector]
	private Vector3[] newVertices;
	[HideInInspector]
	private Vector2[] newUV;
	[HideInInspector]
	private int[] newTriangles;

	private MeshRenderer mr;
	private Mesh mesh;

	public bool rain = false; // Turn rain on or off
	public float rainDensity = 0.1f; // Adjusts the frequency of raindrops
	public float rainMomentum = 1f; // Adjusts the impact force of each raindrop

	public bool waves = false; // Turn waves on or off
	public float waveStrength = 1f; // Adjust the height of the waves

	private float waveDensity = 1f;

	[HideInInspector]
	public Vector2[,] accel; //2D Array of Vector2 representing all vertices,
							 //where Vector2.x is the vertex offset and Vector2.y is the Vertex Velocity.



	void Start () 
	{
		GenerateMesh();
	}

	void FixedUpdate () 
	{

		for(int i = 0; i < newVertices.Length; i++)
		{
			if (i >= res+1 && i < newVertices.Length - (res+1) && i % res > 0 && i % res < res)
			{
				// Find the average velocity of surrounding vertices and add this to the original vertex velocity.
				float tempSmoothed = (newVertices[i].y + newVertices[i-1].y + newVertices[i+1].y + 
				                      newVertices[i-res].y + newVertices[(i-res)+1].y + newVertices[(i-res)-1].y +
				                      newVertices[(i+res)].y + newVertices[(i+res)+1].y + newVertices[(i+res)-1].y) / 9;
				accel[i%res,i/res].y += (tempSmoothed - accel[i%res,i/res].x);
			}
		} 
		float r;
		for (int i = 0; i < res; i++)
		{
			for (int j = 0; j < res; j++)
			{
				if (rain)
				{
					//apply rain
					r = Random.Range(0f,1f);
					if (r < rainDensity/10000)
					{
						smoothDepress(j,i, 0.05f * rainMomentum);
					}
				}
				if(waves)
				{
					//apply wave
					r = Random.Range(0f,1f);
					if (r < waveDensity/100)
					{
						r = Random.Range(-0.002f,0.002f);
						smoothDepress(j,i, r * waveStrength);
					}
				}
				//Apply the vertex velocity to the vertex offset.
				accel[j,i].x += accel[j,i].y * Time.fixedDeltaTime * speed * 30;
				//Apply Dampening
				accel[j,i].y *= 1f - (dampening);
				accel[j,i].x *= 1f - (dampening);
				//Set new vertex locations
				newVertices[j+(i*res)].y = accel[j,i].x;
			}
		}
		//Apply new vertex locations and recalculate normals.
		mesh.vertices = newVertices;
		mesh.RecalculateNormals(); 
	}







	public void smoothDepress (int x, int y, float strength)
	{
		//	Apply a smooth depression based on the vertex location and strength parameter given.
		//	Only Do this if at least 2 verts from the edge, as the edge position is locked.
		if (x >= 2 && x < res - 2 && y >= 2 && y < res - 2)
		{
			//Center vertex
			accel[x,y].y -= strength;
			//Adjacent vertices (left, right, up and down)
			accel[x+1,y].y -= strength * 0.8f;
			accel[x-1,y].y -= strength * 0.8f;
			accel[x,y+1].y -= strength * 0.8f;
			accel[x,y-1].y -= strength * 0.8f;
			//Diagonal vertices
			accel[x+1,y+1].y -= strength * 0.7f;
			accel[x+1,y-1].y -= strength * 0.7f;
			accel[x-1,y+1].y -= strength * 0.7f;
			accel[x-1,y-1].y -= strength * 0.7f;

			if (x >= 3 && x < res - 3 && y >= 3 && y < res - 3)
			{
				//left, right, up and down vertices, 2 verts from center.
				accel[x+2,y].y -= strength * 0.5f;
				accel[x-2,y].y -= strength * 0.5f;
				accel[x,y+2].y -= strength * 0.5f;
				accel[x,y-2].y -= strength * 0.5f;
			}
		}
	}

	void GenerateMesh ()
	{
		//Initialise acceleration array
		accel = new Vector2[res,res];
		for (int i = 0; i < res; i++)
		{
			for (int j = 0; j < res; j++)
			{
				accel[i,j] = new Vector2(0f,0f);
			}
		}

		//Initialise mesh variables
		newVertices = new Vector3[res*res];
		newUV = new Vector2[res*res];
		newTriangles = new int[(res-1)*(res-1)*2*3];

		//Set Vertex locations and UVs, from left to right then top to bottom.
		for (int i = 0; i < res; i++)
		{
			for (int j = 0; j < res; j++)
			{
				newVertices[j+(i*res)] = new Vector3(((1.0f*j)/res)*size.x,0f,((1.0f*i)/res)*size.y);
				newUV[j+(i*res)] = new Vector2(((1.0f*j)/res),((1.0f*i)/res));
				
			}
		}

		//Create Triangles, from left to right then top to bottom.
		for (int i = 0; i < res-1; i++)
		{
			for (int j = 0; j < res-1; j++)
			{
				newTriangles[((j+(i*(res-1)))*6)+0] = (j+0)+((i+0)*res);
				newTriangles[((j+(i*(res-1)))*6)+2] = (j+1)+((i+0)*res);
				newTriangles[((j+(i*(res-1)))*6)+1] = (j+0)+((i+1)*res);
				newTriangles[((j+(i*(res-1)))*6)+3] = (j+1)+((i+0)*res);
				newTriangles[((j+(i*(res-1)))*6)+4] = (j+0)+((i+1)*res);
				newTriangles[((j+(i*(res-1)))*6)+5] = (j+1)+((i+1)*res);
			}
		}

		//add mesh components and build the mesh. Then apply collider and material.
		gameObject.AddComponent<MeshFilter>();
		mr = gameObject.AddComponent<MeshRenderer>();

		mesh = new Mesh ();
		GetComponent<MeshFilter>().mesh = mesh;

		mesh.vertices = newVertices;
		mesh.uv = newUV;
		mesh.triangles = newTriangles;
		mesh.RecalculateNormals();
		gameObject.AddComponent<BoxCollider>();

		if(mat == null)
		{
			Debug.LogWarning("Ripple Water - No Material Given");
		}
		else
		{
			mr.material = mat;
		}
	}
}
