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

def get_user_from_fb_profile(fb_user, fb_profile):
    email = None

    if fb_profile.has_key('name'):
        fb_user['name'] = fb_profile['name']

    if fb_profile.has_key('email'):
        email = fb_profile['email']
        fb_user['email'] = email
    if fb_profile.has_key('gender'):
        fb_user['gender'] = fb_profile['gender']

    # Save the user with e.g. set_secure_cookie                                                                                                                                                  
    fb_uid = fb_user["id"]
    name = fb_user["name"]
    username = name
    
    user = authenticate_login(fb_uid=fb_uid,
    )

    if user is None and email:
        user = User.collection.find_one({"email":email})

    if user is None:
        if User.by_username(username):
            username = username.replace(" ",".")

        if User.by_username(username):
            username = username.replace(".","")

        user = create_new_user(fb_uid=fb_uid, name=name, username=username)

    user.handle_fb_user(fb_user)
    return user

class FacebookGraphLoginHandler(BaseHandler, FacebookGraphMixin):
    @coroutine
    def get(self):
        login_only = self.get_argument("login_only",None)
        next_url = self.get_argument("next",None)

        if login_only:
            self.set_cookie("login_only", login_only)
        else:
            login_only = self.get_cookie("login_only")

        if next_url:
            self.set_cookie("next", next_url)
        else:
            next_url = self.get_cookie("next")

        fblogin_url = "%s/fb/login" % (self.settings["site_url"],)
        fb_user=None
        user = self.current_user

        if self.get_argument("code", False):
            fb_user = yield self.get_authenticated_user(
                redirect_uri=fblogin_url,
                client_id=self.settings["facebook_api_key"],
                client_secret=self.settings["facebook_secret"],
                code=self.get_argument("code"))

            fb_profile = yield self.facebook_request("/me",access_token=fb_user["access_token"])
            user = get_user_from_fb_profile(fb_user, fb_profile)

            session_key = user.session_key()
            self.set_secure_cookie("session_key", session_key)
        else:
            yield self.authorize_redirect(
                redirect_uri=fblogin_url,
                client_id=self.settings["facebook_api_key"],
                extra_params={"scope": ["offline_access","email"]})
            return

        fb_uid = user['fb_uid']
        if user.get('password') is None:
            next_url = "/login/reset_password?session_key=%s&fb_uid=%s" % (session_key, fb_uid) 

        if next_url is None:
            url = "/profile/account"
            if user.has_key('email'):
                url = "/"
        else:
            url = next_url

        self.clear_cookie("login_only")
        self.clear_cookie("next")
        self.redirect(url)

class FacebookDisconnectHandler(BaseHandler):
    @require_login
    def get(self):
        user = self.current_user
        user.disconnect_fb()
        self.redirect("/profile/account")
