using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

public class LanguageScrollView:MonoBehaviour{
	public RectTransform scrollContent;
	public static Hashtable languageByCode = new Hashtable();
	public static List<string> languageCodes;
	public int languageIndex = 0;
	public  LanguageButton languageButton;
	
	public void AddLanguage(string languageCode,string languageDesc) {
		LanguageButton clone = (LanguageButton)Instantiate(languageButton, Vector3.zero, Quaternion.identity);
		clone.SetCodeAndLanguage(languageCode, languageDesc);
		clone.SetParent(scrollContent);
		float height = clone.GetComponent<RectTransform>().sizeDelta.y;
		var tmp_cs1 = clone.GetComponent<RectTransform>().anchoredPosition;
		tmp_cs1.y = -1*languageIndex*height;
		clone.GetComponent<RectTransform>().anchoredPosition = tmp_cs1;
		var tmp_cs2 = scrollContent.sizeDelta;
		tmp_cs2.y = height*(languageIndex + 1);
		scrollContent.sizeDelta = tmp_cs2;
		languageIndex += 1;
	}


	public void Awake() {
		if (languageByCode.Count > 0) return;
		languageByCode.Add("ga","Gaeilge");
		languageByCode.Add("la","Latina");
		languageByCode.Add("hil","Ilonggo");
		languageByCode.Add("tr","Türkçe");
		languageByCode.Add("ngu","Náhuatl de Guerrero");
		languageByCode.Add("tl","Filipino");
		languageByCode.Add("th","ภาษาไทย");
		languageByCode.Add("te","తెలుగు");
		languageByCode.Add("jac","Jacalteco, Oriental");
		languageByCode.Add("ta","தமிழ்");
		languageByCode.Add("ceb","Cebuano");
		languageByCode.Add("yo","Yorùbá");
		languageByCode.Add("de","Deutsch");
		languageByCode.Add("da","Dansk");
		languageByCode.Add("amu","Amuzgo de Guerrero");
		languageByCode.Add("qu","Quichua");
		languageByCode.Add("zh-hans","简体中文");
		languageByCode.Add("zh-hant","繁體中文");
		languageByCode.Add("eo","Esperanto");
		languageByCode.Add("en","English");
		languageByCode.Add("zu","isiZulu");
		languageByCode.Add("es","Español (Latinoamérica)");
		languageByCode.Add("ru","Русский");
		languageByCode.Add("ro","Română");
		languageByCode.Add("bg","Български");
		languageByCode.Add("kek","Kekchi");
		languageByCode.Add("qut","Quiché, Centro Occidenta");
		languageByCode.Add("bn","বাংলা");
		languageByCode.Add("ja","日本語");
		languageByCode.Add("ms","bahasa Melayu");
		languageByCode.Add("pt-PT","Português (Portugal)");
		languageByCode.Add("mvc","Mam, Central");
		languageByCode.Add("mvj","Mam, Todos Santos");
		languageByCode.Add("or","ଓଡ଼ିଆ");
		languageByCode.Add("xh","isiXhosa");
		languageByCode.Add("ca","Català");
		languageByCode.Add("ppl","Nawat");
		languageByCode.Add("cy","Cymraeg");
		languageByCode.Add("cs","Čeština");
		languageByCode.Add("pt","Português (Brasil)");
		languageByCode.Add("twi","Twi");
		languageByCode.Add("chr","ᏣᎳᎩ ᎦᏬᏂᎯᏍ");
		languageByCode.Add("pa","ਪੰਜਾਬੀ");
		languageByCode.Add("usp","Uspanteco");
		languageByCode.Add("pl","Polski");
		languageByCode.Add("hr","Hrvatski");
		languageByCode.Add("ht","Kreyòl ayisyen");
		languageByCode.Add("hu","Magyar");
		languageByCode.Add("hi","हिन्दी");
		languageByCode.Add("he","עברית");
		languageByCode.Add("mg","fiteny malagasy");
		languageByCode.Add("mn","Монгол");
		languageByCode.Add("mi","Māori");
		languageByCode.Add("mk","Македонски");
		languageByCode.Add("ur","اردو");
		languageByCode.Add("uk","Українська");
		languageByCode.Add("mr","मराठी");
		languageByCode.Add("af","Afrikaans");
		languageByCode.Add("vi","Tiếng Việt");
		languageByCode.Add("is","Íslenska");
		languageByCode.Add("it","Italiano");
		languageByCode.Add("ar","العربية");
		languageByCode.Add("es-ES","Español (España)");
		languageByCode.Add("id","Indonesia");
		languageByCode.Add("nl","Nederlands");
		languageByCode.Add("no","Norsk");
		languageByCode.Add("ne","नेपाली");
		languageByCode.Add("grc","Κοινη");
		languageByCode.Add("so","Somali");
		languageByCode.Add("fr","Français");
		languageByCode.Add("hwc","Hawai‘i Pidgin");
		languageByCode.Add("cco","Chinanteco de Comaltepec");
		languageByCode.Add("fi","Suomi");
		languageByCode.Add("nds","Plautdietsch");
		languageByCode.Add("awa","अवधी");
		languageByCode.Add("sr","Српски");
		languageByCode.Add("sq","Shqip");
		languageByCode.Add("ko","한국어");
		languageByCode.Add("sv","Svenska");
		languageByCode.Add("st","Sesotho");
		languageByCode.Add("sk","Slovenčina");
		languageByCode.Add("ckw","Cakchiquel Occidental");
		languageByCode.Add("kw","Kernewek");
		languageByCode.Add("sn","chiShona");
		languageByCode.Add("ky","Кыргызча, Кыргыз тили");
		languageByCode.Add("sw","Kiswahili");
		languageCodes = new List<string>(new string[]{"en", "zh-hant", "zh-hans", "ko", "ja", "es", "fr", "de", "it", "es-ES", "ru", "vi", "mn", "te", "mg", "ms", "af", "amu", "ckw", "ca", "ceb", "cco", "cy", "da", "eo", "tl", "ga", "hwc", "hr", "hil", "id", "jac", "kek", "kw", "sw", "ht", "la", "hu", "mvc", "mvj", "mi", "ppl", "nl", "no", "ngu", "nds", "pl", "pt", "pt-PT", "qu", "qut", "ro", "st", "sq", "sk", "so", "fi", "sv", "twi", "tr", "usp", "yo", "sn", "xh", "zu", "is", "cs", "grc", "bg", "ky", "mk", "sr", "uk", "he", "ur", "ar", "awa", "ne", "mr", "hi", "bn", "pa", "or", "ta", "th", "chr"});
	}

	public void Start() {
		for(int i=0;i<languageCodes.Count;i++) {
			string code = languageCodes[i];
			object lang = languageByCode[code];
			AddLanguage(code, "" + lang);
		}
	}
	public void Update() {
	}
	
}