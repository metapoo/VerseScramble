#!/usr/bin/python
from verserain.verse.models import *
from verserain.utils.text import *

for v in Verse.collection.find():
    text = process_verse(v['reference'], v['text'])
    if v['text'] != text:
        print v['text']
        print text
        v['text'] = text
        v.save()
