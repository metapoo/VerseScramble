import os
from verserain.translation.models import *

def import_translation(language):
    path = "%s/git/VerseScramble/Assets/Resources/Languages" % os.environ["HOME"]
    filename = "%s/%s.txt" % (path, language)
    f = open(filename)

    i = 0
    for line in f:
        if i % 2 == 0:
            msgid = line.split("msgid \"")[1][0:-2]
        else:
            msgstr = line.split("msgstr \"")[1][0:-2]
            translation = Translation.translate(language,msgid,msgstr)
            print translation

        i += 1

for l in ("ko","ja","zh-hant","zh-hans","ru","mn","en"):
    import_translation(l)
