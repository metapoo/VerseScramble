from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine

def get_handlers():
    return ((r"/login/fb", FacebookGraphLoginHandler),
            (r"/login", FacebookGraphLoginHandler),
            )

class FacebookGraphLoginHandler(BaseHandler, FacebookGraphMixin):
    @coroutine
    def get(self):
        redirect_url = "%s/login" % self.settings["site_url"]

        if self.get_argument("code", False):
            fb_user = yield self.get_authenticated_user(
                redirect_uri=redirect_url,
                client_id=self.settings["facebook_api_key"],
                client_secret=self.settings["facebook_secret"],
                code=self.get_argument("code"))
            # Save the user with e.g. set_secure_cookie
            
        else:
            yield self.authorize_redirect(
                redirect_uri=redirect_url,
                client_id=self.settings["facebook_api_key"],
                extra_params={"scope": "offline_access"})

        self.write(fb_user)
