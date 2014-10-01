#!/usr/local/bin/python
from verserain.verse.models import *

def update_hotness():
    vs=VerseSet.collection.find()

    for v in vs:
        v.calculate_hotness()
        v.save()

if __name__ == '__main__':
    update_hotness()
