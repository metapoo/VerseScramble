from verserain.base.handler import BaseHandler
from verserain.translation.models import *
from verserain.login.auth import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/translation/save/?", SaveTranslationHandler),
            (r"/translation/([^/]+)/?", ShowTranslationHandler),
            (r"/translation/remove/([^/]+)/?", RemoveTranslationHandler),
            (r"/translation/?", ShowTranslationHandler),
    )

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
        msgstr = self.get_argument("msgstr").strip()
        
        if msgstr == "":
            return self.write("Can't save empty string")

        tran = Translation.collection.find_one({"language":language, "msgid":msgid})

        if tran:
            if msgstr == tran.msgstr():
                return self.write("No changes.")

        if language == "en":
            if not self.current_user.is_admin():
                return self.write("Only admin can change english")

        tran = Translation.translate(language, msgid, msgstr, username=self.current_user['username'])

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

        for msgid in msgids:
            tran = Translation.collection.find_one({"language":language, "msgid": msgid})
            if tran is None:
                tran = Translation({"language":language,"msgid":msgid,"msgstr":""})
            trans.append(tran)

        self.render("translation/index.html",language_code=language, trans=trans)
