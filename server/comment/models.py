from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain import settings
from hashlib import md5

class Comment(BaseModel):
    class Meta:
        collection = "verseset_comments"
        
        indices = (
            Index("user_id"),
            Index("verseset_id"),
            Index("reply_to_comment_id"),
        )

    def save(self, *args, **kwargs):
        super(Comment, self).save(*args, **kwargs)

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet
        from verserain.user.models import User
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(User)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(Comment,keyname="reply_to_comment_id")
        return new_instance

