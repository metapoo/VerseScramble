from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain.user.password import PasswordMixin

class User(BaseModel, PasswordMixin):
    class Meta:
        collection = "users"
        
        indices = (
            Index("email",unique=True),
            Index("fb_uid",unique=True,sparse=True),
            Index("username",unique=True),
            Index("total_score"),
        )

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
        return self.get("is_admin", True)

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
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(Verse,one_to_many=True)
        cls.register_foreign_key(VerseSet,one_to_many=True)
        return new_instance

