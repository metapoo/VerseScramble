#!/usr/bin/python
from verserain.verse.models import *
from verserain.user.models import *
import pymongo

def update_rank():
    users = User.collection.find().sort("total_score",pymongo.DESCENDING)
    rank = 1
    for user in users:
        if not user.has_key('total_score'):
            continue
        if rank != user.get("rank"):
            user["rank"] = rank
            user.save()
        rank += 1

if __name__ == '__main__':
    update_rank()
