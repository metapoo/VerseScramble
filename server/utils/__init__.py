def sort_by_value(d, ascending=True):
    """ Returns the keys of dictionary d sorted by their values """
    items=d.items()
    backitems=[ [v[1],v[0]] for v in items]
    backitems.sort()
    keys = [ backitems[i][1] for i in range(0,len(backitems))]
    if not ascending:
        keys.reverse()
    return keys
