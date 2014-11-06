from verserain.verse.language import *
from verserain.utils.encoding import *

for k,v in LANGUAGE_BY_CODE.items():
    print "\tlanguageByCode.Add(\"%s\",\"%s\");" % (k,smart_text(v))
