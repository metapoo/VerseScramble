from verserain.verse.models import *

vs = VerseSet.collection.find({"verse_count":{"$gte":2}})
for v in vs:
    v.publish()
    print v
