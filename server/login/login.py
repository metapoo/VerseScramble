from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine

def get_handlers():
    return ((r"/login/fb", FacebookGraphLoginHandler),
            (r"/login/logout", LogoutHandler),
            (r"/login/fb", FacebookGraphLoginHandler),
            (r"/login/register", RegisterHandler),
            (r"/login", LoginHandler),
)

class RegisterHandler(BaseHandler):
    def get(self):
        user = self.current_user
        error_message = None
        self.render("login/register.html",user=user,error_message=error_message,
                    email="",username="")

    def post(self):
        password = self.get_argument("password")
        email = self.get_argument("email")
        username = self.get_argument("username")
        error_message = None

        user = User.collection.find_one({'email':email})
        if user:
            error_message = "An account is already registered with that email."

        user = User.collection.find_one({'username':username})
        if user:
            error_message = "An account is already registered with that username."
        
        if not password:
            error_message = "Password is required."

        if not email:
            error_message = "Email is required."

        if not username:
            error_message = "Username is required."

        if error_message:
            self.render("login/register.html",user=None,error_message=error_message,
                        email=email,username=username)
            return

        user = create_new_user(username=username,email=email,password=password)
        session_key=user.session_key()
        self.set_secure_cookie("session_key",session_key)
        self.set_secure_cookie("email",email)
        self.redirect("/")

class LoginHandler(BaseHandler):
    def get(self):
        user = self.current_user
        error_message = None
        email = self.get_secure_cookie("email")
        if email is None:
            email = ""
        self.render("login/login.html",user=user,error_message=error_message,email=email)

    def post(self):
        password = self.get_argument("password")
        email = self.get_argument("email")
        user = authenticate_login(email=email, password=password)
        error_message = None

        if user is None:
            error_message = "Invalid email or password"        
            self.render("login/login.html",user=user,error_message=error_message,email=email)
            return

        session_key = user.session_key()
        self.set_secure_cookie("session_key",session_key)
        self.set_secure_cookie("email",email)
        self.redirect("/")

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
