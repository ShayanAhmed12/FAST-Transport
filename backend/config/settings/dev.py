from .base import *
DEBUG = True

# Use dual email backend in dev: sends via SMTP and prints to console for debugging
EMAIL_BACKEND = 'config.email_backends.DualEmailBackend'