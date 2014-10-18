from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain.user.password import PasswordMixin
from verserain import settings
from hashlib import md5
from verserain.fb.models import FacebookMixin

class User(BaseModel, PasswordMixin, FacebookMixin):
    class Meta:
        collection = "users"
        
        indices = (
            Index("email",unique=True,sparse=True),
            Index("fb_uid",sparse=True),
            Index("username",unique=True),
            Index("total_score"),
        )

    def account_incomplete(self):
        return (not self.has_key("email")) or (not self.has_key("password")) or (not self.has_key("fb_uid"))

    @classmethod
    def by_username(cls, username):
        return cls.collection.find_one({"username":username})

    def has_fb(self):
        return self.has_key('fb_uid')

    def reset_password_hash(self):
        password = self.get("password", "")
        hash_code = md5("%s-%s-%s" % (password, str(self._id), settings.SECRET_KEY)).hexdigest()
        return hash_code

    def email(self):
        return self.get("email",None)

    def email_hash(self):
        email = self.get("email","")
        hash_code = md5("%s-%s-%s" % (email, str(self._id), settings.SECRET_KEY)).hexdigest()
        return hash_code

    def email_verified(self):
        return self.get("email_verified",False)

    def set_language(self, language_code):
        if self.get("language", None) != language_code:
            self["language"] = language_code

    def total_score(self):
        return self.get("total_score", 0)

    def total_blocks(self):
        return self.get("total_blocks", 0)

    def compute_total_score(self):
        from verserain.leaderboard.models import VersesetScore
        vss = VersesetScore.collection.find({'user_id':self._id})
        total_score = 0
        total_accuracy = 0
        total_correct = 0

        for vs in vss:
            total_score += vs["score"]
            total_correct += vs.correct()
            total_accuracy += vs.accuracy()*vs.correct()

        self["total_score"] = total_score
        if total_correct > 0:
            self["accuracy"] = int(1000*total_accuracy / total_correct)/1000.0
            self["total_blocks"] = total_correct

        self.save()

    def accuracy(self):
        return self.get("accuracy",0)

    def is_admin(self):
        return self.get("is_admin", False)

    def display_name(self):
        if self.has_key("username"):
            return self["username"]
        return "anonymous"

    def session_key(self):
        from verserain.login.auth import get_session_key
        session_key = get_session_key(self._id)
        return session_key

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet, Verse
        from verserain.fb.models import FbUser
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(Verse,one_to_many=True)
        cls.register_foreign_key(VerseSet,one_to_many=True)
        return new_instance

