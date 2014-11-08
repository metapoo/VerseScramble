import simplejson
import logging
from verserain import settings
from simplejson import encoder

_ARG_DEFAULT = []

class ApiMixin:
    api_name = "unknown"

    def get_binary_argument(self, name, default=_ARG_DEFAULT):
        value = None

        for v in self.request.arguments.get(name, []):
            value = v

        if value is None:
            if default is _ARG_DEFAULT:
                from tornado.web import MissingArgumentError
                raise MissingArgumentError(name)
            return default

        return value

    def return_error(self, message, mimetype="text/plain", send_mail=True):
        if send_mail:
            logging.error(message)
            pass

        response_dict = {'status': 'Error',
                         'message': message,
                         'result': None,
                         'api_name': self.api_name,
                         }
        response = simplejson.dumps(response_dict)
        self.write(response)
        self.finish()

    def return_success(self, result, mimetype="text/plain"):
        response_dict = {'status': 'OK',
                         'message': None,
                         'result': result,
                         'api_name': self.api_name,
                         'latest_version': settings.LATEST_VERSION,
                         }
        encoder.FLOAT_REPR = lambda o: format(o, '.3f')
        response = simplejson.dumps(response_dict, use_decimal=True)
        self.write(response)
        self.finish()
