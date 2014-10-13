from verserain.verse.models import *
import pymongo

vs = VerseSet.collection.find()

for verseset in vs:
    i = 1
    for verse in verseset.verses().sort("_id",pymongo.ASCENDING):
        verse["order"] = i
        verse.save()
        i += 1
        print verse
