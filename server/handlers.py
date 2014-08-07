from verserain.base import base
from verserain.login import login

def get_handlers():
    handlers = []
    mods = [base,login]

    for mod in mods:
        handlers.extend(mod.get_handlers())

    return handlers


