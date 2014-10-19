import BeautifulSoup
import re

def remove_script(txt):
    soup = BeautifulSoup.BeautifulSoup(txt)
    [s.extract() for s in soup('script')]
    return soup

def get_versenums_from_reference(reference):
    parts = reference.split(":")
    if len(parts) > 2:
        return
    elif len(parts) == 1:
        verse_numbers = parts[0]
    else:
        verse_numbers = parts[1]

    if "," in verse_numbers:
        parts = verse_numbers.split(",")
        numlist = []
        for p in parts:
            if ("-" in p):
                numlist.extend(get_versenums_from_reference(p))
            else:
                numlist.append(int(p))
    elif "-" in verse_numbers:
        parts = verse_numbers.split("-")
        start = int(parts[0])
        end = int(parts[1])
        numlist = range(start,end+1)
    else:
        numlist = [int(verse_numbers),]
    return numlist

def process_verse(reference,txt):
    numre = re.compile("(\d+)")
    numlist = get_versenums_from_reference(reference)
    numlist = map(str, numlist)

    parts = re.split(numre, txt)
    final_parts = []

    for part in parts:
        if part not in numlist:
            final_parts.append(part)

    txtnonum = ''.join(final_parts)

    return txtnonum

