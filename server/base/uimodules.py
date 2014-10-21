import tornado.web
from verserain.translation.localization import *

class ProfilePhoto(tornado.web.UIModule):
    def render(self, user=None, current_user=None, gt=None):
        return self.render_string("profile/photo.html",
                                  user=user, current_user=current_user, gt=gt)

class LanguageUrl(tornado.web.UIModule):
    def render(self, uri=None, language_code=None):
        if ("/versesets/popular" in uri):
            return "/versesets/popular/%s" % language_code
        elif ("/versesets/new" in uri):
            return "/versesets/new/%s" % language_code
        elif ("/versesets" in uri):
            return "/versesets/popular/%s" % language_code
        elif ("/about" in uri):
            return "/about/%s" % language_code
        elif ("/translation" in uri):
            return "/translation/%s" % language_code

        if "?" in uri:
            sep = "&"
        else:
            sep = "?"

        return "%s%sl=%s" % (uri,sep,language_code)

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
    def render(self, scores=None, start_index=0, gt=None):
        return self.render_string("scores/table.html",scores=scores, start_index=start_index, gt=gt)

class VerseSetsTable(tornado.web.UIModule):
    def render(self, versesets=None, paginator=None, language_code=None, start_index=0, gt=None):
        return self.render_string("verseset/table.html",
                                  versesets=versesets,
                                  paginator=paginator,
                                  language_code=language_code,
                                  start_index=start_index,
                                  gt=gt
        )
