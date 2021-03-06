import tornado.web

from verserain.user.models import User
from verserain import settings
from verserain.translation.localization import *


class BaseHandler(tornado.web.RequestHandler, TranslationManager):
    cookieless_okay = False

    def language_uri(self, uri=None):
        if uri is None:
            uri = self.request.uri

        l = None

        if ("/versesets/popular" in uri):
            l = "/versesets/popular/%s"
        elif ("/versesets/new" in uri):
            l = "/versesets/new/%s"
        elif ("/versesets" in uri):
            l = "/versesets/popular/%s"
        elif ("/about" in uri):
            l = "/about/%s"
        elif ("/translation" in uri):
            l = "/translation/%s"
        
        if l is None:
            l = uri.split("?")[0]

        l = "%s?l=%s" % (l,"%s")
        
        return l

    def send_verify_email(self):
        from verserain.email.models import EmailQueue
        user = self.current_user
        if user is None or (user.email() is None):
            return

        email = user['email']
        subject = "%s" % (self.gt("Verify Email"),)
        hash_code = user.email_hash()
        verify_url = "https://%s/profile/verify_email/verify?h=%s&s=%s" % (settings.SITE_DOMAIN,
                                                                          hash_code, user.session_key())
        message, html = self.get_email_message("verify_email", verify_url=verify_url, user=user)
        
        EmailQueue.queue_mail(settings.ADMIN_EMAIL, email, subject, message, html=html)

    def get_email_message(self, email_name, **kwargs):
        kwargs["gt"] = self.gt

        def get_message(lang_code, text_type="txt"):
            message = self.render_string("emails/%s/%s.%s" % (lang_code, email_name, text_type),
                                         **kwargs)
            return message

        message = get_message("en", "txt")
        html = get_message("en", "html")

        return message, html

    def _handle_request_exception(self, exc):
        super(BaseHandler, self)._handle_request_exception(exc)
        from verserain.utils.mail import report_exception
        report_exception(handler=self)

    def isDevelopment(self):
        return settings.VERSERAIN_ENV == "development"

    def isSecure(self):
        return self.request.headers.get('X-Forwarded-Protocol','https') == 'https'

    def current_url(self, protocol="http", args=True):
        uri = self.request.uri
        if not args:
            if "?" in uri:
                uri = uri.split("?")[0]

        url = "%s://%s%s" % (protocol,settings.SITE_DOMAIN,uri)
        return url

    def redirectWithProtocol(self, uri=None, protocol="http"):
        if uri is None:
            uri = self.request.uri

        url = "%s://%s%s" % (protocol,settings.SITE_DOMAIN,uri)
        self.redirect(url)

    def redirectHttps(self, uri=None):
        self.redirectWithProtocol(uri=uri,protocol="https")

    def redirectHttp(self, uri=None):
        self.redirectWithProtocol(uri=uri,protocol="http")

    def user_agent(self):
        return self.request.headers.get('User-Agent','')

    def isIOS(self):
        if self.get_argument("test_ios", False):
            return True

        user_agent = self.user_agent()
        
        if ("iPod" in user_agent) or ("iPhone" in user_agent) or ("iPad" in user_agent):
            return True
        return False

    def isIE(self):
        return "MSIE" in self.user_agent()

    def isFirefox(self):
        return "Firefox/" in self.user_agent()

    def isChrome(self):
        return "Chrome/" in self.user_agent()

    def isSafari(self):
        return (not self.isChrome()) and ("Safari/" in self.user_agent())

    def isMacOS(self):
        return "Macintosh" in self.user_agent()

    def isWindows(self):
        return "Windows" in self.user_agent()

    def isAndroid(self):
        if self.get_argument("test_android", False):
            return True
        user_agent = self.user_agent()
        if ("Android" in user_agent):
            return True
        return False

    def get(self):
        return self.post()

    def post(self):
        return self.get()

    def authenticate_session_key(self, session_key):
        from verserain.login.auth import authenticate_session_key
        user_key = authenticate_session_key(session_key)
        return user_key

    def authenticate_login(self, fb_uid, email=None, password=None):
        from verserain.login.auth import authenticate_login
        current_user = authenticate_login(fb_uid=fb_uid, email=None, password=None)
        return current_user

    def check_session_key_url_redirect(self):
        session_key = self.get_argument('session_key', None)

        if session_key is None:
            session_key = self.get_argument('s',None)

        if session_key is None:
            return False

        user_id = self.authenticate_session_key(session_key)

        if user_id and session_key:
            self.set_secure_cookie('session_key', session_key)
            self.redirect(self.current_url(args=False))
            return True

        return False

    def get_current_user(self, cookieless_okay=False):
        session_key = self.get_argument('session_key', None)

        if session_key is None:
            session_key = self.get_argument('s',None)

        if (not cookieless_okay) and self.cookieless_okay:
            cookieless_okay = True

        if session_key is None:
            session_key = self.get_secure_cookie('session_key')

        user_id = self.authenticate_session_key(session_key)

        if user_id and session_key:
            self.set_secure_cookie('session_key', session_key)

        if not user_id:
            if cookieless_okay:
                return self.get_current_user_cookieless()
            else:
                return None

        user = User.collection.find_one({'_id':user_id})

        if not user:
            if cookieless_okay:
                return self.get_current_user_cookieless()
            else:
                return None

        # save ip
        ip = self.request.remote_ip
        if user.get('ip') != ip:
            user['ip'] = ip
            user.save()

        return user

    def language_code(self, not_all=False):
        if self.current_user:
            if self.current_user.has_key("language"):
                return self.current_user["language"]
        language_code = self.get_cookie("language_code",self.default_language())
        if not_all and (language_code.lower() == "all"):
            return self.default_language()
        return language_code

    def set_language(self, language_code):
        self.set_cookie("language_code", language_code)
        self.set_current_language(language_code)
        if self.current_user:
            self.current_user.set_language(language_code)

    def get_locale(self):
        accept_language = self.request.headers.get('Accept-Language','en-us').lower()
        parts = accept_language.split(",")
        return parts[0]

    def country(self):
        locale_parts = self.get_locale().split("-")
        if len(locale_parts) > 1:
            return locale_parts[1].lower()
        else:
            return "us"

    def default_language(self):
        locale = self.get_locale()
        if locale == "zh-cn":
            language = "zh-hans"
        elif locale == "zh-tw":
            language = "zh-hant"
        elif locale == "zh-hk":
            language = "zh-hant"
        else:
            language = locale.split("-")[0]
        return language

    def render(self, *args, **kwargs):
        l = self.get_argument("l", None)

        if l:
            language_code = l
            self.set_language(l)
        else:
            language_code = self.language_code()

        self.set_current_language(language_code)

        kwargs['current_url'] = self.current_url()
        kwargs['gt'] = self.__class__.gt
        kwargs['user'] = self.current_user
        kwargs['isIOS'] = self.isIOS()
        kwargs['isAndroid'] = self.isAndroid()
        kwargs['settings'] = settings
        kwargs['request'] = self.request
        kwargs['current_language'] = language_code
        kwargs['locale'] = self.get_locale()
        kwargs['country'] = self.country()

        if not kwargs.has_key('language_uri'):
            kwargs['language_uri'] = self.language_uri()

        if not kwargs.has_key('play_url'):
            kwargs['play_url'] = '/play'

        if not kwargs.has_key('error_message'):
            kwargs['error_message'] = None

        if not kwargs.has_key('context'):
            kwargs['context'] = {}

        selected_nav = kwargs.get('selected_nav')
        context = kwargs['context']
        
        if selected_nav is None:
            selected_nav = self.get_secure_cookie('selected_nav',None)
        else:
            self.set_secure_cookie('selected_nav',selected_nav)
        
        kwargs['selected_nav'] = selected_nav
        kwargs['translations'] = self.translations
        kwargs['translation_string_count'] = self.translation_string_count

        super(BaseHandler, self).render(*args, **kwargs)

    def get_argument(self, *args, **kwargs):
        try:
            return super(BaseHandler, self).get_argument(*args, **kwargs)
        except:
            return 

    def get_current_user_cookieless(self):
        fb_uid = self.get_argument("fb_uid", "unknown_fb_uid")
        return self.authenticate_login(fb_uid=fb_uid, email=None, password=None)

    def get_boolean_argument(self, key, default=False):
        arg = self.get_argument(key, default)
        if type(arg) is bool:
            return arg
        else:
            return (arg.lower() == "true")

    def get_int_argument(self, key, default=0):
        arg = self.get_argument(key, default)
        if type(arg) is basestring:
            args = args.replace("/","")

        arg = int(arg)
        return arg

    def get_float_argument(self, key, default=0):
        arg = self.get_argument(key, default)
        arg = float(arg)
        return arg

    def head(self, *args, **kwargs):
        return
