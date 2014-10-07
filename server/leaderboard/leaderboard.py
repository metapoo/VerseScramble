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
        limit = 20
        users = User.collection.find({'total_score':{'$gt':0}}).sort("total_score",pymongo.DESCENDING)[0:limit]
        highest_vs_scores = VersesetScore.collection.find({'score':{'$gt':0}}).sort("score",pymongo.DESCENDING)[0:limit]

        self.render("leaderboard/index.html", users=users, selected_nav="leaderboard", 
                    highest_vs_scores=highest_vs_scores)
