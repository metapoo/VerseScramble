from verserain.mongo.models import BaseModel
from minimongo import Index
from verserain import settings

class FacebookMixin:
    def fb_user(self):
        from verserain.fb.models import FbUser
        fb_user = FbUser.collection.find_one({"id":self.get("fb_uid")})
        return fb_user

    def disconnect_fb(self):
        if self.has_key('fb_uid'):
            del self['fb_uid']
        if self.has_key('fb_pic_url'):
            del self['fb_pic_url']

        self.save()

    def handle_fb_user(self, fb_user):
        from verserain.fb.models import FbUser
        picture = fb_user.get('picture')
        email = fb_user.get('email')

        changed = False
        if picture:
            data = picture.get('data')
            if data:
                url = data.get('url')
                if self.get('fb_pic_url') != url:
                    self['fb_pic_url'] = url
                    changed = True

        if self.get('name') != fb_user.get('name'):
            self['name'] = fb_user.get('name')
            changed = True

        if self.get('fb_uid') != fb_user.get('id'):
            self['fb_uid'] = fb_user['id']
            changed = True

        if email and not self.has_key(email):
            from verserain.user.models import User
            user = User.collection.find_one({'email':email})
            email_exists = False
            if user:
                email_exists = True

            if not email_exists:
                self['email'] = email
                changed = True

        if changed:
            self.save()

        fbuser = self.fb_user()
        if fbuser:
            fbuser.update(fb_user)
            fbuser.save()
        else:
            fbuser = FbUser(fb_user)
            fbuser.save()

class FbUser(BaseModel):
    class Meta:
        collection = "fb_users"
        
        indices = (
            Index("id",unique=True),
        )

    def __new__(cls, *args, **kwargs):
        from verserain.verse.models import VerseSet, Verse
        new_instance = BaseModel.__new__(cls, *args, **kwargs)
        return new_instance

