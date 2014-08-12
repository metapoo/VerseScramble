from minimongo import Model
from minimongo import configure
from verserain import settings
configure(settings)

class BaseModel(Model):
    @classmethod
    def key_name(cls):
        return "%s_id" % cls.__name__.lower()


    def get_children(self, model, keyname=None, **kwargs):
        cls = self.__class__
        if keyname is None:
            keyname = cls.key_name()
        params = {keyname: self._id}
        children = model.collection.find(params)
        return children

    def get_child(self, model, name=None, attrname=None, keyname=None):
        if name is None:
            name = model.__name__.lower()

        if attrname is None:
            attrname = "_%s" % name

        if keyname is None:
            keyname = model.key_name()

        if hasattr(self, attrname):
            r = getattr(self, attrname)
            if r:
                return r

        if self.get(keyname) is None:
            return None

        r = model.collection.find_one({'_id':self[keyname]})

        if r:
            setattr(self, attrname, r)
            return r

        return None
