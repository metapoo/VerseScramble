from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine

def get_handlers():
    return ((r"/login/fb", FacebookGraphLoginHandler),
            (r"/login/logout", LogoutHandler),
            (r"/login", FacebookGraphLoginHandler),
            )

class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("session_key")
        self.redirect("/")

class FacebookGraphLoginHandler(BaseHandler, FacebookGraphMixin):
    @coroutine
    def get(self):
        fblogin_url = "%s/login" % self.settings["site_url"]

        if self.get_argument("code", False):
            fb_user = yield self.get_authenticated_user(
                redirect_uri=fblogin_url,
                client_id=self.settings["facebook_api_key"],
                client_secret=self.settings["facebook_secret"],
                code=self.get_argument("code"))
            # Save the user with e.g. set_secure_cookie

            fb_uid = fb_user["id"]
            name = fb_user["name"]
            user = authenticate_login(fb_uid=fb_uid, 
                                      )
            if user is None:
                user = create_new_user(fb_uid=fb_uid, name=name)

            session_key = user.session_key()
            self.set_secure_cookie("session_key", session_key)
            
        else:
            yield self.authorize_redirect(
                redirect_uri=fblogin_url,
                client_id=self.settings["facebook_api_key"],
                extra_params={"scope": "offline_access"})

        self.redirect("/")
