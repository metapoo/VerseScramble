from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain.user.models import User

class Version(BaseModel):
    class Meta:
        collection = "version"

        indices = (
            Index("name",unique=False),
            Index("language",unique=False)
        )

class VerseSet(BaseModel):
    class Meta:
        collection = "verseset"
        
        indices = (
            Index("name",unique=False),
            Index("language",unique=False),
            Index("user_id",unique=False)
        )

    
class Verse(BaseModel):
    class Meta:
        collection = "verse"

        indices = (
            Index("reference",unique=False),
            Index("language",unique=False),
            Index("version_id",unique=False),
            Index("verseset_id",unique=False),
            Index("user_id",unique=False)
        )


