from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from .models import StudentProfile


class RollNumberBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Try matching roll_number first (students)
        try:
            profile = StudentProfile.objects.select_related("user").get(roll_number=username)
            user = profile.user
        except StudentProfile.DoesNotExist:
            # Fall back to actual username (keeps admin login working)
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None