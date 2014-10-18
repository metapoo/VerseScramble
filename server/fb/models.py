from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain import settings

class FbUser(BaseModel):
    class Meta:
        collection = "fb_users"
        
        indices = (
            Index("id",unique=True),
        )

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet, Verse
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        return new_instance

