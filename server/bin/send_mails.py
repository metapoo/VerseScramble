#!/usr/bin/python
from verserain.email.models import *
import smtplib
from time import sleep

def send_mails():
    eqs = list(EmailQueue.collection.find())
    if len(eqs) > 0:
        connection = smtplib.SMTP(settings.IP_ADDRESS,port=25)
        for eq in eqs:
            print eq
            eq.send_mail(connection=connection)

send_mails()
