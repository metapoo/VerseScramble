import os

VERSERAIN_ENV = os.environ.get("VERSERAIN_ENV","development")
if VERSERAIN_ENV == "development":
    SITE_DOMAIN = "dev.verserain.com"
    IP_ADDRESS = "198.61.178.86"
    MAIL_DOMAIN = SITE_DOMAIN
else:
    SITE_DOMAIN = "www.verserain.com"
    MAIL_DOMAIN = "verserain.com"
    IP_ADDRESS = "162.242.175.244"

SITE_URL = "http://%s/" % SITE_DOMAIN

ADMIN_EMAIL = "admin@%s" % MAIL_DOMAIN
MONGODB_HOST = "localhost"
MONGODB_PORT = 27017
MONGODB_USERNAME = "admin"
MONGODB_PASSWORD = "teaegg123"
MONGODB_DATABASE = "verserain"
SECRET_KEY = "X6yFzlxbSkyB7wjn/dHC49UGP10c7kj0uBj55zORhBw="
FACEBOOK_API_KEY = "1439577092991935"
LATEST_VERSION = 1.0
IOS_APPSTORE_URL = "https://itunes.apple.com/us/app/verse-rain-fun-bible-verse/id928732025?ls=1&mt=8"
GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.hopeofglory.verserain"
