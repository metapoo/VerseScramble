from verserain.mongo.models import BaseModel
from minimongo import Index
import pymongo
from datetime import datetime
from verserain.utils.mail import *

class EmailQueue(BaseModel):
    class Meta:
        collection = "email_queue"
        
        indices = (
        )

    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        return new_instance

    @classmethod
    def queue_mail(cls, from_address, to_address, subject, message, reply_to=None):
        eq = EmailQueue(from_address=from_address,
                        to_address=to_address,
                        subject=subject,
                        message=message,
                        reply_to=reply_to)
        eq.save()
        return eq

    def send_mail(self, connection=None):
        send_mail(self.from_address,self.to_address,self.subject,self.message,self.reply_to,connection=connection)
        self.remove()

