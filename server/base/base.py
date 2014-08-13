from verserain.base.handler import BaseHandler

def get_handlers():
    return ((r"/?", FrontPageHandler),
            )

class FrontPageHandler(BaseHandler):
    def get(self, path=None):
        user = self.current_user
        if user is None:
            return self.render("index.html", user=user)
        
        versesets = list(user.versesets())

        return self.render("index.html", user=user, versesets=versesets)
        
