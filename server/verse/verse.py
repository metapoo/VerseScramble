from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.language import LANGUAGES as languages
from verserain.verse.models import *
from bson.objectid import ObjectId

def get_handlers():
    return ((r"/verseset/create", CreateVerseSetHandler),
            (r"/verseset/show/([^/]+)", ShowVerseSetHandler),
            (r"/verse/create",CreateVerseHandler),
            )

class CreateVerseHandler(BaseHandler):
    def post(self):
        user = self.current_user
        reference = self.get_argument("reference")
        version = self.get_argument("version")
        text = self.get_argument("text")
        verseset_id = self.get_argument("verseset_id")
        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        if verseset is None:
            return self.write("Invalid verse set: %s" % verseset_id)
        verse = Verse({'reference':reference,
                       'version':version,
                       'text':text,
                       'verseset_id':verseset_id,
                   })
        verse.save()
        verseset.update_verse_count()
        self.redirect("/verseset/show/%s" % str(verseset_id))
        
class ShowVerseSetHandler(BaseHandler):
    def get(self, verseset_id):
        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        verses = list(verseset.verses())
        verseset.update_verse_count(len(verses))
        user = self.current_user
        return self.render("verseset/show.html", verseset=verseset,
                           user=user, verses=verses)


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
        self.redirect("/")

    @require_login
    def get(self):
        user = self.current_user
        return self.render("verseset/create.html", user=user,
                           languages=languages)


