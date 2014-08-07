from minimongo import Model
from minimongo import configure
from verserain import settings
configure(settings)

class BaseModel(Model):
    pass
