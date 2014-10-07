from verserain.base.handler import BaseHandler
from verserain.leaderboard.models import *
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from verserain.api.api import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/leaderboard/?", LeaderboardUserListHandler),

)

class LeaderboardUserListHandler(BaseHandler, ApiMixin):
    def get(self):
        users = User.collection.find({'total_score':{'$gt':0}}).sort("total_score",pymongo.DESCENDING)
        self.render("leaderboard/index.html", users=users, selected_nav="leaderboard")
