import BeautifulSoup
import re
numre = re.compile("(\d+)")
footnote_re = re.compile("\[\w\]")

def remove_script(txt):
    soup = BeautifulSoup.BeautifulSoup(txt)
    [s.extract() for s in soup('script')]
    return soup

def last_number(txt):
    parts = re.findall(numre, txt)
    if len(parts) > 0:
        return int(parts[-1])
    return None
    
def get_versenums_from_reference(reference):
    if ";" in reference:
        parts = reference.split(";")
        if len(parts) > 1:
            numlist = get_versenums_from_reference(parts[0])
            numlist2 = get_versenums_from_reference(parts[1])
            numlist.extend(numlist2)
            return numlist

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
        start = last_number(parts[0])
        end = last_number(parts[1])
        if start and end:
            numlist = range(start,end+1)
        else:
            numlist = []
    else:
        try:
            numlist = [int(verse_numbers),]
        except:
            numlist = []
    return numlist

def process_verse(reference,txt):
    txt = txt.strip()
    txt = txt.replace("\n","")

    numlist = get_versenums_from_reference(reference)

    if len(numlist) > 0:
        numlist.append(numlist[-1]+1)
        numlist.insert(0, numlist[0]-1)
        numlist = map(str, numlist)

    parts = re.split(numre, txt)
    final_parts = []

    for part in parts:
        if part not in numlist:
            final_parts.append(part)

    txt = ''.join(final_parts)

    parts = re.split(footnote_re,txt)
    txt = ''.join(parts)

    return txt

