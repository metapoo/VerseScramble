from verserain.base.handler import BaseHandler
from verserain.translation.models import *
from verserain.login.auth import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/translation/save/?", SaveTranslationHandler),
            (r"/translation/([^/]+)/?", ShowTranslationHandler),
            (r"/translation/?", ShowTranslationHandler),
    )

class SaveTranslationHandler(BaseHandler):
    def get(self):
        if self.current_user is None:
            return self.write("Please login.")

        language = self.get_argument("language")
        msgid = self.get_argument("msgid")
        msgstr = self.get_argument("msgstr").strip()
        
        if msgstr == "":
            return self.write("Can't save empty string")

        tran = Translation.collection.find_one({"language":language,"msgid":msgid})
        if tran is None:
            tran = Translation({"language":language,"msgid":msgid})

        if tran.has_key("msgstr") and (tran.get("msgstr",None) != msgstr):
            i = 1
            while tran.has_key("msgstr%s" % i):
                i += 1
            # backup old message str
            tran["msgstr%s" % i] = tran["msgstr"]
        elif tran.has_key("msgstr") and tran["msgstr"] == msgstr:
            self.write("")
            return

        tran["msgstr"] = msgstr
        tran["user_id"] = self.current_user._id
        tran.save()

        return self.write("Saved.")


class ShowTranslationHandler(BaseHandler):
    @require_login
    def get(self, language="en"):

        msgids  = [x['msgid'] for x in list(Translation.collection.find({"language":"en"}))]
        
        trans = []

        for msgid in msgids:
            tran = Translation.collection.find_one({"language":language, "msgid": msgid})
            if tran is None:
                tran = Translation({"language":language,"msgid":msgid,"msgstr":""})
            trans.append(tran)

        self.render("translation/index.html",language_code=language, trans=trans)
