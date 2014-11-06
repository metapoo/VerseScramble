using UnityEngine;
using System;
using UnityEngine.UI;
using UnityEngine.Events;


public class OptionDialog:MonoBehaviour{
	
	public OptionButton optionButton;
	public string title;
	public string description;
	public Text titleText;
	public Text descriptionText;
	public int numOptions = 0;
	public RectTransform descriptionPanel;
	public int windowPadding = 60;
	public int buttonPadding = 30;
	public Action onClose = delegate() {};
		
	public void HandleOkayButtonClick() {
		CloseDialog();
	}
	
	public void CloseDialog() {
		if (onClose != null) {
			onClose();
		}
		Destroy(this.gameObject);
	}
	
	public void PlaceBottom() {
		RectTransform rt = GetComponent<RectTransform>();
		var tmp_cs1 = rt.anchorMax;
        tmp_cs1.y = 0.05f;
        rt.anchorMax = tmp_cs1;
		var tmp_cs2 = rt.anchorMin;
        tmp_cs2.y = 0.05f;
        rt.anchorMin = tmp_cs2;
		var tmp_cs3 = rt.pivot;
        tmp_cs3.y = 0.0f;
        rt.pivot = tmp_cs3;
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
		if (description == "") {
			var tmp_cs4 = GetComponent<RectTransform>().sizeDelta;
            tmp_cs4.y -= (descriptionPanel.sizeDelta.y + buttonPadding);
            GetComponent<RectTransform>().sizeDelta = tmp_cs4;
			var tmp_cs5 = descriptionPanel.sizeDelta;
            tmp_cs5.y = 0.0f;
            descriptionPanel.sizeDelta = tmp_cs5;
		}
	}
	
	public void AddOption(string label,Action handler) {
		handler = delegate() {};
		numOptions += 1;
		OptionButton optButton = (OptionButton)Instantiate(optionButton, Vector3.zero, Quaternion.identity);
		optButton.SetParent(GetComponent<RectTransform>());
		optButton.SetLabel(label);

		Button button = optButton.GetComponent<Button>();
		button.onClick.AddListener(() => {handler(); } );
		button.onClick.AddListener(() => {CloseDialog(); });
		RectTransform rt = optButton.GetComponent<RectTransform>();
		
		float height = (rt.sizeDelta.y + buttonPadding);
		var tmp_cs6 = rt.anchoredPosition;
        tmp_cs6.y = windowPadding + height * (numOptions - 1);
        rt.anchoredPosition = tmp_cs6;
		var tmp_cs7 = GetComponent<RectTransform>().sizeDelta;
        tmp_cs7.y += height;
        GetComponent<RectTransform>().sizeDelta = tmp_cs7;
	}
	
	public void Start() {
	}
	
	public void Update() {
	
	}
}
