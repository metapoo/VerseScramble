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
            if not is_valid_email(eq["to_address"]):
                eq.remove()
                continue
            print eq
            eq.send_mail(connection=connection)
        connection.quit()

send_mails()
