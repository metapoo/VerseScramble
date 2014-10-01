#!/usr/bin/python

#!/usr/local/bin/python                                                                                                            

import subprocess
from datetime import datetime
from time import sleep
import os

HOME = os.environ['HOME']

BACKUP_PATH = "%s/backup" % HOME

dirname = "%s/%s" % (BACKUP_PATH, datetime.now().strftime("%a"))
filename = "%s.tar.gz" % dirname

subprocess.Popen(["mongodump --out %s" % dirname],shell=True).wait()
subprocess.Popen(["tar cvzf %s %s" % (filename, dirname)], shell=True).wait()
subprocess.Popen(["rm -rf %s" % dirname],shell=True).wait()
