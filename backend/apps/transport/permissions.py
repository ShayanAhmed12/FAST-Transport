from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import SAFE_METHODS

class IsStudentReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.groups.filter(name="Student").exists()
        return False

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Admin").exists()


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Student").exists()