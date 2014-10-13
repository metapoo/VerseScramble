from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *

def get_handlers():
    return ((r"/?", FrontPageHandler),
            (r"/privacy/?", PrivacyPageHandler),
            (r"/search/?", SearchPageHandler),
            )

class PrivacyPageHandler(BaseHandler):
    def get(self):
        self.render("privacy.html")

class FrontPageHandler(BaseHandler):
    def get(self, path=None):
        self.redirect("/versesets")
        
class SearchPageHandler(BaseHandler):
    def get(self):
        self.render("search.html", selected_nav="search")
