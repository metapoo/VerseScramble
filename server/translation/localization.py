from verserain.translation.models import *

class TranslationManager:
    translations = {}
    current_language = None

    @classmethod
    def set_current_language(cls, language_code):
        cls.current_language = language_code

    @classmethod
    def load_translation(cls, language, force=False):
        translations = cls.translations
        if translations.has_key(language) and not force:
            return translations[language]
        translations[language] = {}
        transdict = translations[language]
        trans = list(Translation.collection.find({"language":language}))

        for tran in trans:
            msgid = tran.msgid()
            msgstr = tran.msgstr()

            if msgid and msgstr:
                transdict[msgid.lower()]=msgstr

        translations[language] = transdict
        return transdict
    
    @classmethod
    def get_localized_string(cls, str, language):
        transdict = cls.load_translation(language)
        return transdict.get(str.lower(),str)

    @classmethod
    def gt(cls, str):
        return cls.get_localized_string(str, cls.current_language)

def gt(str):
    return TranslationManager.gt(str)
