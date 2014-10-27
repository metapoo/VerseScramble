from verserain import settings
from verserain.utils.encoding import *
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.MIMEText import MIMEText
from email.Header import Header
from email.Utils import parseaddr, formataddr

def send_mail(sender, recipient, subject, body, reply_to=None, connection=None, html=None):
    """Send an email.

    All arguments should be Unicode strings (plain ASCII works as well).

    Only the real name part of sender and recipient addresses may contain
    non-ASCII characters.

    The email will be properly MIME encoded and delivered though SMTP to
    localhost port 25.  This is easy to change if you want something different.

    The charset of the email will be the first one out of US-ASCII, ISO-8859-1
    and UTF-8 that can represent all the characters occurring in the email.
    """

    # Header class is smart enough to try US-ASCII, then the charset we
    # provide, then fall back to UTF-8.
    header_charset = 'ISO-8859-1'

    # We must choose the body charset manually
    for body_charset in 'US-ASCII', 'ISO-8859-1', 'UTF-8':
        try:
            body.encode(body_charset)
        except UnicodeError:
            pass
        else:
            break

    # Split real name (which is optional) and email address parts
    sender_name, sender_addr = parseaddr(sender)
    recipient_name, recipient_addr = parseaddr(recipient)

    # We must always pass Unicode strings to Header, otherwise it will
    # use RFC 2047 encoding even on plain ASCII strings.
    sender_name = str(Header(unicode(sender_name), header_charset))
    recipient_name = str(Header(unicode(recipient_name), header_charset))

    # Make sure email addresses do not contain non-ASCII characters
    sender_addr = sender_addr.encode('ascii')
    recipient_addr = recipient_addr.encode('ascii')

    # Create the message ('plain' stands for Content-Type: text/plain)
    msg = MIMEMultipart('alternative')

    text_part = MIMEText(body.encode(body_charset), 'plain', body_charset)
    msg.attach(text_part)

    if html:
        html_part = MIMEText(html.encode(body_charset), 'html', body_charset)
        msg.attach(html_part)

    msg['From'] = formataddr((sender_name, sender_addr))
    msg['To'] = formataddr((recipient_name, recipient_addr))
    msg['Subject'] = Header(unicode(subject), header_charset)
    if reply_to:
        msg['Reply-To'] = reply_to
    created = False
    if connection is None:
        connection = smtplib.SMTP(settings.IP_ADDRESS,port=25)
        created = True

    # Send the message via SMTP to localhost:25
    connection.sendmail(sender, recipient, msg.as_string())

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
    headers = ""
    user_info = ""

    if handler and handler.request:
        arguments = handler.request.arguments
        headers = handler.request.headers
        user_info = handler.current_user

    body = "arguments: %s\nheaders: %s\nuser_info:%s" % (str(arguments), str(headers), str(user_info))

    if handler and handler.current_user:
        body += "user id: %s\n" % handler.current_user._id

    body += '\n'.join(traceback.format_exception(*sys.exc_info()))
    EmailQueue.queue_mail(settings.ADMIN_EMAIL, "hsiung@gmail.com", subject, body)
