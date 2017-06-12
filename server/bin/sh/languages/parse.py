from verserain.verse.language import *

f = open("languages.txt")

for l in f:
    parts = l.split("'")
    lang_code = parts[1]
    language = parts[2].split("<")[0][1:]
    LANGUAGE_BY_CODE[lang_code] = language

print LANGUAGE_BY_CODE
