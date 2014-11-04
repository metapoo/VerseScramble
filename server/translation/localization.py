from verserain.translation.models import *

class TranslationManager:
    translations = {}
    current_language = None
    translation_string_count = 1.0

    @classmethod
    def set_current_language(cls, language_code):
        cls.current_language = language_code

    @classmethod
    def percent_translated(cls):
        return len(cls.translations[cls.current_language]) * 1.0 / (cls.translation_string_count * 1.0)

    @classmethod
    def load_all_translations(cls):
        from verserain.verse.language import LANGUAGE_CODES
        for code in LANGUAGE_CODES:
            cls.load_translation(code)

    @classmethod
    def load_translation(cls, language, force=False):
        
        translations = cls.translations
        if translations.has_key(language) and not force:
            return translations[language]

        load_all = not cls.translations.has_key('en')

        if not translations.has_key('en') and (language != 'en'):
            cls.load_translation('en')
    
        if load_all and (language != 'en'):
            cls.load_all_translations()
            
        translations[language] = {}
        transdict = translations[language]
        trans = list(Translation.collection.find({"language":language}))

        if language != 'en':
            eng_transdict = translations['en']
        else:
            eng_transdict = None

        for tran in trans:
            msgid = tran.msgid()
            msgstr = tran.msgstr()

            if eng_transdict and (not eng_transdict.has_key(msgid.lower())):
                continue

            if msgid and msgstr:
                transdict[msgid.lower()]=msgstr

        
        translations[language] = transdict

        if cls.translation_string_count <= 1.0:
            cls.translation_string_count = len(translations['en'])

        return transdict
    
    @classmethod
    def get_localized_string(cls, str, language):
        transdict = cls.load_translation(language)
        return transdict.get(str.lower(),str)

    @classmethod
    def gt(cls, str, arg=None, language=None):
        if language is None:
            language = cls.current_language
        str = cls.get_localized_string(str, language)
        if "{0}" in str:
            str = str.replace("{0}","%s")
        if arg is None:
            return str

        try:
            str = str % arg
        except:
            return str

        return str

def gt(str, arg=None, language=None):
    text = TranslationManager.gt(str, arg=arg, language=language)
    return text
