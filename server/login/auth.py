from verserain.user.models import User
from bson.objectid import ObjectId
from verserain import settings
import functools
import urllib
import pymongo

def get_session_key(user_id):
    import hashlib
    hash_arg = "%s-%s" % (str(user_id), settings.SECRET_KEY)
    token = hashlib.sha1(hash_arg).hexdigest()
    session_key = "%s-%s" % (token, user_id)
    return session_key

def authenticate_session_key(session_key):
    try:
        token, user_id = session_key.split('-')
    except:
        return None

    user_id = ObjectId(user_id)
    correct_session_key = get_session_key(user_id)

    if (correct_session_key != session_key):
        return None

    return user_id

def create_new_user(fb_uid=None, email=None, password=None, user_obj=None, name=None, username=None, device_id=None):
    if user_obj is None:
        u = User()
    else:
        u = user_obj

    if fb_uid:
        u["fb_uid"] = fb_uid

    if username:
        u["username"] = username

    if name:
        u["name"] = name

    if email:
        u["email"] = email.lower()

        if User.collection.find_one({'email':email}):
            raise Exception("A user already exists with the given email.")

    if device_id:
        u["device_id"] = device_id

    if password:
        u.set_password(password)

    u.save()

    return u

def authenticate_login(fb_uid=None, email=None, password=None, username=None, device_id=None, session_key=None):
    user = None
    if email:
        # find a registered user based on email                                                                                                                     
        user = User.collection.find_one({'email':email.lower()})
        if user is None:
            return None
    elif username:
        user = User.collection.find_one({'username':username})
        if user is None:
            user = User.collection.find_one({'username':username.lower()})
            if user is None:
                return None
    elif fb_uid:
        # find user with highest score for facebook login
        users = User.collection.find({'fb_uid':fb_uid}).sort("total_score", pymongo.DESCENDING)
        users = list(users)
        if len(users) > 0:
            return users[0]
        else:
            return None
    elif device_id:
        user = User.collection.find_one({'device_id':device_id})
        return user
    elif session_key:
        user_id = authenticate_session_key(session_key)
        if user_id:
            user = User.by_id(user_id)

    if user and (user.check_password(password) or session_key):
        return user
    else:
        return None


def require_api_login(method):
    """Decorate methods with this to require that the user be logged in                                                             
    and a superuser."""
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):
        user = self.current_user
        if (user is None):
            self.return_error("authentication failed")
        return method(self, *args, **kwargs)
    return wrapper

def require_login(method):
    """Decorate methods with this to require that the user be logged in                                                                                             
    and a superuser."""
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):
        user = self.current_user
        if (not user):
            if self.request.method == "GET":
                url = self.get_login_url()
                if "?" not in url:
                    url += "?%s" % urllib.urlencode(dict(next=self.request.uri))
                self.redirect(url)
            return
            raise tornado.web.HTTPError(403)
        return method(self, *args, **kwargs)
    return wrapper

def require_nonsecure(method):
    """Decorate methods with this to require that the user be logged in                                                                                             
    and a superuser."""
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):
        if self.isSecure() and (settings.VERSERAIN_ENV != "development"):
            return self.redirectHttp()
        else:
            return method(self, *args, **kwargs)
    return wrapper

def require_secure(method):
    """Decorate methods with this to require that the user be logged in                                                                                             
    and a superuser."""
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):
        if not self.isSecure():
            return self.redirectHttps()
        else:
            return method(self, *args, **kwargs)
    return wrapper
