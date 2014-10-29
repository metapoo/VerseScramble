from verserain.base import base
from verserain.login import login, api as login_api
from verserain.verse import verse, api as verse_api
from verserain.leaderboard import api as leaderboard_api
from verserain.leaderboard import leaderboard
from verserain.profile import profile
from verserain.profile import api as profile_api
from verserain.page import page
from verserain.translation import translation
from verserain.user import api as user_api
from verserain.play import play
from verserain.subscribe import subscribe
from verserain.fb import fb
from verserain.fb import api as fb_api

def get_handlers():
    handlers = []
    mods = [base,login,verse, verse_api, page, login_api, leaderboard_api,
            leaderboard, profile, profile_api, translation, play, user_api,
            fb, fb_api, subscribe]

    for mod in mods:
        handlers.extend(mod.get_handlers())

    return handlers


