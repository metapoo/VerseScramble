from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.page.models import *

def get_handlers():
    return ((r"/home/?", HomePageHandler),
            (r"/page/edit/?", EditPageHandler),
            (r"/page/home/?", HomePageHandler),
            (r"/page/update/?", UpdatePageHandler),
            )

class EditPageHandler(BaseHandler):
    def get(self):
        selected_nav = "home"
        context = {"selected_nav":selected_nav}
        page = Page.collection.find_one(name="home")
        name = self.get_argument("name", "home")
        return self.render("page/edit.html", context=context, page=page, name=name)

class UpdatePageHandler(BaseHandler):
    def get(self):
        name = self.get_argument("name")
        content = self.get_argument("content")
        page = Page.collection.find_one(name=name)
        if page is None:
            page = Page(name="name",content=content)
        else:
            page["content"] = content
        page.save()
        return self.redirect("/page/%s" % name)

class HomePageHandler(BaseHandler):
    def get(self):
        selected_nav = "home"
        context = {"selected_nav":selected_nav}
        page = Page.collection.find_one(name="home")
        return self.render("page/home.html", context=context, page=page)

