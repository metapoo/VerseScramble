import BeautifulSoup

def remove_script(txt):
    soup = BeautifulSoup.BeautifulSoup(txt)
    [s.extract() for s in soup('script')]
    return soup
