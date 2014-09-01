from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *

def get_handlers():
    return ((r"/?", FrontPageHandler),
            )

class FrontPageHandler(BaseHandler):
    def get(self, path=None):
        user = self.current_user
        selected_nav = "all sets"
        
        versesets = list(VerseSet.collection.find())
        context = {"selected_nav": selected_nav}
        return self.render("verseset/list.html", user=user, versesets=versesets, context=context)
        
