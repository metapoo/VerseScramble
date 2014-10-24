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
            Index("lower_msgid"),
        )

    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        return new_instance

    def msgid(self):
        return self.get("msgid",None)

    def lower_msgid(self):
        return self.get("lower_msgid",None)

    def msgstr(self):
        return self.get("msgstr",None)

    def username(self):
        from verserain.user.models import User
        if self.has_key("user_id") and not self.has_key("username"):
            user = User.by_id(self["user_id"])
            self["username"] = user["username"]
            self.save()

        return self.get("username",None)

    def history(self):
        return self.get("history",[])

    def is_msgstr_duplicate(self, msgstr):
        if msgstr == self.msgstr():
            return True

        history = self.history()
        for (msgstr, username) in history:
            # already exists in history, ignore                                                                                                                                
            if msgstr == self.msgstr():
                return True

        return False

    def save_to_history(self):
        if self.msgstr() is None:
            return
        history = self.history()

        for revision in history:
            username = revision[1]
            if username == self.username():
                revision[0] = self.msgstr()
                return

        revision = (self.msgstr(),self.username())
        history.append(revision)
        self["history"] = history

    def sync_lower_msgid(self, save=True):
        lower_msgid = self.msgid().lower()
        if self.lower_msgid() != lower_msgid:
            self["lower_msgid"] = lower_msgid
            if save:
                self.save()
    def save(self, *args, **kwargs):
        self.sync_lower_msgid(save=False)
        super(Translation, self).save(*args, **kwargs)

    @classmethod
    def translate(cls, language, msgid, msgstr, username=None):
        translation = Translation.collection.find_one({'language':language,'lower_msgid':msgid.lower()})

        if translation is None:
            translation = Translation.collection.find_one({'language':language,'msgid':msgid})

        if translation is None:
            translation = Translation({'language':language,'msgid':msgid, 'lower_msgid':msgid.lower()})

        if not translation.is_msgstr_duplicate(msgstr):
            translation.save_to_history()

        if username:
            translation['username'] = username

        translation['msgid'] = msgid
        translation['msgstr'] = msgstr
        
        translation.save()
        return translation
