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

class CommentaryMixin:
    def has_commentary(self):
        return self.has_key("commentary_id")

    def has_commentary_text(self):
        text = self.get_commentary_text()
        if text is None:
            return False
        text = text.strip()
        if text == "":
            return False
        return True

    def remove_commentary_text(self):
        if self.has_key('commentary_id'):
            commentary = Commentary.by_id(self["commentary_id"])
            if commentary:
                commentary.remove()
            del self["commentary_id"]
            self.save()

    def set_commentary_text(self, text):
        commentary = self.commentary()
        if commentary is None:
            if text == "":
                return
            commentary = Commentary(verseset_id=self._id)

        commentary["text"] = text
        if type(self) is Verse:
            attrname = "verse_id"
        else:
            attrname = "verseset_id"

        commentary[attrname] = self._id
        commentary.save()
        if self.get("commentary_id") != commentary._id:
            self["commentary_id"] = commentary._id
            self.save()

    def get_commentary_text(self):
        if self.has_commentary():
            commentary = self.commentary()
            if commentary:
                return commentary["text"]
        return ""

class Commentary(BaseModel):
    collection = "commentary"
    
    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(Verse)
        return new_instance


class VerseSet(BaseModel, CommentaryMixin):
    class Meta:
        collection = "verseset"
        
        indices = (
            Index("name",unique=False),
            Index("language",unique=False),
            Index("user_id",unique=False),
            Index("hotness",unique=False),
            Index("verse_count",unique=False),
            Index("published",unique=False),
            Index("play_count",unique=False),
        )

    def is_published(self):
        return self.get("published", False)

    def publish(self):
        self["published"] = True
        self.save()

    def unpublish(self):
        self["published"] = False
        self.save()

    def make_copy(self, user_id=None):
        vs = VerseSet(dict(self))
        del vs['_id']
        if vs.has_key('commentary_id'):
            del vs['commentary_id']
        if user_id:
            vs['user_id'] = user_id
        vs['play_count'] = 0
        vs['verse_count'] = 0
        vs.save()

        commentary = self.commentary()
        if commentary:
            vs.set_commentary_text(commentary['text'])

        for v in self.verses():
            v_copy = Verse(dict(v))
            commentary = v_copy.commentary()
            if commentary:
                v.set_commentary_text(commentary['text'])
            del v_copy['_id']
            v_copy['verseset_id'] = vs._id
            v_copy.save()
        return vs

    def device_url(self, session_key=None):
        url = "verserain://com.hopeofglory.verserain/verseset/%s/%s/%s" % (self._id, settings.SITE_DOMAIN, session_key)
        return url

    def calculate_hotness(self):
        age = self.age().total_seconds()
        days = (age / 86400.0)
        if days < 1:
            days = 1
        time_decay = 1.0 / (pow(days,1.2))
        hotness = self.play_count() * time_decay * min(5, self.verse_count())
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
        from verserain.comment.models import Comment
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(User)
        cls.register_foreign_key(Verse,one_to_many=True)
        cls.register_foreign_key(VersesetScore,one_to_many=True)
        cls.register_foreign_key(Commentary)
        cls.register_foreign_key(Comment,one_to_many=True)
        return new_instance

    def url(self):
        return "/verseset/show/%s" % str(self._id)

    def play_url(self):
        return "/verseset/play/%s" % str(self._id)

    def play_count(self):
        return self.get("play_count",0)

    def sorted_verses(self):
        verses = self.verses()
        verses = list(verses.sort("order", pymongo.ASCENDING))
        i = 1
        for v in verses:
            if i != v.order():
                v["order"] = i
                v.save()
            i += 1
        return verses

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

class Verse(BaseModel, CommentaryMixin):
    class Meta:
        collection = "verse"

        indices = (
            Index("reference",unique=False),
            Index("language",unique=False),
            Index("version_id",unique=False),
            Index("verseset_id",unique=False),
            Index("user_id",unique=False)
        )

    def fix_text(self):
        from verserain.utils.text import process_verse
        text = process_verse(self['reference'], self['text'])
        if text != self['text']:
            self['text'] = text
            self.save()
            return text
        return None

    def order(self):
        return self.get("order",-1)

    def device_url(self, session_key=None):
        url = "verserain://com.hopeofglory.verserain/verse/%s/%s/%s" % (self._id, settings.SITE_DOMAIN, session_key)
        return url

    def remove(self, *args, **kwargs):
        commentary = self.commentary()
        if commentary:
            commentary.remove()

        super(Verse, self).remove(*args, **kwargs)

    def __new__(cls, *args, **kwargs):
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        cls.register_foreign_key(VerseSet)
        cls.register_foreign_key(User)
        cls.register_foreign_key(Version)
        cls.register_foreign_key(Commentary)
        return new_instance

