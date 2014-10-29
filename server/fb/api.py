from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.email.models import *
from verserain.api.api import ApiMixin
from verserain.fb.fb import *
from verserain import settings
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine

import re

def get_handlers():
    return ((r"/api/fb/login/?", FacebookApiLoginHandler),
)

class FacebookApiLoginHandler(BaseHandler, FacebookGraphMixin, ApiMixin):
    api_name = "fb/login"

    @coroutine
    def get(self):
        access_token = self.get_argument("access_token")
        fb_pic_url = self.get_argument("fb_pic_url",None)
        fb_uid = self.get_argument("fb_uid")
            
        fb_user={"id":fb_uid,
                 "picture":{"data":{"url":fb_pic_url}},
                 "access_token":access_token}

        fb_profile = yield self.facebook_request("/me",access_token=fb_user["access_token"])
        user = get_user_from_fb_profile(fb_user, fb_profile)
        
        response = {}

        if user:
            response.update({"session_key": user.session_key(),
                             "logged_in": True
                             })
            response.update(user.json())
            if response.has_key("password"):
                del response["password"]
        else:
            response["logged_in"] = False

        self.return_success(response)


