from verserain.user.models import User

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

    if name:
        u["name"] = name

    if email:
        u["email"] = email

        if User.collection.find_one(email=email):
            raise Exception("A user already exists with the given email.")

    if device_id:
        u["device_id"] = device_id

    if password:
        u.set_password(password)

    u.save()

    return u
