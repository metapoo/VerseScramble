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

    def display_name(self):
        if self.has_key("name"):
            return self["name"]
        return "anonymous"

    def session_key(self):
        from verserain.login.auth import get_session_key
        session_key = get_session_key(self._id)
        return session_key

