from verserain.mongo.models import BaseModel
from minimongo import Index
import pymongo
from datetime import datetime

class Translation(BaseModel):
    class Meta:
        collection = "translation"
        
        indices = (
            Index("msgid"),
            Index("language"),
        )

    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        return new_instance

    @classmethod
    def translate(cls, language, msgid, msgstr):
        translation = Translation.collection.find_one({'language':language,'msgid':msgid})
        if translation is None:
            translation = Translation({'language':language,'msgid':msgid})
        translation['msgstr'] = msgstr
        translation.save()
        return translation
