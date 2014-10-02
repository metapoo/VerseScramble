from verserain.base import base
from verserain.login import login, api as login_api
from verserain.verse import verse, api as verse_api
from verserain.page import page

def get_handlers():
    handlers = []
    mods = [base,login,verse, verse_api, page, login_api]

    for mod in mods:
        handlers.extend(mod.get_handlers())

    return handlers


