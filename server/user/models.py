from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain.user.password import PasswordMixin

class User(BaseModel, PasswordMixin):
    class Meta:
        collection = "users"
        
        indices = (
            Index("email",unique=True),
            Index("fb_uid",unique=True),
        )
