from verserain.base import base
from verserain.login import login, api as login_api
from verserain.verse import verse, api as verse_api
from verserain.leaderboard import api as leaderboard_api
from verserain.leaderboard import leaderboard
from verserain.profile import profile
from verserain.page import page

def get_handlers():
    handlers = []
    mods = [base,login,verse, verse_api, page, login_api, leaderboard_api,
            leaderboard, profile]

    for mod in mods:
        handlers.extend(mod.get_handlers())

    return handlers


