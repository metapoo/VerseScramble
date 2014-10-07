from verserain.base.handler import BaseHandler
from verserain.leaderboard.models import *
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from verserain.api.api import *

def get_handlers():
    return ((r"/api/leaderboard/submit_score", LeaderboardSubmitScoreHandler),
            (r"/api/leaderboard/verseset_scores", LeaderboardVersesetScoresHandler),

)

class LeaderboardVersesetScoresHandler(BaseHandler, ApiMixin):
    api_name="leaderboard/verseset_scores"
    def get(self):
        verseset_id = self.get_argument("verseset_id")
        vsss = VersesetScore.collection.find({"verseset_id":verseset_id})
        json = [vss.json() for vss in vsss]
        response = {"verseset_scores":json}
        return self.return_success(response)

class LeaderboardSubmitScoreHandler(BaseHandler, ApiMixin):
    api_name="leaderboard/submit_score"
    def get(self):
        return self.post()

    def post(self):
        response = {"is_logged_in":False}

        if self.current_user is None:
            return self.return_success(response)

        score = self.get_argument("score")
        verseset_id = self.get_argument("verseset_id")

        response["is_logged_in"] = True
        VersesetScore.submit_score(user_id=self.current_user._id,
                                   score=score,
                                   verseset_id=verseset_id)

        return self.return_success(response)
