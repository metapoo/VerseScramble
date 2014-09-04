import os

VERSERAIN_ENV = os.environ.get("VERSERAIN_ENV","development")
if VERSERAIN_ENV == "development":
    SITE_DOMAIN = "verserain.eternityinourheart.com"
#    SITE_DOMAIN = "dev.verserain.com"
else:
    SITE_DOMAIN = "www.verserain.com"
SITE_URL = "http://%s/" % SITE_DOMAIN

MONGODB_HOST = "localhost"
MONGODB_PORT = 27017
MONGODB_USERNAME = "admin"
MONGODB_PASSWORD = "teaegg123"
MONGODB_DATABASE = "verserain"
SECRET_KEY = "X6yFzlxbSkyB7wjn/dHC49UGP10c7kj0uBj55zORhBw="
FACEBOOK_API_KEY = "1439577092991935"
LATEST_VERSION = 1.0
