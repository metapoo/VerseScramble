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

    def submit_score(cls, user_id, verseset_id):
        score = VersesetScore.collection.find_one(user_id=user_id, verseset_id=verseset_id)
        params = {'user_id':user_id,
                  'verseset_id':verseset_id}
        if score:
            score.update(params)
        else:
            score = VersesetScore()
            score.update(params)

        score.save()
