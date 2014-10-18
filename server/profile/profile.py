from verserain.verse.models import *
from verserain.base.handler import BaseHandler
from verserain.leaderboard.models import *
from verserain.login.auth import *
from tornado.auth import GoogleMixin, FacebookGraphMixin
from tornado.web import asynchronous
from tornado.gen import coroutine
from verserain.api.api import *
from verserain.utils.paging import Pagination
from verserain.email.models import *
from verserain import settings
from bson.objectid import ObjectId
import pymongo

def get_handlers():
    return ((r"/u/([^/]+)/scores/?", ProfileListScoresHandler),
            (r"/u/([^/]+)/scores/(\d+)/?", ProfileListScoresHandler),
            (r"/u/([^/]+)/account/?", ProfileAccountHandler),
            (r"/u/([^/]+)/?$", ProfileOtherIndexHandler),
            (r"/profile/email/update/?", UpdateEmailHandler),
            (r"/profile/account/?", ProfileAccountHandler),
            (r"/profile/verify_email/send/?", SendVerifyEmailHandler),
            (r"/profile/verify_email/verify/?", ConfirmVerifyEmailHandler),
            (r"/profile/password/update/?", UpdatePasswordHandler),
            (r"/profile/?", ProfileIndexHandler),
    )


class AccountMixin:
    def render_account(self, error_message=None, feedback_message=None):
        user = self.current_user
        self.render("profile/account.html", viewed_user=user, selected_subnav="account",
                    error_message=error_message, feedback_message=feedback_message)

class UpdatePasswordHandler(BaseHandler, AccountMixin):
    def post(self):
        current_pw = self.get_argument("current_password", None)
        new_pw = self.get_argument("new_password")
        confirm_pw = self.get_argument("confirm_password")
        user = self.current_user
        error_message = None
        feedback_message = None

        if user.has_key("password") and (not user.check_password(current_pw)):
            error_message=self.gt("Current password doesn't match")
        elif new_pw != confirm_pw:
            error_message=self.gt("New and confirm password doesn't match")
        elif not new_pw:
            error_message=self.gt("New password cannot be empty")

        if not error_message:
            user.set_password(new_pw)
            user.save()
            feedback_message = self.gt("Password successfully changed")

        return self.render_account(error_message=error_message, feedback_message=feedback_message)

class ConfirmVerifyEmailHandler(BaseHandler, AccountMixin):
    def get(self):
        hash_code = self.get_argument("h")

        user = self.current_user
        
        if user is None or (user.email_hash() != hash_code):
            return self.render_account(error_message=self.gt("Sorry we failed to verify your email"))
        else:
            user["email_verified"] = True
            user.save()
            return self.render_account(feedback_message=self.gt("Your email has been verified!"))

class UpdateEmailHandler(BaseHandler, AccountMixin):
    @require_login
    def get(self):
        email = self.get_argument("email").lower().strip()
        user = self.current_user
        error_message = None
        if "@" not in email:
            error_message = self.gt("Invalid email")

        dupe = User.collection.find_one({"email":email})
        if dupe:
            error_message = self.gt("Email already exists")

        if error_message:
            return self.render_account(error_message=error_message)

        if email != user.email():
            user["email"] = email.lower()
            user["email_verified"] = False
            user.save()
        self.redirect("/profile/account")

class SendVerifyEmailHandler(BaseHandler, AccountMixin):
    @require_login
    def get(self):
        language_code = self.language_code()
        user = self.current_user
        if not user.email():
            return self.render_account(error_message=self.gt("Cannot verify empty email"))
        self.send_verify_email()
        return self.render_account(feedback_message=self.gt("Verification email has been sent"))

class ProfileAccountHandler(BaseHandler):
    @require_secure
    @require_login
    def get(self, username=None):
        user = self.current_user
        error_message = None
        feedback_message = None

        if not user.has_key('email'):
            feedback_message = self.gt("You should specify an email")
        elif not user.has_key('password'):
            feedback_message = self.gt("You should set a password")

        self.render("profile/account.html", viewed_user=user,
                    selected_nav="profile",
                    selected_subnav="account", error_message=error_message, 
                    feedback_message=feedback_message)

class ProfileOtherIndexHandler(BaseHandler):
    def get(self, username=None):
        user = User.collection.find_one({'username':username})
        
        if self.current_user and (user._id == self.current_user._id):
            self.redirect("/profile/account")
            return

        has_versesets = VerseSet.collection.find_one({'user_id':user._id}) is not None
        if has_versesets:
            self.redirect("/u/%s/versesets/"%username)
        else:
            self.redirect("/u/%s/scores/"%username)

class ProfileIndexHandler(BaseHandler):
    @require_login
    def get(self):
        self.redirect("/u/%s" % self.current_user['username'])

class ProfileListScoresHandler(BaseHandler):
    def get(self, username=None, page=1):
        page = int(page)
        per_page = 15
        start_index = (page-1)*per_page
        end_index = start_index + per_page
        base_url = "/u/%s/scores" % username

        viewed_user = User.collection.find_one({'username':username})

        if viewed_user is None:
            return self.write("user not found")

        scores = VersesetScore.collection.find({'user_id':viewed_user._id}).sort("last_played_date",pymongo.DESCENDING)
        total_count = scores.count()
        scores = scores[start_index:end_index]
        paginator = Pagination(page,per_page,total_count)

        self.render("profile/scores.html", selected_nav="profile", scores=scores,
                    viewed_user=viewed_user, paginator=paginator, selected_subnav="scores",
                    base_url=base_url)
                    
