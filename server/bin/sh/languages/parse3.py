from verserain.verse.language import *

f = open("languages2.txt")

i = 0
for l in f:
    if "<tr>" in l:
        i = 0

    if (i == 4):
        if "<td lang=\"" in l and "</td>" in l:
            parts = l.split("<td lang=\"")
            parts2 = parts[1].split('"')
            code = parts2[0]
            language = parts2[3][1:-6]
            if not LANGUAGE_BY_CODE.has_key(code):
                LANGUAGE_BY_CODE[code] = language
                print code
    i += 1

avail_keys = VERSION_BY_LANGUAGE_CODE.keys()

for key in LANGUAGE_BY_CODE.keys():
    if key not in avail_keys:
        del LANGUAGE_BY_CODE[key]

print LANGUAGE_BY_CODE
