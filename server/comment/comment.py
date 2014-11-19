from verserain.base.handler import BaseHandler
from verserain.login.auth import *
from verserain.email.models import *
from verserain.utils.text import *
from verserain.verse.models import *
from verserain.comment.models import *
from verserain.user.models import *
from verserain import settings
from bson import objectid

import re

def get_handlers():
    return ((r"/comment/create/?", CreateCommentHandler),
)

class CreateCommentHandler(BaseHandler):
    @require_login
    def post(self):
        user = self.current_user
        text = self.get_argument("text")
        verseset_id = self.get_argument("verseset_id")
        reply_to_comment_id = self.get_argument("reply_to_comment_id",None)

        verseset = VerseSet.by_id(verseset_id)
        if verseset is None:
            self.write("verse set not found")
            return

        comment = Comment(verseset_id=verseset._id,
                          text=text,
                          user_id=user._id)
        comment.save()
        self.redirect(verseset.url()+"#comments")
