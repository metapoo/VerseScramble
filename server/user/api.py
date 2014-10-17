from verserain.base.handler import BaseHandler
from verserain.leaderboard.models import *
from verserain.login.auth import *
from verserain.api.api import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/api/user/info", UserInfoHandler),
)

class UserInfoHandler(BaseHandler, ApiMixin):
    api_name="user/info"
    def get(self):
        user = self.current_user
        if not user:
            response = {"user":None}
        else:
            response = {"user":user.json()}
        self.return_success(response)
