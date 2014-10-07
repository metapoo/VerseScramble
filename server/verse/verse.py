from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *
from verserain.utils.encoding import *
from verserain import settings
from bson.objectid import ObjectId
import pymongo 

def get_handlers():
    return ((r"/verseset/create", CreateVerseSetHandler),
            (r"/verseset/show/([^/]+)/?", ShowVerseSetHandler),
            (r"/verseset/edit/([^/]+)/?", UpdateVerseSetHandler),
            (r"/verseset/remove/([^/]+)/?", RemoveVerseSetHandler),
            (r"/verseset/update", UpdateVerseSetHandler),
            (r"/versesets/([^/]+)/([^/]+)/?", ListVerseSetHandler),
            (r"/versesets/([^/]+)/?", ListVerseSetHandler),
            (r"/versesets/?", ListVerseSetHandler),
            (r"/([^/]+)/versesets/?", ListVerseSetHandler),
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
        verse = Verse.by_id(verse_id)
        if verse:
            vs = verse.verseset()
            vs["play_count"] = vs.play_count() + 1
            vs.save()

        session_key = None
        if self.current_user:
            session_key = self.current_user.session_key()

        device_url = verse.device_url(session_key=session_key)

        if self.isIOS() or self.isAndroid():
            return self.redirect(device_url)

        self.render("webplayer.html",verse_id=verse_id, verseset_id=None,device_url=device_url)

class PlayVerseSetHandler(BaseHandler):
    def get(self, verseset_id):
        vs = VerseSet.by_id(verseset_id)
        if vs:
            vs["play_count"] = vs.play_count() + 1
            vs.save()

        session_key = None
        if self.current_user:
            session_key = self.current_user.session_key()

        device_url = vs.device_url(session_key=session_key)

        if self.isIOS() or self.isAndroid():
            return self.redirect(device_url)
        self.render("webplayer.html",verse_id=None, verseset_id=verseset_id,device_url=device_url)

class UpdateVersionSelectorHandler(BaseHandler):
    def get(self):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE
        version = self.get_argument("version")
        language = self.get_argument("language")
        versions = VERSION_BY_LANGUAGE_CODE[language]
        selected_nav = "my sets"
        
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
        if ((verseset['user_id'] != user._id) and not user.is_admin()):
            self.write("not authorized")
            return
        verseset_id = verse['verseset_id']
        verse.remove()
        self.redirect(verseset.url())

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

        if ((verseset['user_id'] != user._id) and not user.is_admin()):
            self.write("not authorized")
            return

        verseset_id = verse['verseset_id']
        language = verseset['language']
        versions = VERSION_BY_LANGUAGE_CODE.get(language, [])
        version = verse.get('version')
        selected_nav = "my sets"
        
        self.render("verse/edit.html", verse=verse, verseset=verseset,
                    user=user, versions=versions, version=version, selected_nav=selected_nav)
    def post(self):
        verse_id = self.get_argument("verse_id")
        verse_id = ObjectId(verse_id)
        user = self.current_user
        verse = Verse.collection.find_one({'_id':verse_id})
        if verse is None:
            self.write("verse not found: %s" % verse_id)
            return
        verseset = verse.verseset()
        if (verseset['user_id'] != user._id) and (not user.is_admin()):
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
        
        self.redirect(verseset.url())

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
        self.redirect(verseset.url())
        
class ShowVerseSetHandler(BaseHandler):
    def get(self, verseset_id):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE

        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        language = verseset['language']
        versions = VERSION_BY_LANGUAGE_CODE.get(language,[])
        version = verseset.get("version","")
        verses = list(verseset.sorted_verses())
        verseset.update_verse_count(len(verses))
        user = self.current_user

        if user and (verseset["user_id"] == user._id):
            selected_nav = "my sets"
        else:
            selected_nav = "verse sets"

        from verserain.leaderboard.models import VersesetScore
        limit = 20
        scores = VersesetScore.collection.find({'verseset_id':verseset_id}).sort('score', pymongo.DESCENDING)[0:limit]
        scores = list(scores)

        return self.render("verseset/show.html", verseset=verseset,
                           user=user, verses=verses, version=version, verse=None,
                           versions=versions, selected_nav=selected_nav, scores=scores)


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
        return self.render("verseset/edit.html",
                           user=user, language_codes=LANGUAGE_CODES, language_by_code=LANGUAGE_BY_CODE,
                           verseset=verseset,versions=versions, language=language,
                           version=version, selected_nav=selected_nav)

    @require_login
    def post(self):
        user = self.current_user
        verseset_id = self.get_argument("verseset_id")
        verseset_id = ObjectId(verseset_id)
        user = self.current_user
        verseset = VerseSet.collection.find_one({'_id':verseset_id})

        if ((verseset['user_id'] != user._id) and not user.is_admin()):
            self.write("not authorized")
            return

        name = self.get_argument("name")
        language = self.get_argument("language")
        version = smart_text(self.get_argument("version"))
        commentary = self.get_argument("commentary",None)

        verseset.update({"name":name,
                         "language":language,
                         "version":version})

        if commentary is not None:
            verseset.set_commentary_text(commentary)

        verseset.save()
        self.redirect(verseset.url())

class RemoveVerseSetHandler(BaseHandler):
    @require_login
    def get(self, verseset_id):
        verseset_id = ObjectId(verseset_id)
        user = self.current_user
        verseset = VerseSet.collection.find_one({'_id':verseset_id})

        if ((verseset['user_id'] != user._id) and not user.is_admin()):
            self.write("not authorized")
            return

        verseset.remove()
        self.redirect("/profile/versesets")

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
        
        return self.render("verseset/create.html", user=user,
                           language_codes=LANGUAGE_CODES, language_by_code=LANGUAGE_BY_CODE,
                           version=version,verseset=None,language=language,versions=versions,
                           selected_nav=selected_nav, error_message=error_message)

class ListVerseSetHandler(BaseHandler):
    def get(self, option="popular", language_code=None):
        user = self.current_user
        selected_subnav = option
        versesets = []

        if language_code is None:
            language_code = self.get_cookie("language_code","en")

        args = {"verse_count":{"$gt":0}}

        if user and (option == "profile"):            
            selected_nav = "my sets"
            versesets = user.versesets()
        elif (option in ("new","popular")):
            selected_nav = "verse sets"
            if language_code != "ALL":
                args.update({"language":language_code})

            versesets = VerseSet.collection.find(args)

            if option == "new":
                versesets = versesets.sort("_id",-1)
            elif option == "popular":
                versesets = versesets.sort("hotness",-1)
            
            versesets = list(versesets)
        else:
            selected_nav = "verse sets"
            viewed_user = User.collection.find_one({'username':option})
            if viewed_user:
                versesets = viewed_user.versesets()

        self.set_cookie("language_code", language_code)

        return self.render("verseset/list.html", user=user, versesets=versesets, selected_nav=selected_nav,
                           selected_subnav=option,language_code=language_code
        )

