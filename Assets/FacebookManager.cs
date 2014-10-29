using UnityEngine;
using System;
using System.Collections.Generic;
using System.Collections;
using Facebook;
using Facebook.MiniJSON;

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

	public void OnLogin(FBResult response) {
		FB.API("/me/picture?redirect=false", HttpMethod.GET, delegate (FBResult picResponse) {
			if (picResponse.Error == null) {
				var picResult = (Dictionary<string,object>)Json.Deserialize(picResponse.Text);
				var picData = (Dictionary<string,object>)picResult["data"];
				_picUrl = (string) picData["url"];
			}
			FB.API ("/me", HttpMethod.GET, delegate(FBResult meResponse) {
				if (meResponse.Error == null) {
					var meResult = (Dictionary<string,object>)Json.Deserialize(meResponse.Text);
					
					if (meResult.ContainsKey("name")) {
						_name = (string) meResult["name"];
					}
					if (meResult.ContainsKey("email")) {
						_email = (string) meResult["email"];
					}
				}

				var userSession = GameObject.Find("UserSession");
				var parameters = new Hashtable();
				parameters.Add("name", _name);
				parameters.Add("email",_email);
				parameters.Add("fbUid",FB.UserId);
				parameters.Add("fbPicUrl",_picUrl);
				parameters.Add("accessToken",FB.AccessToken);
				userSession.SendMessage("HandleFbLogin", parameters);
			});
		});


	}

	public void DoLogin() {
		FB.Init(onInitComplete:delegate {
			_initialized = true;
			if (FB.IsLoggedIn) {
				OnLogin (null);
			} else {
				FB.Login ("offline_access, email", OnLogin);
			}
		}
		);
	}

	// Use this for initialization
	void Start () {
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
