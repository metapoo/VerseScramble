using UnityEngine;
using System;


public class DialogManager:MonoBehaviour{
	
	public PopupDialog popupDialog;
	public OptionDialog optionDialog;
	
	public static DialogManager GetInstance() {
		GameObject go = GameObject.Find("DialogManager");
		DialogManager instance = null;
		if (go == null) {
			go = new GameObject("DialogManager");
	    	instance = go.AddComponent<DialogManager>();
		} else {
		 	instance = go.GetComponent<DialogManager>();
		}
		return instance;
	}
	
	public static PopupDialog CreatePopupDialog(string title,string description) {
		return GetInstance()._CreatePopupDialog(title, description);
	}
	
	public static OptionDialog CreateOptionDialog(string title,string description) {
		return GetInstance()._CreateOptionDialog(title, description);
	}
	
	public RectTransform GetParent() {
		GameObject canvas = GameObject.Find("Canvas");
		return canvas.GetComponent<RectTransform>();
	}
	
	public OptionDialog _CreateOptionDialog(string title,string description) {
		OptionDialog clone = (OptionDialog)Instantiate(optionDialog, Vector3.zero, Quaternion.identity);
		clone.SetParent(GetParent());	
		clone.SetTitle(title);
		clone.SetDescription(description);
		return clone;
	}
	
	public PopupDialog _CreatePopupDialog(string title,string description) {
		PopupDialog clone = (PopupDialog)Instantiate(popupDialog, Vector3.zero, Quaternion.identity);
		clone.SetParent(GetParent());	
		clone.SetTitle(title);
		clone.SetDescription(description);
		return clone;
	}
	
	public void Start() {
		
	}
	
	public void Update() {
	
	}
}
