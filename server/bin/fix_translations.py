#!/usr/local/bin/python
from verserain.translation.localization import *

for tran in Translation.collection.find():
    tran.save()
