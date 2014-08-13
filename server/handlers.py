from verserain.base import base
from verserain.login import login
from verserain.verse import verse

def get_handlers():
    handlers = []
    mods = [base,login,verse]

    for mod in mods:
        handlers.extend(mod.get_handlers())

    return handlers


