using UnityEngine;
using System;
using System.Collections.Generic;
using System.Collections;
using Facebook.Unity;

public class FacebookManager : MonoBehaviour {
	private static FacebookManager instance;
	private static string _picUrl;
	private static string _name;
	private static string _email;
	private static bool _initialized;

	//-----------------------------------------------------------------------------------------------
	// Returns an instance of the FacebookManager
	//-----------------------------------------------------------------------------------------------
	private static FacebookManager Instance
	{
		get
		{
			if (instance == null)
			{
				// Because the FacebookManager is a component, we have to create a GameObject to attach it to.
				GameObject notificationObject = new GameObject("FacebookManager");
				
				// Add the DynamicObjectManager component, and set it as the defaultCenter
				instance = (FacebookManager) notificationObject.AddComponent(typeof(FacebookManager));
			}
			return instance;
		}
	}

	//-----------------------------------------------------------------------------------------------
	// Returns an instance of the FacebookManager
	//-----------------------------------------------------------------------------------------------
	public static FacebookManager GetInstance()
	{
		return Instance;
	}  

	public void OnLogin(ILoginResult loginResult) {
		FB.API("/me/picture?redirect=false", HttpMethod.GET, delegate (IGraphResult picResult) {
			IDictionary<string, object> picResultDictionary = picResult.ResultDictionary;
			if (picResultDictionary != null) {
				IDictionary<string, object> picData = (IDictionary<string, object>)picResultDictionary["data"];
				_picUrl = (string) picData["url"];
			}
			FB.API ("/me", HttpMethod.GET, delegate(IGraphResult meResult) {
				IDictionary<string, object> meResultDictionary = meResult.ResultDictionary;

				if (meResultDictionary != null) {
					if (meResultDictionary.ContainsKey("name")) {
						_name = (string) meResultDictionary["name"];
					}

					if (meResultDictionary.ContainsKey("email")) {
						_email = (string) meResultDictionary["email"];
					}
				}

				UserSession userSession = UserSession.GetUserSession();
				Hashtable parameters = new Hashtable();
				parameters.Add("name", _name);
				parameters.Add("email",_email);
				parameters.Add("fbUid",AccessToken.CurrentAccessToken.UserId);
				parameters.Add("fbPicUrl",_picUrl);
				parameters.Add("accessToken",AccessToken.CurrentAccessToken.TokenString);
				userSession.HandleFbLogin(parameters);
			});
		});


	}

	public void HandleInitialized() {
		if (FB.IsLoggedIn) {
			OnLogin (null);
		} else {
			var permissions = new List<string>(){"public_profile", "email", "user_friends"};
			FB.LogInWithReadPermissions (permissions, OnLogin);
		}
	}

	public void DoLogin() {

		if (FB.IsInitialized) {
			HandleInitialized();
			return;
		}

		FB.Init(InitCallback, OnHideUnity);
	}

	private void InitCallback ()
	{
		if (FB.IsInitialized) {
			_initialized = true;
			HandleInitialized ();
		} else {
			Debug.Log("Failed to Initialize the Facebook SDK");
		}
	}

	private void OnHideUnity (bool isGameShown)
	{
		if (!isGameShown) {
			// Pause the game - we will need to hide
			Time.timeScale = 0;
		} else {
			// Resume the game - we're getting focus again
			Time.timeScale = 1;
		}
	}

	// Use this for initialization
	void Start () {
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
