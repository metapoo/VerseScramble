from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.page.models import *

def get_handlers():
    return ((r"/about/([^/]+)/?", AboutPageHandler),
            (r"/about/?", AboutPageHandler),
            (r"/page/edit/([^/]+)/?", EditPageHandler),
            (r"/page/about/([^/]+)/?", AboutPageHandler),
            (r"/page/update/?", UpdatePageHandler),
            )

class EditPageHandler(BaseHandler):
    def get(self, language=None):
        selected_nav = "about"
        page = Page.collection.find_one({"name":"about","language":language})
        name = self.get_argument("name", "about")
        return self.render("page/edit.html", selected_nav=selected_nav, page=page, name=name,
                           language_code=language)

class UpdatePageHandler(BaseHandler):
    def post(self):
        if not self.current_user.is_admin():
            return self.write("not authorized")

        language = self.get_argument("language")
        name = self.get_argument("name")
        content = self.get_argument("content")
        page = Page.collection.find_one({"name":name,"language":language})
        if page is None:
            page = Page(name="about",content=content,language=language)
        else:
            page["content"] = content
        page.save()
        return self.redirect("/page/%s/%s" % (name, language))

class AboutPageHandler(BaseHandler):
    def get(self, language=None):
        if language is None:
            language = self.language_code()

        selected_nav = "about"
        page = Page.collection.find_one({"name":"about","language":language})

        if language != "en":
            if page is None:
                page = Page.collection.find_one({"name":"about","language":"en"})

        return self.render("page/about.html", selected_nav=selected_nav, page=page, language_code=language,
                           )

