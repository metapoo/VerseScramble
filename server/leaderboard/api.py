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
    return ((r"/api/leaderboard/verseset/submit_score", LeaderboardSubmitScoreHandler),
            (r"/api/leaderboard/verseset/list", LeaderboardVersesetScoresHandler),

)

def get_scores_json(verseset_id):
    limit = 20
    vsss = VersesetScore.collection.find({"verseset_id":verseset_id}).sort("score",pymongo.DESCENDING)[0:limit]
    json = [vss.json() for vss in vsss]
    response = {"scores":json}
    return response

class LeaderboardVersesetScoresHandler(BaseHandler, ApiMixin):
    api_name="leaderboard/verseset/list"
    def get(self):
        verseset_id = ObjectId(self.get_argument("verseset_id"))
        response = get_scores_json(verseset_id)
        return self.return_success(response)

class LeaderboardSubmitScoreHandler(BaseHandler, ApiMixin):
    api_name="leaderboard/verseset/submit_score"
    secret_key="0>a-q,wYTmq%<,h$OXYg<js:h([TR/:4hSVh.vEJhq4RvWIx@_|^B|]z`b<d~kI@"

    def get(self):
        return self.post()

    def post(self):
        import md5
        response = {"is_logged_in":False}

        if self.current_user is None:
            return self.return_success(response)

        score = self.get_int_argument("score")
        verseset_id = ObjectId(self.get_argument("verseset_id"))

        hash_target = "%s-%s-%s-%s" % (str(self.current_user._id),
                                       str(verseset_id),
                                       str(score),
                                       str(LeaderboardSubmitScoreHandler.secret_key))

        expected_hash = md5.new(hash_target).hexdigest()
        submitted_hash = self.get_argument("hash","")
        validated = (expected_hash == submitted_hash)

        VersesetScore.submit_score(user_id=self.current_user._id,
                                   username=self.current_user['username'],
                                   score=score,
                                   verseset_id=verseset_id,
                                   user = self.current_user)

        response = get_scores_json(verseset_id)
        response["is_logged_in"] = True
        response["validated"] = validated

        return self.return_success(response)
