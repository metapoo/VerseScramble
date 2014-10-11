from verserain.base.handler import BaseHandler
from verserain.leaderboard.models import *
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from verserain.api.api import *
from verserain.utils.paging import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/leaderboard/([^/]+)/(\d+)/?", LeaderboardUserListHandler),
            (r"/leaderboard/([^/]+)/?", LeaderboardUserListHandler),
            (r"/leaderboard/?", LeaderboardUserListHandler),
)

class LeaderboardUserListHandler(BaseHandler, ApiMixin):
    def get(self, selected_subnav="total", page=1):
        per_page = 20
        page = int(page)
        start_index = (page-1)*per_page
        end_index = start_index+per_page
        users = None
        scores = None

        if selected_subnav == "total":
            users = User.collection.find({'total_score':{'$gt':0}})
            cursor = users
            users = users.sort("total_score",pymongo.DESCENDING)[start_index:end_index]
        else:
            scores = VersesetScore.collection.find({'score':{'$gt':0}})
            cursor = scores

            if selected_subnav == "recent":
                sort_field = "date"
            elif selected_subnav == "high":
                sort_field = "score"
        
            scores = scores.sort(sort_field,pymongo.DESCENDING)[start_index:end_index]
        
        total_count = cursor.count()
        paginator = Pagination(page,per_page,total_count)
        base_url = "/leaderboard/%s" % selected_subnav

        self.render("leaderboard/index.html", users=users, selected_nav="leaderboard", 
                    scores=scores, paginator=paginator, selected_subnav=selected_subnav,
                    base_url=base_url)
