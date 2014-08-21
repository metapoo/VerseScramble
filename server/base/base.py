from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *

def get_handlers():
    return ((r"/?", FrontPageHandler),
            )

class FrontPageHandler(BaseHandler):
    def get(self, path=None):
        user = self.current_user
        
        versesets = list(VerseSet.collection.find())

        return self.render("index.html", user=user, versesets=versesets)
        
