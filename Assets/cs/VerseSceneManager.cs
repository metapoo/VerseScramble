using UnityEngine;
using UnityEngine.SceneManagement;
using System;

public class VerseSceneManager : MonoBehaviour
{
	public static AsyncOperation loadSceneAsyncOp;

	public VerseSceneManager ()
	{
	}

	public static bool isLoading()
	{
		return (loadSceneAsyncOp != null && !loadSceneAsyncOp.isDone);
	}

	public static bool loadScene(string sceneName)
	{
		if (isLoading ()) {
			return false;
		}
		loadSceneAsyncOp = SceneManager.LoadSceneAsync (sceneName);
		return true;
	}

	public static bool loadScramble()
	{
		return loadScene("scramble");
	}

	public static bool loadVersesets()
	{
		return loadScene("versesets");
	}

	public static bool loadTitle()
	{
		return loadScene ("title");
	}
}

