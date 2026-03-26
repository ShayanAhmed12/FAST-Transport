from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Challan,
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
)

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'role']

    def get_role(self, obj):
        if obj.is_staff:
            return "Admin"
        return "Student"


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'
        read_only_fields = ['created_at']


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = '__all__'
        read_only_fields = ['created_at']


class RouteStopSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source="route.name", read_only=True)
    stop_name = serializers.CharField(source="stop.name", read_only=True)

    route = serializers.PrimaryKeyRelatedField(queryset=Route.objects.all())
    stop = serializers.PrimaryKeyRelatedField(queryset=Stop.objects.all())
    bus_number = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()
    driver_id = serializers.SerializerMethodField()

    class Meta:
        model = RouteStop
        fields = [
            "id",
            "route",
            "stop",
            "stop_order",
            "morning_eta",
            "evening_eta",
            "route_name",
            "stop_name",
            "bus_number",
            "driver_name",
            "driver_id",
        ]

    def get_bus_number(self, obj):
        assignment = obj.route.routeassignment_set.filter(is_active=True).first()
        if assignment and assignment.bus:
            return assignment.bus.bus_number
        return None


    def get_driver_name(self, obj):
        assignment = obj.route.routeassignment_set.filter(is_active=True).first()
        if assignment and assignment.driver:
            return assignment.driver.name
        return None
    def get_driver_id(self, obj):                      # ← add this method
        assignment = obj.route.routeassignment_set.filter(is_active=True).first()
        if assignment and assignment.driver:
            return assignment.driver.id
        return None


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class RouteAssignmentSerializer(serializers.ModelSerializer):

    route = RouteSerializer(read_only=True)  # READ (for responses)
    bus = BusSerializer(read_only=True)
    driver = DriverSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)

    route_id = serializers.PrimaryKeyRelatedField(  # WRITE (for requests)
        queryset=Route.objects.all(),
        source="route",
        write_only=True
    )

    bus_id = serializers.PrimaryKeyRelatedField(
        queryset=Bus.objects.all(),
        source="bus",
        write_only=True
    )

    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source="driver",
        write_only=True
    )

    semester_id = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all(),
        source="semester",
        write_only=True
    )

    def validate(self, data):
        instance = self.instance

        # Resolve fields: prefer incoming data, fall back to existing instance values
        bus = data.get("bus") or (instance.bus if instance else None)
        driver = data.get("driver") or (instance.driver if instance else None)
        semester = data.get("semester") or (instance.semester if instance else None)
        route = data.get("route") or (instance.route if instance else None)

        # If is_active is being set to True, ensure all related objects are active
        is_active = data.get("is_active", instance.is_active if instance else None)
        if is_active:
            if route and not route.is_active:
                raise serializers.ValidationError(
                    "Cannot activate assignment: the route is inactive."
                )
            if bus and not bus.is_active:
                raise serializers.ValidationError(
                    "Cannot activate assignment: the bus is inactive."
                )
            if driver and not driver.is_available:
                raise serializers.ValidationError(
                    "Cannot activate assignment: the driver is unavailable."
                )
            if semester and not semester.is_active:
                raise serializers.ValidationError(
                    "Cannot activate assignment: the semester is inactive."
                )

        # Prevent duplicate bus+semester assignment (skip current instance on update)
        qs_bus = RouteAssignment.objects.filter(
            bus=bus,
            semester=semester,
            is_active=True
        )
        if instance:
            qs_bus = qs_bus.exclude(pk=instance.pk)
        if bus and semester and is_active and qs_bus.exists():
            raise serializers.ValidationError(
                "This bus is already assigned in this semester."
            )

        # Prevent duplicate driver+semester assignment
        qs_driver = RouteAssignment.objects.filter(
            driver=driver,
            semester=semester,
            is_active=True
        )
        if instance:
            qs_driver = qs_driver.exclude(pk=instance.pk)
        if driver and semester and is_active and qs_driver.exists():
            raise serializers.ValidationError(
                "This driver is already assigned in this semester."
            )

        return data

    class Meta:
        model = RouteAssignment
        fields = "__all__"
        read_only_fields = ["created_at"]


class SemesterRegistrationSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    stop = StopSerializer(read_only=True)

    class Meta:
        model = SemesterRegistration
        fields = '__all__'
        read_only_fields = ['registered_at', 'updated_at']

class TransportRegistrationSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.name', read_only=True)
    stop_name = serializers.CharField(source='stop.name', read_only=True)
    semester_name = serializers.CharField(source='semester.name', read_only=True)

    stop_id = serializers.PrimaryKeyRelatedField(
        queryset=Stop.objects.all(),
        source="stop",
        write_only=True
    )
    semester_id = serializers.PrimaryKeyRelatedField(
        queryset=Semester.objects.all(),
        source="semester",
        write_only=True
    )
    semester = serializers.PrimaryKeyRelatedField(read_only=True)
    stop = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TransportRegistration
        fields = [
            "id",
            "semester_id", "stop_id",
            "semester", "stop",
            "semester_name", "stop_name", "route_name",
            "status", "fee_amount", "is_paid", "created_at",
        ]
        read_only_fields = ["student", "route", "created_at"]

class SeatAllocationSerializer(serializers.ModelSerializer):
    registration = SemesterRegistrationSerializer(read_only=True)
    route_assignment = RouteAssignmentSerializer(read_only=True)

    class Meta:
        model = SeatAllocation
        fields = '__all__'
        read_only_fields = ['allocated_at']


class WaitlistSerializer(serializers.ModelSerializer):
    registration = SemesterRegistrationSerializer(read_only=True)
    class Meta:
        model = Waitlist
        fields = '__all__'
        read_only_fields = ['added_at']

class ChallanSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    semester_name = serializers.CharField(source='registration.semester.name', read_only=True)
    route_name = serializers.CharField(source='registration.route.name', read_only=True)
    stop_name = serializers.CharField(source='registration.stop.name', read_only=True)

    class Meta:
        model = Challan
        fields = [
            "id",
            "registration",
            "student_name",
            "semester_name",
            "route_name",
            "stop_name",
            "amount",
            "status",
            "created_at",
        ]

class FeeVerificationSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    verified_by = UserSerializer(read_only=True)

    class Meta:
        model = FeeVerification
        fields = '__all__'
        read_only_fields = ['created_at', 'verified_at']


class ComplaintSerializer(serializers.ModelSerializer):
    submitted_by = UserSerializer(read_only=True)
    semester = SemesterSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    resolved_by = UserSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['created_at', 'resolved_at']


class RouteChangeRequestSerializer(serializers.ModelSerializer):
    registration = SemesterRegistrationSerializer(read_only=True)
    current_route = RouteSerializer(read_only=True)
    requested_route = RouteSerializer(read_only=True)
    requested_stop = StopSerializer(read_only=True)

    class Meta:
        model = RouteChangeRequest
        fields = '__all__'
        read_only_fields = ['requested_at', 'resolved_at']


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = MaintenanceSchedule
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'completed_date']


class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at']

# Serializer for creating User + StudentProfile together
class StudentProfileCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = StudentProfile
        fields = ['username', 'email', 'password', 'roll_number', 'department', 'batch', 'phone', 'address']

    def create(self, validated_data):
        from django.contrib.auth.models import User

        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        # Create Django User
        user = User.objects.create_user(username=username, email=email, password=password)

        # Create StudentProfile linked to this user
        profile = StudentProfile.objects.create(user=user, **validated_data)
        return profile
            