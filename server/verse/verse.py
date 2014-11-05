from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *
from verserain.utils.encoding import *
from verserain.utils.paging import *
from verserain import settings
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import pymongo 

def get_handlers():
    return ((r"/verseset/create", CreateVerseSetHandler),
            (r"/verseset/show/(?P<verseset_id>[^/]+)/(?P<time_slice>\d+)/(?P<page>\d+)/?", ShowVerseSetHandler),
            (r"/verseset/show/([^/]+)/?", ShowVerseSetHandler),
            (r"/verseset/edit/([^/]+)/?", UpdateVerseSetHandler),
            (r"/verseset/remove/([^/]+)/?", RemoveVerseSetHandler),
            (r"/verseset/publish/([^/]+)/?", PublishVerseSetHandler),
            (r"/verseset/update", UpdateVerseSetHandler),
            (r"/verseset/add_verse/([^/]+)/?", CreateVerseHandler),
            (r"/versesets/([^/]+)/([^/]+)/(\d+)/?", ListVerseSetHandler),
            (r"/versesets/([^/]+)/([^/]+)/?", ListVerseSetHandler),
            (r"/versesets/([^/]+)/?", ListVerseSetHandler),
            (r"/versesets/?", ListVerseSetHandler),
            (r"/u/([^/]+)/versesets/?", ListVerseSetHandler),
            (r"/u/([^/]+)/versesets/()(\d+)/?", ListVerseSetHandler),
            (r"/verse/create",CreateVerseHandler),
            (r"/verse/edit/([^/]+)/?", UpdateVerseHandler),
            (r"/verse/update", UpdateVerseHandler),
            (r"/verse/remove/([^/]+)/?",RemoveVerseHandler),
            (r"/verse/move(up|down)/([^/]+)/?", MoveVerseHandler),
            (r"/version/update_selector/?",UpdateVersionSelectorHandler),
            (r"/verse/lookup/?",LookupVerseHandler),
            )

class PublishVerseSetHandler(BaseHandler):

    def send_emails(self,verseset):
        from verserain.subscribe.models import Subscription
        subscriptions = Subscription.collection.find({"user_id":verseset.user_id})
        user = verseset.user()
        for sub in subscriptions:
            self.send_email(verseset, user, sub.subscriber())

    def send_email(self, verseset, user, subscriber):
        from verserain.email.models import EmailQueue
        from verserain.translation.localization import gt
        if subscriber.email() is None:
            return
        language = subscriber.language()
        email = subscriber['email']
        subject = "%s - %s" % (verseset['name'], user['username'])
        message = self.get_email_message("publish_verseset", verseset=verseset, gt=gt, settings=settings,
                                         user=user, subscriber=subscriber)
        EmailQueue.queue_mail(settings.ADMIN_EMAIL, email, subject, message)

    @require_login
    def get(self, verseset_id=None):
        user = self.current_user
        vs = VerseSet.by_id(verseset_id)

        if vs is None:
            return self.write("verse set not found")

        if (not user.is_admin()) and (user._id != vs.user_id):
            return self.write("not authorized")

        if (vs.verse_count() < 1):
            return self.write("at least one verse is required before publishing")

        if not vs.is_published():
            vs.publish()
            self.send_emails(vs)

        self.redirect(vs.url())

class LookupVerseHandler(BaseHandler):
    def get(self):
        reference = self.get_argument("reference", "").strip()
        version = self.get_argument("version", "").strip()
        verse = Verse.collection.find_one({"reference":reference, "version":version})
        reference = reference.replace('+',' ')

        if verse:
            self.write(verse['text'])
        else:
            self.write("")

class MoveVerseHandler(BaseHandler):
    def get(self, direction, verse_id):
        if self.current_user is None:
            self.write("not logged in")
            return

        verse = Verse.by_id(verse_id)
        verseset = verse.verseset()
        order = verse["order"]

        if verseset is None:
            self.write("verseset not found")
            return

        if (not self.current_user.is_admin()) and \
           (self.current_user._id != verseset.user_id):
            self.write("not authorized")
            return

        if direction == "up":
            index = order-1
        else:
            index = order+1

        other_verse = Verse.collection.find_one({"order":index,
                                                 "verseset_id":verseset._id})
        if other_verse:
            other_verse["order"] = order
            other_verse.save()
            verse["order"] = index
            verse.save()
            
        verses = list(verseset.sorted_verses())
        self.render("verseset/_verses.html", verses=verses, verseset=verseset)


class UpdateVersionSelectorHandler(BaseHandler):
    def get(self):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE
        version = self.get_argument("version")
        language = self.get_argument("language")

        versions = VERSION_BY_LANGUAGE_CODE[language]
        
        self.render("version_select.html",
                    version=version,
                    language=language,
                    versions=versions,
                    )
    def post(self):
        return self.get()

class RemoveVerseHandler(BaseHandler):
    @require_login
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
    @require_login
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
        selected_nav = "profile"
        
        self.render("verse/edit.html", verse=verse, verseset=verseset,
                    user=user, versions=versions, version=version, selected_nav=selected_nav,
                    reference=None)

    @require_login
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
        reference = self.get_argument("reference").strip()
        version = self.get_argument("version")

        from verserain.utils.text import process_verse
        text = self.get_argument("text")
        text = process_verse(reference, text)

        verse.update({"version":version,
                      "text":text,
                      "reference":reference})
        verse.save()

        commentary = self.get_argument("commentary",None)
        if commentary is not None:
            verse.set_commentary_text(commentary)
        
        self.redirect(verseset.url())

class CreateVerseHandler(BaseHandler):
    @require_login
    def get(self, verseset_id=None, error_message=None, text=None, reference=None,
            version=None):
        user = self.current_user
        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        if verseset is None:
            self.redirect("/verseset/create")
            return

        if version is None:
            if verseset:
                version = verseset.get('version')
            else:
                version = None
        self.render("verse/create.html", verseset=verseset, verse=None,
                    version=version, error_message=error_message,
                    text=text, reference=reference)

    @require_login
    def post(self):
        user = self.current_user
        reference = self.get_argument("reference").strip()
        version = self.get_argument("version")
        text = self.get_argument("text").strip()
        verseset_id = self.get_argument("verseset_id")
        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        error_message = None

        if verseset is None:
            error_message = "Invalid verse set: %s" % verseset_id
        if verseset['user_id'] != user._id and (not user.is_admin()):
            error_message = "You can't edit a verse set you don't own"

        if error_message:
            self.write(error_message)
            return

        if not text:
            error_message = "Verse text is required"
        elif not reference:
            error_message = "Verse reference is required"
        
        if error_message:
            return self.get(verseset_id,error_message,text,reference,version)

        from verserain.utils.text import process_verse
        text = self.get_argument("text")
        text = process_verse(reference, text)

        verse = Verse({'reference':reference,
                       'version':version,
                       'text':text,
                       'verseset_id':verseset_id,
                       'user_id':user._id,
                       'order':verseset.verse_count()+1,
                   })
        verse.save()
        verseset.update_verse_count()

        commentary = self.get_argument("commentary",None)
        if commentary is not None:
            verse.set_commentary_text(commentary)

        self.redirect("/verseset/add_verse/%s" % str(verseset._id))
        
class ShowVerseSetHandler(BaseHandler):
    def get(self, verseset_id=None, time_slice=None, page=1):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE

        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        page = int(page)

        if verseset is None:
            return self.write("verse set not found, possibly removed")

        language = verseset['language']
        versions = VERSION_BY_LANGUAGE_CODE.get(language,[])
        version = verseset.get("version","")
        verses = list(verseset.sorted_verses())
        verseset.update_verse_count(len(verses))
        user = self.current_user

        if user and (verseset["user_id"] == user._id):
            selected_nav = "profile"
        else:
            selected_nav = "verse sets"

        from verserain.leaderboard.models import VersesetScore
        per_page = 10
        start_index = (page-1)*per_page
        end_index = start_index + per_page
        if time_slice is None:
            time_slice = "7"
        min_time = datetime.now()-timedelta(days=int(time_slice))
            
        scores = VersesetScore.collection.find({'date':{'$gt':min_time}, 
                                                'verseset_id':verseset_id})
        cursor = scores
        scores = scores.sort('score', pymongo.DESCENDING)[start_index:end_index]
        scores = list(scores)

        total_count = cursor.count()
        paginator = Pagination(page,per_page,total_count)
        base_url = "/verseset/show/%s/%s" % (str(verseset._id),time_slice)

        play_url = verseset.play_url()
        is_me = (user and ((verseset['user_id'] == user._id) or user.is_admin()))

        return self.render("verseset/show.html", verseset=verseset,
                           user=user, verses=verses, version=version, verse=None,
                           versions=versions, selected_nav=selected_nav, scores=scores,
                           play_url=play_url, is_me=is_me,reference=None, time_slice=time_slice,
                           paginator=paginator, base_url=base_url
                           )

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
        selected_nav = "profile"
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

        verseset.update({"name":name,
                         "language":language,
                         "version":version})

        commentary = self.get_argument("commentary",None)
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
        self.redirect("/u/%s/versesets" % user['username'])

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

        commentary = self.get_argument("commentary",None)
        if commentary is not None:
            vs.set_commentary_text(commentary)

        self.redirect("/verseset/add_verse/%s" % str(vs._id))

    @require_login
    def get(self, error_message=None):
        from verserain.verse.language import VERSION_BY_LANGUAGE_CODE, LANGUAGE_BY_CODE, LANGUAGE_CODES

        user = self.current_user
        version = "NIV"
        language = self.language_code(not_all=True)
        versions = VERSION_BY_LANGUAGE_CODE[language]
        selected_nav = "profile"


        return self.render("profile/create.html", user=user,
                           language_codes=LANGUAGE_CODES, language_by_code=LANGUAGE_BY_CODE,
                           version=version,verseset=None,language=language,versions=versions,
                           selected_nav=selected_nav, error_message=error_message,
                           selected_subnav="create", viewed_user=user)

class ListVerseSetHandler(BaseHandler):
    @require_nonsecure
    def get(self, option="popular", language_code=None, page=1):
        per_page = 15
        page = int(page)
        start_index = (page-1)*per_page
        end_index = start_index + per_page
        user = self.current_user
        selected_subnav = option
        versesets = []
        viewed_user = None

        from verserain.verse.language import LANGUAGE_CODES
        if (language_code is None) or ((language_code.lower() != "all") and (not language_code in LANGUAGE_CODES)):
            language_code = self.language_code()

        if language_code.lower() != "all":
            self.set_language(language_code)

        args = {}
        
        if (option in ("new","popular","top")):
            template_name = "verseset/list.html"
            selected_nav = "verse sets"
            if (language_code.lower() != "all") and (language_code):
                args.update({"language":language_code})

            args.update({"published":True})

            versesets = VerseSet.collection.find(args)
            cursor = versesets
            if option == "new":
                versesets = versesets.sort("_id",pymongo.DESCENDING)
            elif option == "popular":
                versesets = versesets.sort("hotness",pymongo.DESCENDING)
            elif option == "top":
                versesets = versesets.sort("play_count",pymongo.DESCENDING)

            base_url = "/versesets/%s/%s" % (option, language_code)
        else:
            template_name = "profile/versesets.html"
            selected_nav = "verse sets"
            if self.current_user and (self.current_user['username'] == option):
                selected_nav = "profile"
            viewed_user = User.collection.find_one({'username':option})
            selected_subnav = "versesets"
            if viewed_user:
                versesets = viewed_user.versesets()
                cursor = versesets
                versesets = versesets.sort("_id", pymongo.DESCENDING)
                base_url = "/u/%s/versesets" % viewed_user['username']
            else:
                self.write("user not found")
                return
        
        total_count = cursor.count()
        versesets = list(versesets[start_index:end_index])
        paginator = Pagination(page,per_page,total_count)


        return self.render(template_name, user=user, versesets=versesets, selected_nav=selected_nav,
                           selected_subnav=selected_subnav,language_code=language_code, paginator=paginator,
                           base_url=base_url, viewed_user=viewed_user,page=page,
        )

