from verserain.mongo.models import BaseModel
from minimongo import Index
import pymongo
from datetime import datetime

class VersesetScore(BaseModel):
    class Meta:
        collection = "verseset_score"
        
        indices = (
            Index("score"),
            Index("verseset_id"),
            Index("user_id"),
            Index("date"),
        )

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet
        from verserain.user.models import User
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(User)
        return new_instance

    def date(self):
        if self.has_key('date'):
            return self["date"]
        else:
            return self.created_at()

    @classmethod
    def submit_score(cls, user_id=None, score=None, verseset_id=None, username=None, user=None):
        from verserain.verse.models import VerseSet
        vs_score = VersesetScore.collection.find_one({'user_id':user_id, 'verseset_id':verseset_id})

        verseset = VerseSet.by_id(verseset_id)
        if verseset:
            verseset_name = verseset['name']
        else:
            return

        params = {'user_id':user_id,
                  'verseset_id':verseset_id,
                  'score':score,
                  'username':username,
                  'verseset_name':verseset_name,
                  'date':datetime.utcnow()}
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
