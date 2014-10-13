from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain.user.models import User
from verserain import settings
import pymongo

class Version(BaseModel):
    class Meta:
        collection = "version"

        indices = (
            Index("name",unique=False),
            Index("language",unique=False)
        )

class Commentary(BaseModel):
    collection = "commentary"
    
    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        return new_instance


class VerseSet(BaseModel):
    class Meta:
        collection = "verseset"
        
        indices = (
            Index("name",unique=False),
            Index("language",unique=False),
            Index("user_id",unique=False),
            Index("hotness",unique=False)
        )

    def device_url(self, session_key=None):
        url = "verserain://com.hopeofglory.verserain/verseset/%s/%s/%s" % (self._id, settings.SITE_DOMAIN, session_key)
        return url

    def calculate_hotness(self):
        age = self.age().total_seconds()
        days = (age / 86400.0)
        if days < 1:
            days = 1
        hotness = self.play_count() / days
        self["hotness"] = hotness
            
    def json(self):
        j = super(VerseSet, self).json()
        j["verse_count"] = self.verse_count()
        return j

    def save(self, *args, **kwargs):
        self.calculate_hotness()
        super(VerseSet, self).save(*args, **kwargs)

    def __new__(cls, *args, **kwargs):
        from verserain.leaderboard.models import VersesetScore
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(User)
        cls.register_foreign_key(Verse,one_to_many=True)
        cls.register_foreign_key(VersesetScore,one_to_many=True)
        cls.register_foreign_key(Commentary)
        return new_instance

    def set_commentary_text(self, text):
        commentary = self.commentary()
        if commentary is None:
            if text == "":
                return
            commentary = Commentary(verseset_id=self._id)

        commentary["text"] = text
        commentary["verseset_id"] = self._id
        commentary.save()
        if self.get("commentary_id") != commentary._id:
            self["commentary_id"] = commentary._id
            self.save()
    
    def get_commentary_text(self):
        if self.has_key("commentary_id"):
            commentary = self.commentary()
            if commentary:
                return commentary["text"]
        return ""
    
    def url(self):
        return "/verseset/show/%s" % str(self._id)

    def play_count(self):
        return self.get("play_count",0)

    def sorted_verses(self):
        verses = self.verses()
        return verses.sort("order", pymongo.ASCENDING)

    def update_verse_count(self, count=None):
        old_count = self.verse_count()
        if count:
            self["verse_count"] = count
        else:
            self["verse_count"] = len(list(self.verses()))
        if old_count != self["verse_count"]:
            self.save()

    def verse_count(self):
        return int(self.get("verse_count",0))

    def remove(self, *args, **kwargs):
        for verse in self.verses():
            verse.remove()

        for score in self.versesetscores():
            score.remove()

        commentary = self.commentary()
        if commentary:
            commentary.remove()
        super(VerseSet, self).remove(*args, **kwargs)

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

    def device_url(self, session_key=None):
        url = "verserain://com.hopeofglory.verserain/verse/%s/%s/%s" % (self._id, settings.SITE_DOMAIN, session_key)
        return url

    def remove(self, *args, **kwargs):
        super(Verse, self).remove(*args, **kwargs)

    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(User)
        cls.register_foreign_key(Version)
        return new_instance

