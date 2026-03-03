from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin(user):
    return user.groups.filter(name="Admin").exists()


def is_student(user):
    return user.groups.filter(name="Student").exists()



class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_admin(request.user)


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_student(request.user)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if is_admin(request.user):
            return True

        if is_student(request.user) and request.method in SAFE_METHODS:
            return True

        return False


class IsStudentCreateOnly(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if is_admin(request.user):
            return True

        if is_student(request.user):
            return True

        return False