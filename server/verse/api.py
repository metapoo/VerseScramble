from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.language import *
from verserain.verse.models import *
from verserain.api.api import *
from bson.objectid import ObjectId
import pymongo 

def get_handlers():
    return ((r"/api/verse/show", ShowVerseApiHandler),
            (r"/api/verseset/show", ShowVerseSetApiHandler),
            (r"/api/verseset/list", ListVerseSetApiHandler),
            (r"/api/verseset/record_play", RecordPlayVerseSetApiHandler),
            )

class RecordPlayVerseSetApiHandler(BaseHandler, ApiMixin):
    api_name = "verseset/record_play"

    def get(self):
        verseset_id = self.get_argument("verseset_id")
        vs = VerseSet.by_id(verseset_id)
        if vs:
            vs["play_count"] = vs.play_count() + 1
            vs.save()
        
        result = {"play_count": vs.play_count()}
        return self.return_success(result)

class ListVerseSetApiHandler(BaseHandler, ApiMixin):
    api_name = "verseset/list"
    def get(self):
        order_by = self.get_argument("order_by", None)
        user_id = self.get_argument("user_id", None)
        language_code = self.get_argument("language_code", "ALL")

        page = self.get_int_argument("page",1)
        per_page = 100
        args = {"verse_count":{"$gt":0}}

        if language_code != "ALL":
            args.update({"language":language_code})

        if user_id:
            user_id = ObjectId(user_id)
            args.update({"user_id":user_id})

        versesets = VerseSet.collection.find(args)

        if order_by == "new":
            versesets = versesets.sort("_id",pymongo.DESCENDING)
        elif order_by == "popular":
            versesets = versesets.sort("hotness",pymongo.DESCENDING)
        else:
            versesets = versesets.sort("_id", pymongo.DESCENDING)

        versesets = versesets[(page-1)*per_page:page*per_page]

        versesets_json = [verseset.json() for verseset in versesets]
        result = {"versesets":versesets_json,
                  }
        return self.return_success(result)

class ShowVerseApiHandler(BaseHandler, ApiMixin):
    api_name = "verse/show"
    def get(self):
        verse_id = self.get_argument("verse_id")
        verse_id = ObjectId(verse_id)
        verse = Verse.collection.find_one({'_id':verse_id})
        if verse is None:
            self.return_error("verse not found")
        verse_json = verse.json()
        vs = verse.verseset()
        verse_json["language"] = vs["language"]
        verse_json["verseset_name"] = vs["name"]
        self.return_success({"verse":verse_json})

class ShowVerseSetApiHandler(BaseHandler, ApiMixin):
    api_name = "verseset/show"
    def get(self):
        from verserain.leaderboard.models import VersesetScore
        verseset_id = self.get_argument("verseset_id")
        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})

        if verseset is None:
            self.return_error("verse set is not found")
        
        verses_json = [verse.json() for verse in verseset.sorted_verses()]

        high_score = 0
        difficulty = 0
        mastered = False

        if self.current_user:
            vss = VersesetScore.collection.find_one({"user_id":self.current_user._id,
                                                     "verseset_id":verseset_id})
            if vss and vss.get('is_challenge',True):
                high_score = vss['score']
                difficulty = vss.get('difficulty',0)
                mastered = vss.get('mastered',False)
            
        result = {"verseset":verseset.json(),
                  "verses":verses_json,
                  "high_score":high_score,
                  "difficulty":difficulty,
                  "mastered":mastered,
        }

        return self.return_success(result)
