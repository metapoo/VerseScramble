from verserain.base.handler import BaseHandler
from verserain.translation.models import *
from verserain.login.auth import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/translation/save/?", SaveTranslationHandler),
            (r"/translation/([^/]+)/?", ShowTranslationHandler),
            (r"/translation/remove/([^/]+)/?", RemoveTranslationHandler),
            (r"/translations/show/?", ShowTranslationsHandler),
            (r"/translation/?", ShowTranslationHandler),
    )

class ShowTranslationsHandler(BaseHandler):
    def get(self):
        uri = self.get_argument("uri","/")
        language_uri = self.language_uri(uri)
        self.load_all_translations()
        self.render("_languages.html", language_uri=language_uri)

class RemoveTranslationHandler(BaseHandler):
    def get(self, tran_id=None):
        if self.current_user is None:
            return self.write("Please login.")
        if not self.current_user.is_admin():
            return self.write("Must be admin to remove.")
        tran = Translation.by_id(tran_id)
        if tran:
            tran.remove()
            self.write("translation removed")
        else:
            self.write("translation already removed")

class SaveTranslationHandler(BaseHandler):
    def get(self):
        if self.current_user is None:
            return self.write("Please login.")

        language = self.get_argument("language")
        msgid = self.get_argument("msgid")
        lower_msgid = msgid.lower()
        msgstr = self.get_argument("msgstr").strip()
        
        if msgstr == "":
            return self.write("Can't save empty string")

        tran = Translation.collection.find_one({"language":language, "lower_msgid":lower_msgid})

        if tran:
            if msgstr == tran.msgstr():
                return self.write("No changes.")

        if language == "en":
            if not self.current_user.is_admin():
                return self.write("Only admin can change english")

        if not self.current_user.email_verified():
            return self.write("Verify your email first")

        tran = Translation.translate(language, msgid, msgstr, username=self.current_user['username'])

        if language == "en":
            tran["msgid"] = tran["msgstr"]
            tran.save()
            msgid = tran["msgid"]
            lower_msgid = msgid.lower()

            other_trans = Translation.collection.find({"lower_msgid":lower_msgid})
            for tran in other_trans:
                tran["msgid"] = msgid
                tran.save()

        self.load_translation(language)
        self.translations[language][msgid.lower()] = msgstr

        return self.render("translation/history.html", tran=tran)


class ShowTranslationHandler(BaseHandler):
    @require_login
    def get(self, language=None):
        if language is None:
            language = self.get_cookie("language_code","en")
        if language.lower() == "all":
            language = "en"

        msgids  = [x['msgid'] for x in list(Translation.collection.find({"language":"en"}).sort("_id",pymongo.DESCENDING))]
        
        trans = []
        trans_by_msgid = {}

        
        for msgid in msgids:
            lower_msgid = msgid.lower()
            tran = Translation.collection.find_one({"language":language, "lower_msgid": lower_msgid, "msgid":msgid})
            if tran is None:
                tran = Translation({"language":language,"msgid":msgid,"msgstr":"","lower_msgid":lower_msgid})
            trans_by_msgid[lower_msgid] = tran
            trans.append(tran)

        trans_for_lang = list(Translation.collection.find({"language":language}).sort("_id",pymongo.DESCENDING))
        for tran in trans_for_lang:
            lower_msgid = tran['lower_msgid']
            if not trans_by_msgid.has_key(msgid):
                trans_by_msgid[lower_msgid] = tran

        self.render("translation/index.html",language_code=language, trans=trans)
