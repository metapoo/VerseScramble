import logging
import tornado.escape
import tornado.httpclient
import tornado.web

from verserain.user.models import User
from verserain import settings

class BaseHandler(tornado.web.RequestHandler):
    cookieless_okay = False

    def isIOS(self):
        user_agent = self.request.headers['User-Agent']
        if ("iPod" in user_agent) or ("iPhone" in user_agent) or ("iPad" in user_agent):
            return True
        return False

    def isAndroid(self):
        user_agent = self.request.headers['User-Agent']
        if ("Android" in user_agent):
            return True
        return False

    def get(self):
        return self.post()

    def post(self):
        return self.get()

    def authenticate_session_key(self, session_key):
        from verserain.login.auth import authenticate_session_key
        user_key = authenticate_session_key(session_key)
        return user_key

    def authenticate_login(self, fb_uid, email=None, password=None):
        from verserain.login.auth import authenticate_login
        current_user = authenticate_login(fb_uid=fb_uid, email=None, password=None)
        return current_user

    def get_current_user(self, cookieless_okay=False):
        session_key = self.get_argument('session_key', None)
        if session_key:
            self.set_secure_cookie('session_key', session_key)
        else:
            session_key = self.get_secure_cookie('session_key')

        if (not cookieless_okay) and self.cookieless_okay:
            cookieless_okay = True

        user_id = self.authenticate_session_key(session_key)

        if not user_id:
            if cookieless_okay:
                return self.get_current_user_cookieless()
            else:
                return None

        user = User.collection.find_one({'_id':user_id})

        if not user:
            if cookieless_okay:
                return self.get_current_user_cookieless()
            else:
                return None

        return user

    def render(self, *args, **kwargs):
        kwargs['user'] = self.current_user
        kwargs['isIOS'] = self.isIOS()
        kwargs['isAndroid'] = self.isAndroid()
        kwargs['settings'] = settings

        if not kwargs.has_key('error_message'):
            kwargs['error_message'] = None

        if not kwargs.has_key('context'):
            kwargs['context'] = {}

        context = kwargs['context']
        selected_nav = context.get('selected_nav')

        if selected_nav is None:
            selected_nav = self.get_secure_cookie('selected_nav',None)
            if selected_nav:
                context['selected_nav'] = selected_nav
        else:
            self.set_secure_cookie('selected_nav',selected_nav)

        super(BaseHandler, self).render(*args, **kwargs)

    def get_current_user_cookieless(self):
        fb_uid = self.get_argument("fb_uid", "unknown_fb_uid")
        return self.authenticate_login(fb_uid=fb_uid, email=None, password=None)

