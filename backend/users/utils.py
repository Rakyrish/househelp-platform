from .email_service import send_resend_email
from django.template.loader import render_to_string

def send_verification_email(worker, action, reasons=None, comment=None):
    if action == 'approved':
        subject = "Account Verified - Kykam Agencies"
        message = f"Hello {worker.first_name},\n\nGreat news! Your account has been verified. You can now start receiving job requests."
    else:
        subject = "Action Required: Verification Update"
        reason_text = "\n".join([f"- {r}" for r in reasons]) if reasons else ""
        message = f"Hello {worker.first_name},\n\nUnfortunately, we couldn't verify your documents for the following reasons:\n\n{reason_text}\n\nNotes: {comment}\n\nPlease log in and re-upload your documents."

    send_resend_email(
        subject=subject,
        text_content=message,
        to_email=worker.email
    )