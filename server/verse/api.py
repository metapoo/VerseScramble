from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.language import *
from verserain.verse.models import *
from verserain.api.api import *
from bson.objectid import ObjectId

def get_handlers():
    return ((r"/api/verse/show", ShowVerseApiHandler),
            )

class ShowVerseApiHandler(BaseHandler, ApiMixin):
    def get(self):
        verse_id = self.get_argument("verse_id")
        verse_id = ObjectId(verse_id)
        verse = Verse.collection.find_one({'_id':verse_id})
        if verse is None:
            self.return_error("verse not found")
        self.return_success(verse.json())

