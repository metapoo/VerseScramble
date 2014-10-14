from verserain.verse.models import *
from verserain.user.models import *

import pymongo

users = User.collection.find()

for user in users:
    user.compute_total_score()
    print user
