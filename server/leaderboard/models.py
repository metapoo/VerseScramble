from verserain.mongo.models import BaseModel
from minimongo import Index
import pymongo

class VersesetScore(BaseModel):
    class Meta:
        collection = "verseset_score"
        
        indices = (
            Index("score"),
            Index("verseset_id"),
            Index("user_id"),
        )

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet
        from verserain.user.models import User
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(User)
        return new_instance

    @classmethod
    def submit_score(cls, user_id=None, score=None, verseset_id=None, username=None, user=None):
        vs_score = VersesetScore.collection.find_one({'user_id':user_id, 'verseset_id':verseset_id})

        params = {'user_id':user_id,
                  'verseset_id':verseset_id,
                  'score':score,
                  'username':username}
        high_score = False

        if vs_score:
            if score > vs_score.get('score',0):
                vs_score.update(params)
                high_score = True
            else:
                vs_score['username'] = username
        else:
            vs_score = VersesetScore()
            vs_score.update(params)
            high_score = True

        vs_score.save()
        if high_score and user:
            user.compute_total_score()
