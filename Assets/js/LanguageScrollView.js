var scrollContent : RectTransform;
var languageByCode : Hashtable;
var languageCodes : Array;
var languageIndex : int = 0;
var languageButton : LanguageButton;

function AddLanguage(languageCode : String, languageDesc : String) {
	var clone : LanguageButton = Instantiate(languageButton, Vector3.zero, Quaternion.identity);
	clone.SetCodeAndLanguage(languageCode, languageDesc);
	clone.SetParent(scrollContent);
	var height = clone.GetComponent(RectTransform).sizeDelta.y;
	clone.GetComponent(RectTransform).anchoredPosition.y = -1*languageIndex*height;
	scrollContent.sizeDelta.y = height*(languageIndex + 1);
	languageIndex += 1;
}

function Awake() {
	languageByCode = new Hashtable({ 'eo':'Esperanto',
'en':'English',
'af':'Afrikaans',
'vi':'Tiếng Việt',
'ca':'Català',
'it':'Italiano',
'ppl':'Nawat',
'cy':'Cymraeg',
'ar':'العربية',
'ur':'اردو',
'ga':'Gaeilge',
'cs':'Čeština',
'zu':'isiZulu',
'xh':'isiXhosa',
'st':'Sesotho',
'es-ES':'Español (España)',
'id':'Bahasa Indonesia',
'es':'Español (Latinoamérica)',
'qut':'Quiché, Centro Occidenta',
'ru':'Русский',
'or':'ଓଡ଼ିଆ',
'nl':'Nederlands',
'pt':'Português (Brasil)',
'la':'Latina',
'ko':'한국어',
'amu':'Amuzgo de Guerrero',
'twi':'Twi',
'tr':'Türkçe',
'chr':'ᏣᎳᎩ ᎦᏬᏂᎯᏍ',
'uk':'Українська',
'ngu':'Náhuatl de Guerrero',
'tl':'Filipino',
'pa':'ਪੰਜਾਬੀ',
'grc':'Κοινη',
'th':'ภาษาไทย',
'usp':'Uspanteco',
'kw':'Kernewek',
'ro':'Română',
'jac':'Jacalteco, Oriental',
'pl':'Polski',
'ta':'தமிழ்',
'ckw':'Cakchiquel Occidental',
'fr':'Français',
'bg':'Български',
'kek':'Kekchi',
'ceb':'Cebuano',
'yo':'Yorùbá',
'hr':'Hrvatski',
'bn':'বাংলা',
'de':'Deutsch',
'hwc':'Hawai‘i Pidgin',
'ht':'Kreyòl ayisyen',
'da':'Dansk',
'ky':'Кыргызча, Кыргыз тили',
'hi':'हिन्दी',
'no':'Norsk',
'mvj':'Mam, Todos Santos',
'awa':'अवधी',
'fi':'Suomi',
'hu':'Magyar',
'hil':'Ilonggo',
'ja':'日本語',
'is':'Íslenska',
'he':'עברית',
'qu':'Quichua',
'ne':'नेपाली',
'zh-hans':'简体中文',
'sr':'Српски',
'sq':'Shqip',
'mn':'Монгол',
'mi':'Māori',
'sv':'Svenska',
'mk':'Македонски',
'zh-hant':'繁體中文',
'sk':'Slovenčina',
'pt-PT':'Português (Portugal)',
'cco':'Chinanteco de Comaltepec',
'mvc':'Mam, Central',
'so':'Somali',
'sn':'chiShona',
'ms':'Bahasa Melayu',
'mr':'मराठी',
'nds':'Plautdietsch',
'sw':'Kiswahili'
});
	
	languageCodes = new Array(['en', 'zh-hant', 'zh-hans','ko','ja','ru','mn', 'af', 'amu', 'id', 'ms', 'ckw', 'ca', 'ceb', 'cco', 'cy', 'da', 'de', 'es-ES', 'es', 'eo', 'tl', 'fr', 'ga', 'hwc', 'hr', 'hil', 'it', 'jac', 'kek', 'kw', 'sw', 'ht', 'la', 'hu', 'mvc', 'mvj', 'mi', 'ppl', 'nl', 'no', 'ngu', 'nds', 'pl', 'pt', 'pt-PT', 'qu', 'qut', 'ro', 'st', 'sq', 'sk', 'so', 'fi', 'sv', 'vi', 'twi', 'tr', 'usp', 'yo', 'sn', 'xh', 'zu', 'is', 'cs', 'grc', 'bg', 'ky', 'mk', 'sr', 'uk', 'he', 'ur', 'ar', 'awa', 'ne', 'mr', 'hi', 'bn', 'pa', 'or', 'ta', 'th', 'chr']);
	for (var i=0;i<languageCodes.length;i++) {
		var code = languageCodes[i];
		var lang = languageByCode[code];
		AddLanguage(code, lang);
	}
}

function Update() {
}
