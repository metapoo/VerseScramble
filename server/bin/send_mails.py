#!/usr/bin/python
from verserain.email.models import *
import smtplib
from time import sleep
from verserain.utils.text import *

def send_mails():
    eqs = list(EmailQueue.collection.find())
    if len(eqs) > 0:
        connection = smtplib.SMTP(settings.IP_ADDRESS,port=25)
        for eq in eqs:
            email = eq["to_address"]
            if type(eq["to_address"]) in (list, tuple):
                email = email[0]

            if not is_valid_email(email):
                print "invalid email: %s" % email
                eq.remove()
                continue
            print eq
            eq.send_mail(connection=connection)
        connection.quit()

send_mails()
