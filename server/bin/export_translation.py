import os
from verserain.translation.models import *
import sys

def export_translation(language):
    translations = Translation.collection.find({"language":language})
    for tran in translations:
        sys.stdout.write("msgid \"%s\"\nmsgstr \"%s\"\n" % (tran['msgid'], tran['msgstr']))

export_translation("en")
