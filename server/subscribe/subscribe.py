from verserain.base.handler import BaseHandler
from verserain.subscribe.models import *
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from verserain.utils.paging import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/subscribe/([^/]+)/?", SubscribeHandler),
            (r"/unsubscribe/([^/]+)/?", UnsubscribeHandler),
)

class UnsubscribeHandler(BaseHandler):
    @require_login
    def get(self, username=None):
        user = User.by_username(username)
        if user is None:
            return self.write("User not found")

        subscribe_url = self.get_argument("subscribe_url", "/u/%s" % username)
        subscription = Subscription.unsubscribe(user, self.current_user)

        self.redirect(subscribe_url)


class SubscribeHandler(BaseHandler):
    @require_login
    def get(self, username=None):
        user = User.by_username(username)
        if user is None:
            return self.write("User not found")

        subscribe_url = self.get_argument("subscribe_url", "/u/%s" % username)
        subscription = Subscription.subscribe(user, self.current_user)

        self.redirect(subscribe_url)
