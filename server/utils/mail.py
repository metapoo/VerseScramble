from verserain import settings

def send_mail(from_address, to_address, subject, message, reply_to=None, connection=None):
    import smtplib
    if reply_to is None:
        reply_to = from_address

    if isinstance(to_address, basestring):
        to_field = to_address
    else:
        to_field = ", ".join(to_address)

    full_message = """From: %s\nTo: %s\nSubject: %s\nReply-To: %s\n%s\n""" % (from_address, to_field, subject, reply_to, message)

    # Send the mail
    created = False
    if connection is None:
        connection = smtplib.SMTP(settings.IP_ADDRESS,port=25)
        created = True

    connection.sendmail(from_address, to_field, full_message)

    if created:
        connection.quit()

def report_exception(error_message=None, handler=None, callback=None, downed_server=None, script_name=None):
    from verserain.email.models import EmailQueue
    import sys, traceback

    if downed_server:
        subject = "verserain server down!: %s" % downed_server
    elif error_message:
        subject = "verserain error: %s" % error_message
        if handler:
            subject += " handler: %s" % handler.__class__.__name__
    elif handler:
        subject = "verserain exception: %s:%s" % (handler.__class__.__name__, handler.request.path)
    elif callback:
        subject = "verserain callback exception: %r" % callback
    else:
        return

    # don't keep resending same error emails                                                                                                                                            
    eq = EmailQueue.collection.find_one({"subject":subject})
    if eq:
        return

    import simplejson
    arguments = ""
    if handler and handler.request:
        arguments = handler.request.arguments

    body = str(arguments) + "\n"

    if handler and handler.current_user:
        body += "user id: %s\n" % handler.current_user._id

    body += '\n'.join(traceback.format_exception(*sys.exc_info()))
    EmailQueue.queue_mail(settings.ADMIN_EMAIL, settings.ADMIN_EMAIL, subject, body)
