from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.api.api import *
from bson.objectid import ObjectId

def get_handlers():
    return ((r"/api/login/login",LoginApiHandler),
            (r"/api/login/register",RegisterApiHandler),
        )

class RegisterApiHandler(BaseHandler, ApiMixin):
    api_name="login/register"

    def get(self):
        return self.post()

    def post(self):
        confirm_password = self.get_argument("confirm_password")
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

        if not confirm_password:
            error_message = "Password confirmation is required"

        if not password:
            error_message = "Password is required."

        if password != confirm_password:
            error_message = "Password does not match with confirmation"

        if not email:
            error_message = "Email is required."

        if not username:
            error_message = "Username is required."

        response = {"error_message":error_message}

        if error_message:
            return self.return_success(response)

        user = create_new_user(username=username,email=email,password=password)
        session_key=user.session_key()
        response.update({"session_key":session_key,
                         })
        response.update(user.json())

        if response.has_key("password"):
            del response["password"]

        return self.return_success(response)

class LoginApiHandler(BaseHandler, ApiMixin):
    api_name="login/login"

    def get(self):
        return self.post()

    def post(self):

        try:
            password = self.get_argument("password", None)
            username = self.get_argument("username", None)
            session_key = self.get_argument("session_key", None)
        except tornado.web.HTTPError, e:
            return self.return_error(e.log_message)

        email = None

        if username and ("@" in username) and ("." in username):
            email = username

        user = authenticate_login(username=username, email=email, password=password, session_key=session_key)

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
            
        return self.return_success(response)


