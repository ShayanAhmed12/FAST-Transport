
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import StudentProfileCreateSerializer
from rest_framework import viewsets,permissions
from .permissions import (
    IsAdmin,
    IsStudent,
    IsAdminOrReadOnly,
    IsStudentCreateOnly
)
from .models import (
    StudentProfile,
    Semester,
    Route,
    Stop,
    RouteStop,
    Bus,
    Driver,
    RouteAssignment,
    SemesterRegistration,
    SeatAllocation,
    Waitlist,
    FeeVerification,
    Complaint,
    RouteChangeRequest,
    MaintenanceSchedule,
    Notification
)

from .serializers import (
    StudentProfileSerializer,
    SemesterSerializer,
    RouteSerializer,
    StopSerializer,
    RouteStopSerializer,
    BusSerializer,
    DriverSerializer,
    RouteAssignmentSerializer,
    SemesterRegistrationSerializer,
    SeatAllocationSerializer,
    WaitlistSerializer,
    FeeVerificationSerializer,
    ComplaintSerializer,
    RouteChangeRequestSerializer,
    MaintenanceScheduleSerializer,
    NotificationSerializer
)


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsStudentCreateOnly] #Students create, Admin full accces

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name="Student").exists():
            return StudentProfile.objects.filter(user=user) # Student sees only their own profile
        return StudentProfile.objects.all() # Admin sees all profiles


class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [IsStudentCreateOnly] # Students create, Admin full acccess


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAdminOrReadOnly] # Admin full access, Students read only


class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer
    permission_classes = [IsAdminOrReadOnly] # Admin full access, Students read only


class RouteStopViewSet(viewsets.ModelViewSet):
    queryset = RouteStop.objects.all()
    serializer_class = RouteStopSerializer
    permission_classes = [IsAdminOrReadOnly] # Admin full access, Students read only


class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdmin] # Only Admin full access


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAdmin] # Only Admin full access


class RouteAssignmentViewSet(viewsets.ModelViewSet):
    queryset = RouteAssignment.objects.all()
    serializer_class = RouteAssignmentSerializer
    permission_classes = [IsAdmin] # Only Admin full access


class SemesterRegistrationViewSet(viewsets.ModelViewSet):
    queryset = SemesterRegistration.objects.all()
    serializer_class = SemesterRegistrationSerializer
    permission_classes = [IsStudentCreateOnly] # Students create, Admin full access

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name="Student").exists():
            student_profile = StudentProfile.objects.get(user=user)
            return SemesterRegistration.objects.filter(student=student_profile)
        return SemesterRegistration.objects.all()


class SeatAllocationViewSet(viewsets.ModelViewSet):
    queryset = SeatAllocation.objects.all()
    serializer_class = SeatAllocationSerializer
    permission_classes = [IsAdmin] # Only Admin full access


class WaitlistViewSet(viewsets.ModelViewSet):
    queryset = Waitlist.objects.all()
    serializer_class = WaitlistSerializer
    permission_classes = [IsAdminOrReadOnly] # Admin full access, Students read only

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name="Student").exists():
            student_profile = StudentProfile.objects.get(user=user)
            return Waitlist.objects.filter(registration__student=student_profile)
        return Waitlist.objects.all()


class FeeVerificationViewSet(viewsets.ModelViewSet):
    queryset = FeeVerification.objects.all()
    serializer_class = FeeVerificationSerializer
    permission_classes = [IsAdminOrReadOnly] # Admin full access, Students read only


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsStudentCreateOnly] # Students create, Admin full access

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name="Student").exists():
            return Complaint.objects.filter(submitted_by=user)
        return Complaint.objects.all()


class RouteChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = RouteChangeRequest.objects.all()
    serializer_class = RouteChangeRequestSerializer
    permission_classes = [IsStudentCreateOnly] # Students create, Admin full access


class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [IsAdmin] # Only Admin full access


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrReadOnly] # Admin full access, Students read only

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name="Student").exists():
            return Notification.objects.filter(user=user)
        return Notification.objects.all()


class StudentSignupView(generics.CreateAPIView):
    serializer_class = StudentProfileCreateSerializer
    permission_classes = [AllowAny]  # <-- allow anyone to access

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Student registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)