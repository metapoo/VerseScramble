import os
from verserain.translation.models import *
from verserain.verse.language import *
from verserain.utils.encoding import *
import codecs
import sys

PATH = "%s/python/verserain/static/languages" % os.environ['HOME']


def export_translation(language):
    filename = "%s/%s.txt" % (PATH, language)
    translations = list(Translation.collection.find({"language":language}))
    if len(translations) == 0:
        return
    f = codecs.open(filename,"w","utf-8")
    for tran in translations:
        if tran.get('msgstr'):
            f.write("msgid \"%s\"\nmsgstr \"%s\"\n" % (tran['msgid'], tran['msgstr']))
    f.close()

for language in LANGUAGE_CODES:
    export_translation(language)
