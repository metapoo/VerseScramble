from verserain.base import base
from verserain.login import login
from verserain.verse import verse, api as verse_api

def get_handlers():
    handlers = []
    mods = [base,login,verse, verse_api]

    for mod in mods:
        handlers.extend(mod.get_handlers())

    return handlers


