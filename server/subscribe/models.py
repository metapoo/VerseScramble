from verserain.mongo.models import BaseModel
from minimongo import Index
import pymongo
from datetime import datetime

class Subscription(BaseModel):
    class Meta:
        collection = "subscription"
        
        indices = (
            Index("user_id"),
            Index("subscriber_id"),
        )

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet
        from verserain.user.models import User
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(User)
        cls.register_foreign_key(User, keyname="subscriber_id", name="subscriber")
        return new_instance

    @classmethod
    def subscribe(cls, user, subscriber):
        subscription = cls.get_subscription(user, subscriber)
        if subscription is None:
            subscription = Subscription(user_id=user._id,subscriber_id=subscriber._id)
            subscription.save()
    
    @classmethod
    def get_subscription(cls, user, subscriber):
        subscription = Subscription.collection.find_one({"user_id":user._id,
                                                         "subscriber_id":subscriber._id})
        return subscription


    @classmethod
    def unsubscribe(cls, user, subscriber):
        subscription = cls.get_subscription(user, subscriber)
        if subscription:
            subscription.remove()
