from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.language import *
from verserain.verse.models import *
from bson.objectid import ObjectId

def get_handlers():
    return ((r"/verseset/create", CreateVerseSetHandler),
            (r"/verseset/show/([^/]+)/?", ShowVerseSetHandler),
            (r"/verseset/edit/([^/]+)/?", UpdateVerseSetHandler),
            (r"/verseset/remove/([^/]+)/?", RemoveVerseSetHandler),
            (r"/verseset/update", UpdateVerseSetHandler),
            (r"/verseset/list", ListVerseSetHandler),
            (r"/verse/create",CreateVerseHandler),
            (r"/verse/edit/([^/]+)/?", UpdateVerseHandler),
            (r"/verse/update", UpdateVerseHandler),
            (r"/verse/remove/([^/]+)/?",RemoveVerseHandler),
            (r"/version/update_selector/?",UpdateVersionSelectorHandler),
            (r"/verse/play/([^/]+)/?", PlayVerseHandler),
            )

class PlayVerseHandler(BaseHandler):
    def get(self, verse_id):
        self.render("webplayer.html",verse_id=verse_id)

class UpdateVersionSelectorHandler(BaseHandler):
    def get(self):
        version = self.get_argument("version")
        language = self.get_argument("language")
        versions = VERSION_BY_LANGUAGE_CODE[language]
        selected_nav = "my sets"
        context = {"selected_nav":selected_nav}

        self.render("version_select.html",
                    version=version,
                    language=language,
                    versions=versions,
                    selected_nav=selected_nav)

    def post(self):
        return self.get()

class RemoveVerseHandler(BaseHandler):
    def get(self, verse_id):
        verse_id = ObjectId(verse_id)
        user = self.current_user
        verse = Verse.collection.find_one({'_id':verse_id})
        if verse is None:
            self.write("verse not found: %s" % verse_id)
            return
        verseset = verse.verseset()
        if verseset['user_id'] != user._id:
            self.write("not authorized")
            return
        verseset_id = verse['verseset_id']
        verse.remove()
        self.redirect("/verseset/show/%s" % verseset_id)

class UpdateVerseHandler(BaseHandler):
    def get(self, verse_id):
        verse_id = ObjectId(verse_id)
        user = self.current_user
        verse = Verse.collection.find_one({'_id':verse_id})
        if verse is None:
            self.write("verse not found: %s" % verse_id)
            return
        verseset = verse.verseset()
        if verseset['user_id'] != user._id:
            self.write("not authorized")
            return
        verseset_id = verse['verseset_id']
        language = verseset['language']
        versions = VERSION_BY_LANGUAGE_CODE.get(language, [])
        version = verse.get('version')
        selected_nav = "my sets"
        context = {"selected_nav":selected_nav}

        self.render("verse/edit.html", verse=verse, verseset=verseset,
                    user=user, versions=versions, version=version, context=context)
    def post(self):
        verse_id = self.get_argument("verse_id")
        verse_id = ObjectId(verse_id)
        user = self.current_user
        verse = Verse.collection.find_one({'_id':verse_id})
        if verse is None:
            self.write("verse not found: %s" % verse_id)
            return
        verseset = verse.verseset()
        if verseset['user_id'] != user._id:
            self.write("not authorized")
            return
        reference = self.get_argument("reference")
        version = self.get_argument("version")
        text = self.get_argument("text")
        verse.update({"version":version,
                      "text":text,
                      "reference":reference})
        verse.save()
        
        self.redirect("/verseset/show/%s" % str(verseset._id))

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
                       'user_id':user._id
                   })
        verse.save()
        verseset.update_verse_count()
        self.redirect("/verseset/show/%s" % str(verseset_id))
        
class ShowVerseSetHandler(BaseHandler):
    def get(self, verseset_id):
        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        language = verseset['language']
        versions = VERSION_BY_LANGUAGE_CODE.get(language,[])
        version = verseset.get("version","")
        verses = list(verseset.verses())
        verseset.update_verse_count(len(verses))
        user = self.current_user

        if user and (verseset["user_id"] == user._id):
            selected_nav = "my sets"
        else:
            selected_nav = "all sets"
        context = {"selected_nav":selected_nav}

        return self.render("verseset/show.html", verseset=verseset,
                           user=user, verses=verses, version=version, verse=None,
                           versions=versions, context=context)


class UpdateVerseSetHandler(BaseHandler):
    @require_login
    def get(self, verseset_id):
        verseset_id = ObjectId(verseset_id)
        user = self.current_user
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        if verseset is None:
            self.write("verse set not found")
            return
        version = verseset.get("version")
        language = verseset['language']
        versions = VERSION_BY_LANGUAGE_CODE[language]
        selected_nav = "my sets"
        context = {"selected_nav":selected_nav}
        return self.render("verseset/edit.html",
                           user=user, language_codes=LANGUAGE_CODES, language_by_code=LANGUAGE_BY_CODE,
                           verseset=verseset,versions=versions, language=language,
                           version=version, context=context)

    @require_login
    def post(self):
        user = self.current_user
        verseset_id = self.get_argument("verseset_id")
        verseset_id = ObjectId(verseset_id)
        user = self.current_user
        verseset = VerseSet.collection.find_one({'_id':verseset_id,'user_id':user._id})
        name = self.get_argument("name")
        language = self.get_argument("language")
        version = self.get_argument("version")
        verseset.update({"name":name,
                         "language":language,
                         "version":version})
        verseset.save()
        self.redirect("/")

class RemoveVerseSetHandler(BaseHandler):
    @require_login
    def get(self, verseset_id):
        verseset_id = ObjectId(verseset_id)
        user = self.current_user
        verseset = VerseSet.collection.find_one({'_id':verseset_id,'user_id':user._id})
        verseset.remove()
        self.redirect("/")

class CreateVerseSetHandler(BaseHandler):

    @require_login
    def post(self):
        user = self.current_user
        name = self.get_argument("name",None)
        language = self.get_argument("language",None)
        version = self.get_argument("version",None)
        vs = VerseSet({'name':name,
                       'language':language,
                       'user_id':user._id})
        if version:
            vs["version"] = version

        vs.save()
        self.redirect("/")

    @require_login
    def get(self):
        user = self.current_user
        version = "NIV"
        language = 'en'
        versions = VERSION_BY_LANGUAGE_CODE[language]
        selected_nav = "my sets"
        context = {"selected_nav":selected_nav}

        return self.render("verseset/create.html", user=user,
                           language_codes=LANGUAGE_CODES, language_by_code=LANGUAGE_BY_CODE,
                           version=version,verseset=None,language=language,versions=versions,
                           context=context)

class ListVerseSetHandler(BaseHandler):
    @require_login
    def get(self):
        selected_nav = "my sets"
        context = {"selected_nav":selected_nav,
                   "request":self.request,
        }
        user = self.current_user
        versesets = user.versesets()
        return self.render("verseset/list.html", user=user, versesets=versesets, context=context)

