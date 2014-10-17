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
        current_pw = self.get_argument("current_password")
        new_pw = self.get_argument("new_password")
        confirm_pw = self.get_argument("confirm_password")
        user = self.current_user
        error_message = None
        feedback_message = None

        if not user.check_password(current_pw):
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
        session_key = self.get_argument("s")
        hash_code = self.get_argument("h")

        if not self.current_user:
            self.current_user = User.by_id(authenticate_session_key(session_key))
            
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
        email = self.get_argument("email")
        user = self.current_user
        if email.lower() != user["email"].lower():
            user["email"] = email.lower()
            user["email_verified"] = False
            user.save()
        self.redirect("/profile/account")

class SendVerifyEmailHandler(BaseHandler, AccountMixin):
    @require_login
    def get(self):
        from hashlib import md5
        language_code = self.language_code()
        user = self.current_user
        email = user['email']
        subject = "%s: %s" % (self.gt("Verse Rain"), self.gt("Verify Email"))
        hash_code = user.email_hash()
        verify_url = "http://%s/profile/verify_email/verify?h=%s&s=%s" % (settings.SITE_DOMAIN,
                                                                        hash_code, user.session_key())
        message = self.get_email_message("verify_email", verify_url=verify_url, user=user)

        EmailQueue.queue_mail(settings.ADMIN_EMAIL, email, subject, message)
        return self.render_account(feedback_message=self.gt("Verification email has been sent"))

class ProfileAccountHandler(BaseHandler):
    @require_secure
    @require_login
    def get(self, username=None):
        user = self.current_user
        error_message = None
        self.render("profile/account.html", viewed_user=user,
                    selected_subnav="account", error_message=None, feedback_message=None)

class ProfileOtherIndexHandler(BaseHandler):
    def get(self, username=None):
        user = User.collection.find_one({'username':username})
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
                    
