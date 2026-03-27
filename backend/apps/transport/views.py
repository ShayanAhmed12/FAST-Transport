from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import viewsets,permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
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
    Notification,
    TransportRegistration,
    Challan,
)

from .serializers import (
    ChallanSerializer,
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
    StudentProfileCreateSerializer,
    TransportRegistrationSerializer
)
from .seatallocation import allocate_seat_for_student

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

class TransportRegistrationViewSet(viewsets.ModelViewSet):
    queryset = TransportRegistration.objects.all()
    serializer_class = TransportRegistrationSerializer
    permission_classes = [IsStudentCreateOnly]

    def get_queryset(self):
        user = self.request.user
        profile = StudentProfile.objects.filter(user=user).first()

        if not profile:
            return TransportRegistration.objects.none()

        return TransportRegistration.objects.filter(student=profile)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_registration(self, request):
        user = request.user
        profile = StudentProfile.objects.filter(user=user).first()

        if not profile:
            return Response(
                {"detail": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        registration = TransportRegistration.objects.filter(student=profile).first()

        if not registration:
            return Response(
                {"detail": "No transport registration found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(registration)
        return Response(serializer.data)

    def perform_create(self, serializer):
        profile = StudentProfile.objects.get(user=self.request.user)

        stop = serializer.validated_data["stop"]
        semester = serializer.validated_data["semester"]

        route_stop = RouteStop.objects.filter(stop=stop).first()
        if not route_stop:
            raise ValidationError("No route found for this stop")

        fee = FeeVerification.objects.filter(
            student=profile,
            semester=semester,
            is_verified=True
        ).first()

        reg_status = "Approved" if fee else "Pending"
        registration = serializer.save(
            student=profile,
            route=route_stop.route,
            semester=semester,
            status=reg_status
        )

        semester_registration, _ = SemesterRegistration.objects.update_or_create(
            student=profile,
            semester=semester,
            defaults={
                "route": route_stop.route,
                "stop": stop,
                "status": reg_status,
            },
        )

        if fee and not SeatAllocation.objects.filter(registration=semester_registration).exists():
            allocate_seat_for_student(semester_registration)

        amount = 45000
        Challan.objects.get_or_create(
            registration=registration,
            student=profile,
            defaults={"amount": amount, "status": "unpaid"}
        )

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

    def verify_fee(fee, admin_user):
        fee.is_verified = True
        fee.verified_by = admin_user
        fee.verified_at = timezone.now()
        fee.save()

        # Update transport registration
        TransportRegistration.objects.filter(
            student=fee.student,
            semester=fee.semester
        ).update(status="approved")


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsStudentCreateOnly] # Students create, Admin full access

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name="Student").exists():
            return Complaint.objects.filter(submitted_by=user)
        return Complaint.objects.all()

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)


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

            active_semester = Semester.objects.filter(is_active=True).first()

            registrations = SemesterRegistration.objects.filter(student=profile).select_related("semester", "route", "stop")
            active_registration = registrations.filter(semester__is_active=True).first()

            transport_registration = None
            if active_semester:
                transport_registration = TransportRegistration.objects.filter(
                    student=profile,
                    semester=active_semester,
                ).select_related("semester", "route", "stop").first()

            registration_semester = None
            if active_registration:
                registration_semester = active_registration.semester
            elif transport_registration:
                registration_semester = transport_registration.semester

            fee_submitted_for_registration = False
            fee_verified_for_registration = False
            if registration_semester:
                fee_submitted_for_registration = FeeVerification.objects.filter(
                    student=profile,
                    semester=registration_semester,
                ).exists()
                fee_verified_for_registration = FeeVerification.objects.filter(
                    student=profile,
                    semester=registration_semester,
                    is_verified=True,
                ).exists()

            bus_number = None

            seat = None
            waitlist_position = None
            if active_registration:
                seat_obj = SeatAllocation.objects.select_related("route_assignment__bus").filter(registration=active_registration).first()
                if seat_obj:
                    seat = {"seat_number": seat_obj.seat_number, "allocated_at": seat_obj.allocated_at}
                    bus_number = seat_obj.route_assignment.bus.bus_number
                else:
                    waitlist_obj = Waitlist.objects.filter(registration=active_registration).first()
                    if waitlist_obj:
                        waitlist_position = waitlist_obj.position

                    assignment = RouteAssignment.objects.select_related("bus").filter(
                        route=active_registration.route,
                        semester=active_registration.semester,
                        is_active=True,
                    ).first()
                    if assignment:
                        bus_number = assignment.bus.bus_number
            elif transport_registration:
                assignment = RouteAssignment.objects.select_related("bus").filter(
                    route=transport_registration.route,
                    semester=transport_registration.semester,
                    is_active=True,
                ).first()
                if assignment:
                    bus_number = assignment.bus.bus_number

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
                    "semester": (
                        active_registration.semester.name
                        if active_registration
                        else transport_registration.semester.name
                    ),
                    "route": (
                        active_registration.route.name
                        if active_registration
                        else transport_registration.route.name if transport_registration.route else None
                    ),
                    "stop": (
                        active_registration.stop.name
                        if active_registration
                        else transport_registration.stop.name
                    ),
                    "status": (
                        active_registration.status
                        if active_registration
                        else transport_registration.status
                    ),
                    "bus": bus_number,
                    "fee_submitted": fee_submitted_for_registration,
                    "fee_verified": fee_verified_for_registration,
                } if (active_registration or transport_registration) else None,
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_challan(request, pk):
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return Response({"detail": "Student profile not found"}, status=404)
 
    try:
        registration = TransportRegistration.objects.get(id=pk, student=profile)
    except TransportRegistration.DoesNotExist:
        return Response({"detail": "Registration not found"}, status=404)
 
    # Auto-create challan if it was missed during registration
    challan, created = Challan.objects.get_or_create(
        registration=registration,
        student=profile,
        defaults={
            "amount": registration.semester.fee if hasattr(registration.semester, "fee") else 0,
            "status": "unpaid"
        }
    )
 
    data = ChallanSerializer(challan).data
    # ✅ ADDED: expose the registration status so the frontend can show
    # "waiting for verification" vs "approved" without a separate API call
    data["registration_status"] = registration.status
    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pay_challan(request, pk):
    profile = StudentProfile.objects.filter(user=request.user).first()
    if not profile:
        return Response({"detail": "Profile not found"}, status=404)

    try:
        challan = Challan.objects.get(registration__id=pk, student=profile)
    except Challan.DoesNotExist:
        return Response({"detail": "Challan not found"}, status=404)

    if challan.status == "paid":
        return Response({"detail": "Already paid"}, status=400)

    challan.status = "paid"
    challan.save()

    # Create or update FeeVerification record
    fee_verification, _ = FeeVerification.objects.get_or_create(
        student=profile,
        semester=challan.registration.semester,
        defaults={
            "amount": challan.amount,
            "challan_number": f"CHN-{challan.id:04d}",
        }
    )

    # Notify all admin/staff users
    admin_users = User.objects.filter(is_staff=True)
    for admin in admin_users:
        Notification.objects.create(
            user=admin,
            title="Fee Payment Received",
            message=f"Student {profile.roll_number} has paid transport fees for {challan.registration.semester.name}. Please verify.",
            type="info"
        )

    return Response(ChallanSerializer(challan).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_fee(request, pk):
    if not request.user.is_staff:
        return Response({"detail": "Unauthorized"}, status=403)

    try:
        fee = FeeVerification.objects.get(pk=pk)
    except FeeVerification.DoesNotExist:
        return Response({"detail": "Fee verification not found"}, status=404)

    fee.is_verified = True
    fee.verified_by = request.user
    fee.verified_at = timezone.now()
    fee.save()

    # Approve the transport registration
    registrations_qs = TransportRegistration.objects.filter(
        student=fee.student,
        semester=fee.semester
    )
    registrations_qs.update(status="Approved")

    first_registration = registrations_qs.select_related("route", "stop").first()
    if first_registration and first_registration.route and first_registration.stop:
        semester_registration, _ = SemesterRegistration.objects.update_or_create(
            student=fee.student,
            semester=fee.semester,
            defaults={
                "route": first_registration.route,
                "stop": first_registration.stop,
                "status": "Approved",
            },
        )

        if not SeatAllocation.objects.filter(registration=semester_registration).exists():
            allocate_seat_for_student(semester_registration)

    # Notify the student
    Notification.objects.create(
        user=fee.student.user,
        title="Fee Verified",
        message=f"Your transport fee for {fee.semester.name} has been verified. Your registration is now approved.",
        type="info"
    )

    return Response({"detail": "Fee verified successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_fee_verifications(request):
    if not request.user.is_staff:
        return Response({"detail": "Unauthorized"}, status=403)

    fees = FeeVerification.objects.select_related(
        "student__user", "semester", "verified_by"
    ).order_by("is_verified", "-created_at")

    data = [
        {
            "id": f.id,
            "roll_number": f.student.roll_number,
            "student_name": f.student.user.username,
            "semester": f.semester.name,
            "amount": str(f.amount),
            "challan_number": f.challan_number,
            "is_verified": f.is_verified,
            "verified_by": f.verified_by.username if f.verified_by else None,
            "verified_at": f.verified_at,
            "created_at": f.created_at,
        }
        for f in fees
    ]
    return Response(data)