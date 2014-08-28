from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.language import *
from verserain.verse.models import *
from verserain.api.api import *
from bson.objectid import ObjectId

def get_handlers():
    return ((r"/api/verse/show", ShowVerseApiHandler),
            (r"/api/verseset/show", ShowVerseSetApiHandler),
            (r"/api/verseset/list", ListVerseSetApiHandler),
            )

class ListVerseSetApiHandler(BaseHandler, ApiMixin):
    api_name = "verseset/list"
    def get(self):
        versesets = VerseSet.collection.find()
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
        self.return_success({"verse":verse_json})

class ShowVerseSetApiHandler(BaseHandler, ApiMixin):
    api_name = "verseset/show"
    def get(self):
        verseset_id = self.get_argument("verseset_id")
        verseset_id = ObjectId(verseset_id)
        verseset = VerseSet.collection.find_one({'_id':verseset_id})
        if verseset is None:
            self.return_error("verse set is not found")
        
        verses_json = [verse.json() for verse in verseset.verses()]

        result = {"verseset":verseset.json(),
                  "verses":verses_json}
        return self.return_success(result)
