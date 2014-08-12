from minimongo import Model
from minimongo import configure
from verserain import settings
configure(settings)

class BaseModel(Model):
    _metadata = {}

    @classmethod
    def metadata(cls, attrname):
        clsname = cls.__name__
        if clsname not in cls._metadata.keys():
            cls._metadata[clsname] = {'foreign_keys': []}

        return cls._metadata[clsname][attrname]

    @classmethod
    def register_foreign_key(cls, model, name=None, attrname=None, keyname=None, one_to_many=False, required=False):
        if name is None:
            name = model.__name__.lower()

        plural_name = "%ss" % name

        def child_getter(self):
            return self.get_child(model, name=name, attrname=attrname, keyname=keyname)

        def children_getter(self,  **kwargs):
            return self.get_children(model, keyname=keyname, **kwargs)

        def add_foreign_key(getter):
            fkey_data = {'get_func': getter,
                         'required': required}
            cls.metadata('foreign_keys').append(fkey_data)

        if one_to_many:
            if not hasattr(cls, plural_name):
                setattr(cls, plural_name, children_getter)
                add_foreign_key(children_getter)
        else:
            if not hasattr(cls, name):
                setattr(cls, name, child_getter)
                add_foreign_key(child_getter)

    @classmethod
    def key_name(cls):
        return "%s_id" % cls.__name__.lower()


    def get_children(self, model, keyname=None, **kwargs):
        cls = self.__class__
        if keyname is None:
            keyname = cls.key_name()
        params = {keyname: self._id}
        params.update(kwargs)
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
