from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import viewsets,permissions
from rest_framework.decorators import action
from rest_framework.response import Response
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
    UserSerializer,
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
    NotificationSerializer,
    StudentProfileCreateSerializer
)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff
        })


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

    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):

        route = self.get_object()

        assignment = RouteAssignment.objects.filter(
            route=route,
            is_active=True
        ).select_related("bus", "driver").first()

        if not assignment:
            return Response({"message": "No assignment yet"})

        data = {
            "route": route.name,
            "bus": assignment.bus.bus_number,
            "driver": assignment.driver.name,
            "capacity": assignment.bus.capacity
        }

        return Response(data)


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

    @action(detail=False, methods=["get"])
    def available(self, request):

        assigned = RouteAssignment.objects.filter(
            is_active=True
        ).values_list("bus_id", flat=True)

        buses = Bus.objects.exclude(id__in=assigned)

        serializer = self.get_serializer(buses, many=True)

        return Response(serializer.data)


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAdmin]  # keeps admin-only for all other actions

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def public_detail(self, request, pk=None):
        try:
            driver = Driver.objects.get(pk=pk)
            return Response({
                "name": driver.name,
                "phone": driver.phone,
                "license_number": driver.license_no,
                "is_available": driver.is_available,
            })
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found"}, status=404)

    @action(detail=False, methods=["get"])
    def available(self, request):
        assigned = RouteAssignment.objects.filter(
            is_active=True
        ).values_list("driver_id", flat=True)
        drivers = Driver.objects.exclude(id__in=assigned)
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)


class RouteAssignmentViewSet(viewsets.ModelViewSet):
    queryset = RouteAssignment.objects.all().select_related(
        "route",
        "bus",
        "driver",
        "semester"
    )
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
    permission_classes = [AllowAny]  # allow anyone to access


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_staff:
            data = {
                "role": "staff",
                "stats": {
                    "total_students": StudentProfile.objects.count(),
                    "active_buses": Bus.objects.filter(is_active=True).count(),
                    "active_routes": Route.objects.filter(is_active=True).count(),
                    "active_route_assignments": RouteAssignment.objects.filter(is_active=True).count(),
                    "pending_complaints": Complaint.objects.filter(status="Pending").count(),
                    "open_route_change_requests": RouteChangeRequest.objects.filter(status="Pending").count(),
                    "unverified_fees": FeeVerification.objects.filter(is_verified=False).count(),
                    "pending_maintenance": MaintenanceSchedule.objects.filter(status="Pending").count(),
                },
            }
        else:
            try:
                profile = StudentProfile.objects.get(user=user)
            except StudentProfile.DoesNotExist:
                return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

            registrations = SemesterRegistration.objects.filter(student=profile).select_related("semester", "route", "stop")
            active_registration = registrations.filter(semester__is_active=True).first()

            seat = None
            waitlist_position = None
            if active_registration:
                seat_obj = SeatAllocation.objects.filter(registration=active_registration).first()
                if seat_obj:
                    seat = {"seat_number": seat_obj.seat_number, "allocated_at": seat_obj.allocated_at}
                else:
                    waitlist_obj = Waitlist.objects.filter(registration=active_registration).first()
                    if waitlist_obj:
                        waitlist_position = waitlist_obj.position

            fees = FeeVerification.objects.filter(student=profile).select_related("semester")
            complaints = Complaint.objects.filter(submitted_by=user).order_by("-created_at")[:5]
            notifications = Notification.objects.filter(user=user).order_by("-created_at")[:5]

            data = {
                "role": "student",
                "profile": {
                    "roll_number": profile.roll_number,
                    "department": profile.department,
                    "batch": profile.batch,
                    "phone": profile.phone,
                    "address": profile.address,
                },
                "active_registration": {
                    "semester": active_registration.semester.name if active_registration else None,
                    "route": active_registration.route.name if active_registration else None,
                    "stop": active_registration.stop.name if active_registration else None,
                    "status": active_registration.status if active_registration else None,
                } if active_registration else None,
                "seat": seat,
                "waitlist_position": waitlist_position,
                "fee_summary": [
                    {
                        "semester": f.semester.name,
                        "amount": str(f.amount),
                        "is_verified": f.is_verified,
                        "challan_number": f.challan_number,
                    }
                    for f in fees
                ],
                "recent_complaints": [
                    {
                        "subject": c.subject,
                        "status": c.status,
                        "priority": c.priority,
                        "created_at": c.created_at,
                    }
                    for c in complaints
                ],
                "recent_notifications": [
                    {
                        "title": n.title,
                        "message": n.message,
                        "type": n.type,
                        "is_read": n.is_read,
                        "created_at": n.created_at,
                    }
                    for n in notifications
                ],
            }

        return Response(data)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Student registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def students_list(request):
    students = StudentProfile.objects.select_related("user").all()

    data = []
    for s in students:
        data.append({
            "id": s.id,
            "username": s.user.username,
            "email": s.user.email,
            "roll_number": s.roll_number,
            "department": s.department,
            "batch": s.batch,
            "phone": s.phone
        })

    return Response(data)