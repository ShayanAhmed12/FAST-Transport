"""Custom email backend that sends via SMTP and prints to console."""
from django.core.mail.backends.smtp import EmailBackend as SMTPBackend
from django.core.mail.backends.console import EmailBackend as ConsoleBackend


class DualEmailBackend(SMTPBackend):
    """
    Email backend that sends via SMTP and also prints to console.
    Useful for development to debug email content while actually sending.
    """
    def send_messages(self, email_messages):
        """Send messages via SMTP, then print to console."""
        try:
            # Send via SMTP
            result = super().send_messages(email_messages)
        except Exception as e:
            # If SMTP fails, still print to console for debugging
            print(f"\n  SMTP Send Failed: {e}\n")
            result = 0
        
        # Always print to console for visibility
        console_backend = ConsoleBackend()
        console_backend.send_messages(email_messages)
        
        return result
