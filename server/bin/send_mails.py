#!/usr/bin/python
from verserain.email.models import *
import smtplib
from time import sleep
from verserain.utils.text import *

def get_connection():
    return smtplib.SMTP('localhost',port=25)

def send_mails(connection=None):
    eqs = list(EmailQueue.collection.find())
    if len(eqs) > 0:
        if connection is None:
            connection = get_connection()
        for eq in eqs:
            email = eq["to_address"]
            if type(eq["to_address"]) in (list, tuple):
                email = email[0]

            if not is_valid_email(email):
                print "invalid email: %s" % email
                eq.remove()
                continue
            try:
                eq.send_mail(connection=connection)
                print eq
            except smtplib.SMTPException:
                connection = get_connection()
            except smtplib.socket.error:
                connection = get_connection()
    return connection


def send_mail_loop():
    connection = None
    while 1:
        connection = send_mails(connection)
        sleep(1)

#send_mail_loop()
send_mails()
