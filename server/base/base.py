from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.verse.models import *
from verserain.email.models import *
from verserain import settings

def get_handlers():
    return ((r"/?", FrontPageHandler),
            (r"/privacy/?", PrivacyPageHandler),
            (r"/search/?", SearchPageHandler),
            (r"/contact/submit/?", ContactHandler),
            (r"/contact/?", ContactPageHandler),
    )

class PrivacyPageHandler(BaseHandler):
    def get(self):
        self.render("privacy.html", selected_nav="about")

class FrontPageHandler(BaseHandler):
    def get(self, path=None):
        self.redirect("/versesets")
        
class SearchPageHandler(BaseHandler):
    def get(self):
        self.render("search.html", selected_nav="search")

class ContactPageHandler(BaseHandler):
    def get(self):
        message_sent = self.get_boolean_argument("message_sent",False)
        self.render("contact.html", selected_nav="about", message_sent=message_sent)

class ContactHandler(BaseHandler):
    def post(self):
        import smtplib
        from_email = "admin@%s" % settings.MAIL_DOMAIN
        reply_to_email = self.get_argument("email")
        to_email = ["help@%s" % settings.MAIL_DOMAIN] # must be a list
        subject = self.get_argument('subject')
        message = self.get_argument('message')
        EmailQueue.queue_mail(from_email,to_email,subject,message,reply_to=reply_to_email)

        self.redirect("/contact?message_sent=True")
