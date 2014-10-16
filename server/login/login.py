from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain import settings
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine

import re

def get_handlers():
    return ((r"/login/fb/?", FacebookGraphLoginHandler),
            (r"/login/logout/?", LogoutHandler),
            (r"/login/fb/?", FacebookGraphLoginHandler),
            (r"/login/register/?", RegisterHandler),
            (r"/register/?", RegisterHandler),
            (r"/login/?", LoginHandler),
)

class RegisterHandler(BaseHandler):
    @require_secure
    def get(self):
        user = self.current_user
        error_message = None
        selected_nav = "register"
        self.render("login/register.html",user=user,error_message=error_message,
                    email="",username="",selected_nav=selected_nav)

    @require_secure
    def post(self):
        confirm_password = self.get_argument("confirm_password")
        password = self.get_argument("password")
        email = self.get_argument("email")
        username = self.get_argument("username").strip()
        error_message = None

        user = User.collection.find_one({'email':email})
        if user:
            error_message = "An account is already registered with that email."

        user = User.collection.find_one({'username':username})

        if len(username) < 4:
            error_message = "Username must be at least four characters."
        elif " " in username:
            error_message = "Username cannot contain spaces."
        elif user:
            error_message = "An account is already registered with that username."        
        elif not confirm_password:
            error_message = "Password confirmation is required"
        elif not password:
            error_message = "Password is required."
        elif password != confirm_password:
            error_message = "Password does not match with confirmation"
        elif not email:
            error_message = "Email is required."
        elif not username:
            error_message = "Username is required."
        
        if error_message:
            self.render("login/register.html",user=None,error_message=error_message,
                        email=email,username=username, next_url=None)
            return

        user = create_new_user(username=username,email=email,password=password)
        session_key=user.session_key()
        self.set_secure_cookie("session_key",session_key)
        self.set_secure_cookie("email",email)
        self.redirectWithProtocol(uri="/",protocol="http")

class LoginHandler(BaseHandler):
    @require_secure
    def get(self):
        next_url = self.get_argument("next",None)
        user = self.current_user
        error_message = None
        email = self.get_secure_cookie("email")
        if email is None:
            email = ""
        selected_nav = "login"
        if next_url:
            self.set_cookie("next_url",next_url)
        self.render("login/login.html",user=user,error_message=error_message,email=email,
                    selected_nav=selected_nav, next_url=next_url)

    @require_secure
    def post(self):
        password = self.get_argument("password")
        login_subject = self.get_argument("email").strip()
        username = None
        email = login_subject
        login_subject_desc = "email"

        if "@" not in email:
            login_subject_desc = "username"
            username = login_subject
            email = None

        user = authenticate_login(email=email, username=username, password=password)
        error_message = None

        if user is None:
            user = User.collection.find_one({'username':username})
            error_message = "Invalid %s or password" % login_subject_desc       
            self.render("login/login.html",user=user,error_message=error_message,email=login_subject,username=username,
                        next_url=None)
            return

        session_key = user.session_key()
        self.set_secure_cookie("session_key",session_key)
        self.set_secure_cookie("email",login_subject)

        next_url = self.get_cookie("next_url","/")
        self.redirectWithProtocol(uri=next_url,protocol="http")
        self.clear_cookie("next_url")

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
