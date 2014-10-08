import tornado.web

class UserLink(tornado.web.UIModule):
    def render(self, user=None, username=None):
        if username is None:
            username = user['username']
        return "<a class='link' href='/u/%s'>%s</a>" % (username, username)
