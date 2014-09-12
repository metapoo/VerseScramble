#pragma strict

import TextManager;

public var customSkin : GUISkin;
public var disabledStyle : GUIStyle;
public var showError : boolean = false;
public var sndSelect : AudioClip;
public var background : Transform;
public var mainCam : Camera;
public var titleLabel : GUIText;
public var selectLanguageLabel : GUIText;
public var sceneSetup : SceneSetup;

private	var selectedDifficulty : Difficulty;

public var countrys = ["None", "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegowina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao, People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia (Slovak Republic)", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"];
private var showList = false;
private var listEntry = 0;
private var list : GUIContent[];
private var listStyle : GUIStyle;
private var picked = false;
public var i: int;



function OnGUI() {
	var style : GUIStyle = customSkin.button;
	var enabled : boolean = true;
	var h = Screen.height;
	var w = Screen.width;
	
	style.font = sceneSetup.GetCurrentFont();
	style.fontSize = 0.02*w;
	
	customSkin.box.font = style.font;
	customSkin.box.fontSize = style.fontSize;
	
	GUI.skin = customSkin;
	var buttonSize = new Vector2(0.1601*w,0.078125*h);
	
	var selected:boolean = false;
	var dH = h*0.7;
	
	// language buttons
	selected = false;
	style = customSkin.button;
	
	if (GUI.Button(Rect(w*0.25-buttonSize.x*0.5,h*0.55,buttonSize.x,buttonSize.y),"English", style)) {
		VerseManager.SetLanguage("en");
		selected = true;
	}

	if (GUI.Button(Rect(w*0.5-buttonSize.x*0.5,h*0.55,buttonSize.x,buttonSize.y),"中文", style)) {
		VerseManager.SetLanguage("zh-hant");
		selected = true;
	}

	if (GUI.Button(Rect(w*0.75-buttonSize.x*0.5,h*0.55,buttonSize.x,buttonSize.y),"한국어", style)) {
		VerseManager.SetLanguage("ko");
		selected = true;
	}
	
	if (GUI.Button(Rect(w*0.25-buttonSize.x*0.5,h*0.75,buttonSize.x,buttonSize.y),"Монгол", style)) {
		VerseManager.SetLanguage("mn");
		selected = true;
	}
	
	if (GUI.Button(Rect(w*0.5-buttonSize.x*0.5,h*0.75,buttonSize.x,buttonSize.y),"Русский", style)) {
		VerseManager.SetLanguage("ru");
		selected = true;
	}
	
	if (selected) {
		audio.PlayOneShot(sndSelect);
		
		Application.LoadLevel("verselist");
	}
	
		
	if (Popup.List (Rect(w*0.75-buttonSize.x*0.5, h*0.75, 180, 20), showList, listEntry, GUIContent("Choose your country!"), list, listStyle)) {
		picked = true;
	}
	//if (picked) {
	//	GUI.Label (Rect(50, 70, 400, 20), "You picked " + list[listEntry].text + "!");
	//}	
		
	titleLabel.fontSize = 0.07*w;
	selectLanguageLabel.fontSize = 0.035*w;

}

function CheckOption() {
	
	var us : UserSession = UserSession.GetUserSession();
	
	if (us) {
		var verseId = us.VerseId();
		var versesetId = us.VerseSetId();
		if (verseId || versesetId) {
			Application.LoadLevel("scramble");
			return true;
		}
	}
	return false;
}

function Start () {

    list = new GUIContent[countrys.length];
    
	 for(i=0; i<countrys.length; i++)
	 {
	    list[i] = new GUIContent(countrys[i]);
	 
	 }
	
     // Make a GUIStyle that has a solid white hover/onHover background to indicate highlighted items
	listStyle = new GUIStyle();
	listStyle.normal.textColor = Color.white;
	var tex = new Texture2D(2, 2);
	var colors = new Color[4];
	for (color in colors) color = Color.white;
	tex.SetPixels(colors);
	tex.Apply();
	listStyle.hover.background = tex;
	listStyle.onHover.background = tex;
	listStyle.padding.left = listStyle.padding.right = listStyle.padding.top = listStyle.padding.bottom = 4;
	
	
	Application.targetFrameRate = 60;
	TextManager.LoadLanguage(VerseManager.GetLanguage());
	
	var gt = TextManager.GetText;
	
	titleLabel.guiText.text = gt("Verse Rain");
	
	selectLanguageLabel.guiText.text = gt("Select Language");
	
	while (1) {
		if (CheckOption()) return;
		yield WaitForSeconds(0.1f);
	}
}

function Update () {

}