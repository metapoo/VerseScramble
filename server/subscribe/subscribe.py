from verserain.base.handler import BaseHandler
from verserain.subscribe.models import *
from verserain.login.auth import *
from tornado.auth import FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from tornado.escape import *
from verserain.utils.paging import *
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/subscribe/([^/]+)/?", SubscribeHandler),
            (r"/unsubscribe/([^/]+)/?", UnsubscribeHandler),
            (r"/u/([^/]+)/subscriptions/?", SubscriptionsHandler),
            (r"/u/([^/]+)/subscribers/?", SubscribersHandler),
)

class SubscriptionsHandler(BaseHandler):
    def get(self, username):
        username = url_unescape(username)
        viewed_user = User.by_username(username)
        if not viewed_user:
            return self.write("user not found")
        subscriptions = list(Subscription.collection.find({"subscriber_id":viewed_user._id}))
        user_ids = [sub.user_id for sub in subscriptions]
        users = list(User.collection.find({"_id":{"$in":user_ids}}))

        self.render("profile/subscriptions.html", users=users,
                    selected_nav="profile", selected_subnav="subscriptions",
                    viewed_user=viewed_user)

class SubscribersHandler(BaseHandler):
    def get(self, username):
        username = url_unescape(username)
        viewed_user = User.by_username(username)
        if not viewed_user:
            return self.write("user not found")
        subscriptions = list(Subscription.collection.find({"user_id":viewed_user._id}))
        user_ids = [sub.subscriber_id for sub in subscriptions]
        users = list(User.collection.find({"_id":{"$in":user_ids}}))

        self.render("profile/subscriptions.html", users=users,
                    selected_nav="profile", selected_subnav="subscribers",
                    viewed_user=viewed_user)

class UnsubscribeHandler(BaseHandler):
    @require_login
    def get(self, username=None):
        if username:
            username = url_unescape(username)
        user = User.by_username(username)
        if user is None:
            return self.write("User not found")

        subscribe_url = self.get_argument("subscribe_url", "/u/%s" % username)
        subscription = Subscription.unsubscribe(user, self.current_user)

        self.redirect(subscribe_url)


class SubscribeHandler(BaseHandler):
    @require_login
    def get(self, username=None):
        if username:
            username = url_unescape(username)
        user = User.by_username(username)
        if user is None:
            return self.write("User not found")

        subscribe_url = self.get_argument("subscribe_url", "/u/%s" % username)
        subscription = Subscription.subscribe(user, self.current_user)

        self.redirect(subscribe_url)
