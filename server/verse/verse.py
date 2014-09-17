from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *
from verserain.utils.encoding import *
from bson.objectid import ObjectId

def get_handlers():
    return ((r"/verseset/create", CreateVerseSetHandler),
            (r"/verseset/show/([^/]+)/?", ShowVerseSetHandler),
            (r"/verseset/edit/([^/]+)/?", UpdateVerseSetHandler),
            (r"/verseset/remove/([^/]+)/?", RemoveVerseSetHandler),
            (r"/verseset/update", UpdateVerseSetHandler),
            (r"/verseset/list", ListVerseSetHandler),
            (r"/([^/]+)/verseset/list/?", ListVerseSetHandler),
            (r"/verse/create",CreateVerseHandler),
            (r"/verse/edit/([^/]+)/?", UpdateVerseHandler),
            (r"/verse/update", UpdateVerseHandler),
            (r"/verse/remove/([^/]+)/?",RemoveVerseHandler),
            (r"/version/update_selector/?",UpdateVersionSelectorHandler),
            (r"/verse/play/([^/]+)/?", PlayVerseHandler),
            (r"/verseset/play/([^/]+)/?", PlayVerseSetHandler),

            )

class PlayVerseHandler(BaseHandler):
    def get(self, verse_id):
        self.render("webplayer.html",verse_id=verse_id, verseset_id=None)

class PlayVerseSetHandler(BaseHandler):
    def get(self, verseset_id):
        self.render("webplayer.html",verse_id=None, verseset_id=verseset_id)

class UpdateVersionSelectorHandler(BaseHandler):
    def get(self):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE
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
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE

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

        text = text.replace("\n","")
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
        error_message = None

        if verseset is None:
            error_message = "Invalid verse set: %s" % verseset_id
        if verseset['user_id'] != user._id:
            error_message = "You can't edit a verse set you don't own"

        if error_message:
            self.write(error_message)
            return

        text = text.replace("\n","")

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
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE

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
            selected_nav = "verse sets"
        context = {"selected_nav":selected_nav}

        return self.render("verseset/show.html", verseset=verseset,
                           user=user, verses=verses, version=version, verse=None,
                           versions=versions, context=context)


class UpdateVerseSetHandler(BaseHandler):
    @require_login
    def get(self, verseset_id):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE, LANGUAGE_BY_CODE, LANGUAGE_CODES

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
        version = smart_text(self.get_argument("version"))
        commentary = self.get_argument("commentary",None)

        verseset.update({"name":name,
                         "language":language,
                         "version":version})

        if commentary is not None:
            verseset['commentary'] = commentary

        verseset.save()
        self.redirect(verseset.url())

class RemoveVerseSetHandler(BaseHandler):
    @require_login
    def get(self, verseset_id):
        verseset_id = ObjectId(verseset_id)
        user = self.current_user
        verseset = VerseSet.collection.find_one({'_id':verseset_id,'user_id':user._id})
        verseset.remove()
        self.redirect("/verseset/list")

class CreateVerseSetHandler(BaseHandler):

    @require_login
    def post(self):
        user = self.current_user
        name = self.get_argument("name",None)
        language = self.get_argument("language",None)
        version = self.get_argument("version",None)

        if (not name):
            return self.get(error_message="Verse Set name cannot be blank")

        vs = VerseSet({'name':name,
                       'language':language,
                       'user_id':user._id})
        if version:
            vs["version"] = version

        vs.save()
        self.redirect(vs.url())

    @require_login
    def get(self, error_message=None):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE, LANGUAGE_BY_CODE, LANGUAGE_CODES

        user = self.current_user
        version = "NIV"
        language = 'en'
        versions = VERSION_BY_LANGUAGE_CODE[language]
        selected_nav = "my sets"
        context = {"selected_nav":selected_nav}

        return self.render("verseset/create.html", user=user,
                           language_codes=LANGUAGE_CODES, language_by_code=LANGUAGE_BY_CODE,
                           version=version,verseset=None,language=language,versions=versions,
                           context=context, error_message=error_message)

class ListVerseSetHandler(BaseHandler):
    def get(self, username=None):
        user = self.current_user
        if user and (username == "profile"):            
            selected_nav = "my sets"
            versesets = user.versesets()
        else:
            selected_nav = "verse sets"
            versesets = list(VerseSet.collection.find())

        context = {"selected_nav":selected_nav,
                   "request":self.request,
        }
        return self.render("verseset/list.html", user=user, versesets=versesets, context=context)

