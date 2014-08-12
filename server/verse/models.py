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

    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(User)
        cls.register_foreign_key(Verse,one_to_many=True)
        return new_instance


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
    
    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(User)
        cls.register_foreign_key(Version)
        return new_instance

