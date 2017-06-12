from verserain.verse.language import *

f = open("versions.txt")

CODE_BY_LANGUAGE = {v:k for k,v in LANGUAGE_BY_CODE.items()}

language = None
code = None

for l in f:
    if "optgroup" in l:
        parts = l.split("optgroup label=")
        parts2 = parts[1].split(">")[0]
        language = parts2[1:-1]
        code = CODE_BY_LANGUAGE.get(language)
        if code:
            if VERSION_BY_LANGUAGE_CODE.has_key(code):
                VERSION_BY_LANGUAGE_CODE[code] = VERSION_BY_LANGUAGE_CODE[code].sort()
        VERSION_BY_LANGUAGE_CODE[code] = []
    elif "option value" in l:
        parts = l.split(">")
        parts2 = parts[1].split(" (")
        version_name = parts2[0]
        parts3 = parts2[1].split(")")
        version_code = parts3[0]
        if code:
            if not VERSION_BY_LANGUAGE_CODE.has_key(code):
                VERSION_BY_LANGUAGE_CODE[code] = []
            versions = VERSION_BY_LANGUAGE_CODE[code]
            v = (version_code, version_name)
            duplicate = False
            for v_ in versions:
                if (v[0]==v_[0]) and (v[1]==v_[1]):
                    duplicate = True
                    break
            if not duplicate:
                VERSION_BY_LANGUAGE_CODE[code].append((version_code,version_name))

print VERSION_BY_LANGUAGE_CODE
