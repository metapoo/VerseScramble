from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.email.models import *
from verserain import settings
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine

import re

def get_handlers():
    return ((r"/fb/login/?", FacebookGraphLoginHandler),
            (r"/fb/disconnect/?", FacebookDisconnectHandler),
)
class FacebookGraphLoginHandler(BaseHandler, FacebookGraphMixin):
    @coroutine
    def get(self):
        next_url = self.get_argument("next",None)
        if next_url:
            self.set_cookie("next", next_url)
        else:
            next_url = self.get_cookie("next")

        fblogin_url = "%s/fb/login" % (self.settings["site_url"],)
        fb_user=None
        user_created = False
        user = self.current_user

        if self.get_argument("code", False):
            fb_user = yield self.get_authenticated_user(
                redirect_uri=fblogin_url,
                client_id=self.settings["facebook_api_key"],
                client_secret=self.settings["facebook_secret"],
                code=self.get_argument("code"))

            fb_profile = yield self.facebook_request("/me",access_token=fb_user["access_token"])

            if fb_profile.has_key('email'):
                fb_user['email'] = fb_profile['email']
            if fb_profile.has_key('gender'):
                fb_user['gender'] = fb_profile['gender']

            # Save the user with e.g. set_secure_cookie
            fb_uid = fb_user["id"]
            name = fb_user["name"]
            username = name
            user = self.current_user
            
            if user is None:
                user = authenticate_login(fb_uid=fb_uid, 
                                      )
            if user is None:
                user = create_new_user(fb_uid=fb_uid, name=name, username=username)
                user_created = True
            
            user.handle_fb_user(fb_user)

            session_key = user.session_key()
            self.set_secure_cookie("session_key", session_key)

        else:
            yield self.authorize_redirect(
                redirect_uri=fblogin_url,
                client_id=self.settings["facebook_api_key"],
                extra_params={"scope": ["offline_access","email"]})
            return
            
        if next_url is None:
            url = "/profile/account"
            if user.has_key('email') and user.has_key('password'):
                url = "/"
        else:
            url = next_url

        self.redirect(url)

class FacebookDisconnectHandler(BaseHandler):
    @require_login
    def get(self):
        user = self.current_user
        user.disconnect_fb()
        self.redirect("/profile/account")
