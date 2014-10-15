from verserain.verse.models import *
from verserain.base.handler import BaseHandler
from verserain.leaderboard.models import *
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from verserain.api.api import *
from verserain.utils.paging import Pagination
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/u/([^/]+)/scores/?", ProfileListScoresHandler),
            (r"/u/([^/]+)/scores/(\d+)/?", ProfileListScoresHandler),
            (r"/u/([^/]+)/?$", ProfileOtherIndexHandler),
            (r"/profile/?", ProfileIndexHandler),
    )

class ProfileOtherIndexHandler(BaseHandler):
    def get(self, username=None):
        user = User.collection.find_one({'username':username})
        has_versesets = VerseSet.collection.find_one({'user_id':user._id}) is not None
        if has_versesets:
            self.redirect("/u/%s/versesets/"%username)
        else:
            self.redirect("/u/%s/scores/"%username)

class ProfileIndexHandler(BaseHandler):
    @require_login
    def get(self):
        self.redirect("/u/%s" % self.current_user['username'])

class ProfileListScoresHandler(BaseHandler):
    def get(self, username=None, page=1):
        page = int(page)
        per_page = 15
        start_index = (page-1)*per_page
        end_index = start_index + per_page
        base_url = "/u/%s/scores" % username

        viewed_user = User.collection.find_one({'username':username})

        if viewed_user is None:
            return self.write("user not found")

        scores = VersesetScore.collection.find({'user_id':viewed_user._id}).sort("last_played_date",pymongo.DESCENDING)
        total_count = scores.count()
        scores = scores[start_index:end_index]
        paginator = Pagination(page,per_page,total_count)

        self.render("profile/scores.html", selected_nav="profile", scores=scores,
                    viewed_user=viewed_user, paginator=paginator, selected_subnav="scores",
                    base_url=base_url)
                    
