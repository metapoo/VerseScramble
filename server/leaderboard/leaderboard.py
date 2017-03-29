from verserain.base.handler import BaseHandler
from verserain.leaderboard.models import *
from verserain.login.auth import *
from tornado.auth import FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from verserain.api.api import *
from verserain.utils.paging import *
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import pymongo

def get_handlers():
    return ((r"/leaderboard/(?P<selected_subnav>high)/(?P<time_slice>\d+)/(?P<page>\d+)/?", LeaderboardUserListHandler),
            (r"/leaderboard/(?P<selected_subnav>high)/(?P<time_slice>\d+)/?", LeaderboardUserListHandler),
            (r"/leaderboard/([^/]+)/(\d+)/?", LeaderboardUserListHandler),
            (r"/leaderboard/([^/]+)/?", LeaderboardUserListHandler),
            (r"/leaderboard/?", LeaderboardUserListHandler),
)

class LeaderboardUserListHandler(BaseHandler, ApiMixin):
    def get(self, selected_subnav=None, page=1, time_slice=None):
        username = self.get_argument("user",None)
        per_page = 20
        page = int(page)
        start_index = (page-1)*per_page
        end_index = start_index+per_page
        users = None
        scores = None
        user = self.current_user

        if selected_subnav is None:
            selected_subnav = "high"

        if selected_subnav is "total":
            if user and user.has_key('rank'):
                self.redirect(user.rank_url())
                return

        base_url = "/leaderboard/%s" % selected_subnav

        if selected_subnav == "total":
            users = User.collection.find()
            cursor = users
            users = users.sort("rank",pymongo.ASCENDING)[start_index:end_index]
        else:
            arguments = {'score':{'$gt':0}}

            if selected_subnav == "recent":
                sort_field = "last_played_date"
            elif selected_subnav == "high":
                sort_field = "score"
                if time_slice is None:
                    time_slice = "1"
                base_url = "/leaderboard/high/%s" % time_slice

            if time_slice:
                min_date = datetime.now()-timedelta(days=int(time_slice))
                arguments.update({'date':{'$gt':min_date}})
    
            scores = VersesetScore.collection.find(arguments)
            cursor = scores

        
            scores = scores.sort(sort_field,pymongo.DESCENDING)[start_index:end_index]
        
        total_count = cursor.count()
        paginator = Pagination(page,per_page,total_count)

        self.render("leaderboard/index.html", users=users, selected_nav="leaderboard", 
                    scores=scores, paginator=paginator, selected_subnav=selected_subnav,
                    base_url=base_url, start_index=start_index, username=username, time_slice=time_slice)
