from verserain.base.handler import BaseHandler

def get_handlers():
    return ((r"/?", FrontPageHandler),
            )

class FrontPageHandler(BaseHandler):
    def get(self, path=None):
        return self.render("index.html")
