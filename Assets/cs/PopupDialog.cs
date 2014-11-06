using UnityEngine;
using System;
using UnityEngine.UI;
using UnityEngine.Events;


public class PopupDialog:MonoBehaviour{
	
	public Button okayButton;
	public string title;
	public string description;
	public Text titleText;
	public Text descriptionText;
	public Action OnClose = delegate() {};
	
	public void HandleOkayButtonClick() {
		OnClose();
		Destroy(this.gameObject);
	}
	
	public void SetParent(RectTransform prt) {
		RectTransform rt = GetComponent<RectTransform>();
		Vector2 oldPosition = rt.anchoredPosition;
		Vector3 oldScale = rt.localScale;
		
		rt.SetParent(prt);
		
		rt.anchoredPosition = oldPosition;
		rt.localScale = oldScale;	
	}
	
	public void SetTitle(string _title) {
		titleText.text = _title;
		title = _title;
	}
	
	public void SetDescription(string _description) {
		descriptionText.text = _description;
		description = _description;
	}
	
	public void SetHeight(float height) {
		RectTransform rt = GetComponent<RectTransform>();
		var tmp_cs1 = rt.sizeDelta;
        tmp_cs1.y = height;
        rt.sizeDelta = tmp_cs1;
	}
	
	public void CenterOnScreen() {
		RectTransform rt = GetComponent<RectTransform>();
		var tmp_cs2 = rt.anchorMax;
        tmp_cs2.y = 0.5f;
        rt.anchorMax = tmp_cs2;
		var tmp_cs3 = rt.anchorMin;
        tmp_cs3.y = 0.5f;
        rt.anchorMin = tmp_cs3;
	}
	
	public void Start() {
		okayButton.onClick.AddListener((UnityAction)HandleOkayButtonClick);
		CenterOnScreen();
	}
	
	public void Update() {
	
	}
}