from verserain.utils.encoding import smart_text

class PasswordMixin:
    def check_password(self, raw_password):
        if not self.has_key("password"):
            return False

        enc_password = self["password"]
        algo, salt, hsh = enc_password.split('$')
        return hsh == get_hexdigest(algo, salt, raw_password)

    def set_password(self, raw_password):
        import random
        algo = 'sha1'
        salt = get_hexdigest(algo, str(random.random()), str(random.random()))[:5]
        hsh = get_hexdigest(algo, salt, raw_password)
        self["password"] = '%s$%s$%s' % (algo, salt, hsh)

def get_hexdigest(algorithm, salt, raw_password):
    """                                                                                                                                                              
    Returns a string of the hexdigest of the given plaintext password and salt                                                                                       
    using the given algorithm ('md5', 'sha1' or 'crypt').                                                                                                            
    """
    import hashlib

    raw_password, salt = smart_text(raw_password), smart_text(salt)
    if algorithm == 'crypt':
        try:
            import crypt
        except ImportError:
            raise ValueError('"crypt" password algorithm not supported in this environment')
        return crypt.crypt(raw_password, salt)

    if algorithm == 'md5':
        return hashlib.md5(salt + raw_password).hexdigest()
    elif algorithm == 'sha1':
        return hashlib.sha1(salt + raw_password).hexdigest()
    raise ValueError("Got unknown password algorithm type in password.")



