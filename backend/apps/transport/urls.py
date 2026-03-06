from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import StudentSignupView, CurrentUserView
router = DefaultRouter()

# Existing ViewSets
router.register(r'students', StudentProfileViewSet)
router.register(r'semesters', SemesterViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'stops', StopViewSet)
router.register(r'route-stops', RouteStopViewSet)
router.register(r'buses', BusViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'route-assignments', RouteAssignmentViewSet)
router.register(r'semester-registrations', SemesterRegistrationViewSet)
router.register(r'seat-allocations', SeatAllocationViewSet)
router.register(r'waitlist', WaitlistViewSet)
router.register(r'fee-verifications', FeeVerificationViewSet)
router.register(r'complaints', ComplaintViewSet)
router.register(r'route-change-requests', RouteChangeRequestViewSet)
router.register(r'maintenance-schedules', MaintenanceScheduleViewSet)
router.register(r'notifications', NotificationViewSet)

# New explicit API endpoints


urlpatterns = [
    path('signup/', StudentSignupView.as_view(), name='student-signup'),
    path('user/', CurrentUserView.as_view(), name='current-user'),
]

urlpatterns += router.urls