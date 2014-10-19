#!/usr/bin/python
from verserain.verse.models import *
from verserain.utils.text import *

for v in Verse.collection.find():
    r = v.fix_text()
    if r :
        print r
