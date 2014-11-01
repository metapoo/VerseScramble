using UnityEngine;
using System.Collections;

public class TerrainTextureChanger : MonoBehaviour
{
	public Terrain terrain;
	private float currentProgress = 0;
	public float targetProgress = 0;
	private float[,] defaultAlphaMap = null;
	private float progressGrassDetail = 0;

	private int targetGrassDetail = 0;

	void IncrementProgress() {
		currentProgress += 0.1f;
		if (currentProgress >= 3.0f) {
			currentProgress = 3.0f;
		}
		UpdateTerrainTexture(terrain.terrainData, currentProgress);
	}


	void SetCurrentProgress(float progress) {
		UpdateTerrainTexture(terrain.terrainData, progress);
		currentProgress = progress;

	}

	void SetTargetProgress(float progress) {
		targetProgress = progress;
		Debug.Log ("target progress set to " + progress.ToString());
		
		if (progress >= 3.0f) {
			targetGrassDetail = 1;
		} else if (progress == 0.0f) {
			targetGrassDetail = 0;
		}
	}

	void Start() {
		targetProgress = 0.0f;
		currentProgress = 0.0f;

		ResetTerrainTexture(terrain.terrainData);
		progressGrassDetail = 0;
		targetProgress = 0;
	}

	void SyncGrassDetail() {
		if (progressGrassDetail == 0) {
			ResetGrassDetail();
			return;
		}

		if (progressGrassDetail < (float)0.5) {
			SetGrassDetail(terrain.terrainData, 0, 2, 1, progressGrassDetail*(float)2.0);
		} else {
			SetGrassDetail(terrain.terrainData, 1, 1, 4, (float)2.0*(progressGrassDetail-(float)0.5));
		}
	}
	
	void Update()
	{
		float r =  Time.deltaTime*0.5f;
		float g = Time.deltaTime*0.25f;

		if (Mathf.Abs (targetGrassDetail - progressGrassDetail) > g) {
			if (targetGrassDetail > progressGrassDetail) {
				progressGrassDetail += g;
			} else {
				progressGrassDetail -= g;
			}
			SyncGrassDetail();
		} else if (targetGrassDetail != progressGrassDetail) {

			progressGrassDetail = targetGrassDetail;
			SyncGrassDetail();
		}

		if (Mathf.Abs(targetProgress - currentProgress) > r) {
			if (targetProgress > currentProgress) {
				currentProgress += r;
			} else {
				currentProgress -= r;
			}

			SetCurrentProgress(currentProgress);

		} else if (targetProgress != currentProgress) {
			currentProgress = targetProgress;
			SetCurrentProgress(currentProgress);
		}

	}

	void SetGrassDetail(TerrainData terrainData, int layer, int detail, int skip, float progress) {

		int [,] map = terrainData.GetDetailLayer(0, 0, terrainData.detailWidth, terrainData.detailHeight, 0);
		int v = Mathf.RoundToInt((progress)*terrainData.detailWidth);

		// For each pixel in the detail map...
		for (int y = 0; y < terrainData.detailHeight; y++) {
			for (int x = 0; x <terrainData.detailWidth; x++) {
				if ((x <= v) && (((x+y) % skip) == 0)) {
					map[x,y] = detail;
				} else {
					map[x,y] = 0;
				}
			}
		}
			
		// Assign the modified map back.
		terrainData.SetDetailLayer(0, 0, layer, map);
	}

	void ResetGrassDetail() {
		SetGrassDetail(terrain.terrainData,0,0,1,1);
		SetGrassDetail(terrain.terrainData,1,0,1,1);
	}

	void ResetTerrainTexture(TerrainData terrainData) {
		ResetGrassDetail();

		//get current paint mask
		float[, ,] alphas = terrainData.GetAlphamaps(0, 0, terrainData.alphamapWidth, terrainData.alphamapHeight);
		// make sure every grid on the terrain is modified
		bool loadAlphaMap = false;

		if (defaultAlphaMap == null) {
			defaultAlphaMap = new float[terrainData.alphamapWidth, terrainData.alphamapHeight];	
			loadAlphaMap = true;
		}

		for (int i = 0; i < terrainData.alphamapWidth; i++)
		{
			for (int j = 0; j < terrainData.alphamapHeight; j++)
			{
				if (loadAlphaMap) {
					float sum = 0;
					for (int k=0;k<4;k++) {
						sum += alphas[i,j,k];
					}
					if (sum >= 1) sum = 1;

					defaultAlphaMap[i,j] = sum;
				}

				alphas[i, j, 0] = defaultAlphaMap[i,j];
				alphas[i, j, 1] = 0;
				alphas[i, j, 2] = 0;
				alphas[i, j, 3] = 0;

			}
		}
		// apply the new alpha
		terrainData.SetAlphamaps(0, 0, alphas);
	}

	void UpdateTerrainTexture(TerrainData terrainData, float terrainProgress)
	{
		int textureNumberFrom = (int) Mathf.FloorToInt(terrainProgress);
		int textureNumberTo = (textureNumberFrom + 1) % 4;
		int textureNumberPrev = textureNumberFrom - 1;
		float progressBetween = (terrainProgress - textureNumberFrom);
		float fromAlpha = (float)1.0 - progressBetween;
		float toAlpha = progressBetween;

		if (textureNumberPrev < 0) {
			textureNumberPrev = 3;
		}

		//get current paint mask
		float[, ,] alphas = terrainData.GetAlphamaps(0, 0, terrainData.alphamapWidth, terrainData.alphamapHeight);
		// make sure every grid on the terrain is modified
		for (int i = 0; i < terrainData.alphamapWidth; i++)
		{
			for (int j = 0; j < terrainData.alphamapHeight; j++)
			{
				if ((textureNumberTo <= 3) && (textureNumberTo >= 0)) {
					alphas[i, j, textureNumberTo] = toAlpha*defaultAlphaMap[i,j];
				}
				if (textureNumberFrom >= 0) {
					alphas[i, j, textureNumberFrom] = fromAlpha*defaultAlphaMap[i,j];
				}
				if (textureNumberPrev != -1) {
					alphas[i, j, textureNumberPrev] = 0;
				}
			}
		}
		// apply the new alpha
		terrainData.SetAlphamaps(0, 0, alphas);
	}
}