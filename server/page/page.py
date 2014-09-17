from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.page.models import *

def get_handlers():
    return ((r"/home/?", HomePageHandler),
            )

class HomePageHandler(BaseHandler):
    def get(self, path=None):
        selected_nav = "home"
        context = {"selected_nav":selected_nav}
        page = Page.collection.find_one(name="home")
        return self.render("home.html", context=context)

