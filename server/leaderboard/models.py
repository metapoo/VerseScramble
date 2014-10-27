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
            Index("last_played_date"),
        )

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet
        from verserain.user.models import User
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(User)
        return new_instance

    def mistakes(self):
        return self.get("mistakes",0)

    def correct(self):
        return self.get("correct",0)

    def accuracy(self):
        total = self.mistakes() + self.correct()
        if (total == 0):
            return 100.0
        pct =  self.correct()*1.0/total
        pct_rounded = int(1000*pct)*1.0/10.0
        return pct_rounded

    def elapsed_time(self):
        if not self.has_key("elapsed_time"):
            return "?"
        else:
            t = self["elapsed_time"]
            t_rounded = int(1000*t)*1.0/1000.0
            return t_rounded

    def difficulty(self):
        diff = self.get('difficulty',0)
        if diff == 0:
            return "Easy"
        elif diff == 1:
            return "Medium"
        elif diff == 2:
            return "Hard"

    @classmethod
    def submit_score(cls, user_id=None, score=None, verseset_id=None, username=None, user=None,
                     mastered=False, elapsed_time=-1,difficulty=0,mistakes=0,correct=0,is_challenge=True):
        if score == 0:
            return

        from verserain.verse.models import VerseSet
        vs_score = VersesetScore.collection.find_one({'user_id':user_id, 'verseset_id':verseset_id})

        verseset = VerseSet.by_id(verseset_id)
        if verseset:
            verseset_name = verseset['name']
            language = verseset.get('language')
        else:
            return

        params = {'user_id':user_id,
                  'verseset_id':verseset_id,
                  'score':score,
                  'username':username,
                  'verseset_name':verseset_name,
                  'date':datetime.utcnow(),
                  'mistakes':mistakes,
                  'mastered':mastered,
                  'elapsed_time':elapsed_time,
                  'difficulty':difficulty,
                  'correct':correct,
                  'is_challenge':is_challenge,
                  'language':language
        }
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

        vs_score['last_played_date'] = datetime.utcnow()

        vs_score.save()
        if high_score and user:
            user.compute_total_score()
