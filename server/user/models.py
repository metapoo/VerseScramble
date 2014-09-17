from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain.user.password import PasswordMixin

class User(BaseModel, PasswordMixin):
    class Meta:
        collection = "users"
        
        indices = (
            Index("email",unique=True),
            Index("fb_uid",unique=True,sparse=True),
        )

    def is_admin(self):
        return self.get("is_admin", True)

    def display_name(self):
        if self.has_key("name"):
            return self["name"]
        if self.has_key("username"):
            return self["username"]
        return "anonymous"

    def session_key(self):
        from verserain.login.auth import get_session_key
        session_key = get_session_key(self._id)
        return session_key

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet, Verse
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(Verse,one_to_many=True)
        cls.register_foreign_key(VerseSet,one_to_many=True)
        return new_instance

