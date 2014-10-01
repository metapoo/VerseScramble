#!/usr/bin/python

#!/usr/local/bin/python                                                                                                            

import subprocess
from datetime import datetime
from time import sleep
import os

HOME = os.environ['HOME']

BACKUP_PATH = "%s/backup" % HOME
dirname = datetime.now().strftime("%a")
dirpath = "%s/%s" % (BACKUP_PATH, dirname)
filename = "%s.tar.gz" % dirname

subprocess.Popen(["mongodump --out %s" % dirpath],shell=True).wait()
subprocess.Popen(["cd %s;tar cvzf %s %s" % (BACKUP_PATH, filename, dirname)], shell=True).wait()
subprocess.Popen(["rm -rf %s" % dirpath],shell=True).wait()
