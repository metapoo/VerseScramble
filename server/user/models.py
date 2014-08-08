from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain.user.password import PasswordMixin

class User(BaseModel, PasswordMixin):
    class Meta:
        collection = "users"
        
        indices = (
            Index("email",unique=True),
            Index("fb_uid",unique=True),
        )

    def session_key(self):
        from verserain.login.auth import get_session_key
        session_key = get_session_key(self.key.key)
        return session_key

