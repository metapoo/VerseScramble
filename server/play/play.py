from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *
from verserain.utils.encoding import *
from verserain.utils.paging import *
from verserain import settings
from bson.objectid import ObjectId
import pymongo 

def get_handlers():
    return ((r"/verse/play/([^/]+)/?", PlayVerseHandler),
            (r"/verseset/play/([^/]+)/?", PlayVerseSetHandler),
            (r"/play/?", PlayHandler),
            )

class PlayHandler(BaseHandler):
    def get(self):
        language = self.language_code(not_all=True)
        if self.isIOS():
            verseset = list(VerseSet.collection.find(\
                                                     {"language":language, "play_count":{"$gt":10}, "verse_count":{"$gt":1}}).sort("_id",pymongo.DESCENDING)[0:1])
            
            if len(verseset) > 0:
                verseset = verseset[0]
            else:
                verseset = None

            if verseset is None:
                verseset = VerseSet.collection.find_one({"language":"en"})

            self.redirect("/verseset/play/%s" % str(verseset._id))
            return
        elif self.isAndroid():
            # just open up the game without directing it anywhere
            template_name = "device_player.html"
            session_key = None
            if self.current_user:
                session_key = self.current_user.session_key()
            device_url="verserain://com.hopeofglory.verserain/None/None/%s/%s" % \
                (settings.SITE_DOMAIN, session_key)
            self.render(template_name,verse_id=None, verseset_id=None,device_url=device_url,
                        selected_nav="play")
            return

        device_url = None

        self.render("webplayer.html", device_url=device_url, selected_nav="play")

class PlayVerseHandler(BaseHandler):
    def get(self, verse_id):
        try:
            verse = Verse.by_id(verse_id)
        except:
            verse = None

        session_key = None
        if self.current_user:
            session_key = self.current_user.session_key()

        if verse:
            device_url = verse.device_url(session_key=session_key)
        else:
            self.redirect("/play")
            return

        template_name = "webplayer.html"

        if self.isIOS() or self.isAndroid():
            template_name = "device_player.html"

        self.render("webplayer.html",verse_id=verse_id, verseset_id=None,device_url=device_url,
                    selected_nav="play")

class PlayVerseSetHandler(BaseHandler):
    def get(self, verseset_id):
        try:
            vs = VerseSet.by_id(verseset_id)
        except:
            vs = None

        session_key = None
        if self.current_user:
            session_key = self.current_user.session_key()

        if vs:
            device_url = vs.device_url(session_key=session_key)
        else:
            return self.redirect("/play")

        template_name = "webplayer.html"

        if self.isIOS() or self.isAndroid():
            template_name = "device_player.html"

        self.render(template_name,verse_id=None, verseset_id=verseset_id,device_url=device_url,
                    selected_nav="play")

