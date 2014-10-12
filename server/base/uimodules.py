import tornado.web

class PlayButton(tornado.web.UIModule):
    def render(self, verseset=None, verseset_id=None):
        if verseset_id is None:
            verseset_id = verseset._id

        return """<a class="play_button pure-button button-xsmall next" href="/verseset/play/%s" >&#9658</a>""" % verseset_id

class UserLink(tornado.web.UIModule):
    def render(self, user=None, username=None):
        if username is None:
            username = user['username']
        return "<a class='link' href='/u/%s'>%s</a>" % (username, username)

class Paginator(tornado.web.UIModule):
    def render(self, paginator=None, base_url=None):
        return self.render_string("paginator.html",
                                  paginator=paginator,
                                  base_url=base_url,
        )

class VerseSetLink(tornado.web.UIModule):
    def render(self, verseset=None, verseset_id=None, verseset_name=None):
        if verseset_id is None:
            verseset_id = verseset._id
        if verseset_name is None:
            verseset_name = verseset['name']
        return "<a class='link' href='/verseset/show/%s'>%s</a>" % (verseset_id, verseset_name)

class ScoresTable(tornado.web.UIModule):
    def render(self, scores=None, start_index=0):
        return self.render_string("scores/table.html",scores=scores, start_index=start_index)

class VerseSetsTable(tornado.web.UIModule):
    def render(self, versesets=None, paginator=None, language_code=None, start_index=0):
        return self.render_string("verseset/table.html",
                                  versesets=versesets,
                                  paginator=paginator,
                                  language_code=language_code,
                                  start_Index=start_index
        )
