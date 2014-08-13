from verserain.user.models import User
from bson.objectid import ObjectId
from verserain import settings
import functools
import urllib

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
        u["email"] = email

        if User.collection.find_one({'email':email}):
            raise Exception("A user already exists with the given email.")

    if device_id:
        u["device_id"] = device_id

    if password:
        u.set_password(password)

    u.save()

    return u

def authenticate_login(fb_uid=None, email=None, password=None, username=None, device_id=None):
    user = None
    if email:
        # find a registered user based on email                                                                                                                     
        user = User.collection.find_one({'email':email})
        if user is None:
            return None
    elif username:
        user = User.collection.find_one({'lower_username':username.lower()})
        if user and user.has_key('password'):
            if not user.check_password(password):
                return None
        return user
    elif fb_uid:
        user = User.collection.find_one({'fb_uid':fb_uid})
        return user
    elif device_id:
        user = User.collection.find_one({'device_id':device_id})
        return user
    else:
        pass

    if user and user.check_password(password):
        return user
    else:
        return None

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
