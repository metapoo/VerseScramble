from verserain.base.handler import BaseHandler
from verserain.verse.models import *
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
    return ((r"/api/profile/versesets/recent", ProfileListRecentVerseSetsHandler),
    )

class ProfileListRecentVerseSetsHandler(BaseHandler, ApiMixin):
    def get(self):
        if not self.current_user:
            return self.return_success({"logged_in":False})

        page = self.get_argument("page",1)
        per_page = 20
        start_index = (page-1)*per_page
        end_index = start_index + per_page
        viewed_user = self.current_user

        scores = VersesetScore.collection.find({'user_id':viewed_user._id}).sort("last_played_date",pymongo.DESCENDING)
        scores = list(scores[start_index:end_index])
        ids = [score["verseset_id"] for score in scores]
        
        rank_by_id = {}
        i = 0
        for score in scores:
            rank_by_id[score['verseset_id']] = i
            i += 1

        def vs_cmp(vs1,vs2):
            return rank_by_id[vs1._id] - rank_by_id[vs2._id]

        versesets = list(VerseSet.collection.find({'_id':{'$in':ids}}))
        versesets = sorted(versesets, cmp=vs_cmp)
        
        versesets_json = [verseset.json() for verseset in versesets]
        result = {"versesets":versesets_json,
                  "logged_in":True,
                  }
        return self.return_success(result)
