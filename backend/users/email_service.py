import os
import resend
import threading
import logging

logger = logging.getLogger(__name__)

# Initialize SDK from environment variables
resend.api_key = os.getenv("RESEND_API_KEY")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "onboarding@resend.dev")

def _send_email_task(subject, text_content, html_content, to_emails, from_email=None, reply_to=None):
    """
    Synchronous worker function that actually executes the Resend API call.
    """
    if not resend.api_key:
        logger.warning(f"RESEND_API_KEY is missing. Mock sending email to {to_emails}")
        logger.info(f"Mock Email Subject: {subject}")
        return

    # Ensure to_emails is a list
    if isinstance(to_emails, str):
        to_emails = [to_emails]

    try:
        params = {
            "from": from_email or DEFAULT_FROM_EMAIL,
            "to": to_emails,
            "subject": subject,
            "text": text_content,
        }
        if html_content:
            params["html"] = html_content
        if reply_to:
            params["reply_to"] = reply_to

        response = resend.Emails.send(params)
        logger.info(f"--- SUCCESS: Email sent to {to_emails} via Resend. ID: {response.get('id')} ---")
        return response
    except Exception as e:
        logger.error(f"--- RESEND ERROR: Failed to send email to {to_emails}. Error: {str(e)} ---")

def send_resend_email(subject, text_content, html_content=None, to_email=None, from_email=None, reply_to=None):
    """
    Public asynchronous wrapper to send emails via Resend.
    Spawns a background thread so the HTTP request doesn't block the Django view.
    """
    if not to_email:
        logger.error("No recipient email provided for send_resend_email")
        return

    thread = threading.Thread(
        target=_send_email_task,
        args=(subject, text_content, html_content, to_email, from_email, reply_to)
    )
    thread.start()
