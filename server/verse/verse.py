from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.language import LANGUAGES as languages
from verserain.verse.models import *

def get_handlers():
    return ((r"/verseset/create", CreateVerseSetHandler),
            )

class CreateVerseSetHandler(BaseHandler):

    @require_login
    def post(self):
        user = self.current_user
        name = self.get_argument("name",None)
        language = self.get_argument("language",None)
        vs = VerseSet({'name':name,
                       'language':language,
                       'user_id':user._id})
        vs.save()
        self.redirect("/verseset/list")

    @require_login
    def get(self):
        user = self.current_user
        return self.render("verseset/create.html", user=user,
                           languages=languages)


