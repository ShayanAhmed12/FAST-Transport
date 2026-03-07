from rest_framework import serializers
from django.contrib.auth.models import User
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
    route = RouteSerializer(read_only=True)
    stop = StopSerializer(read_only=True)

    class Meta:
        model = RouteStop
        fields = '__all__'


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

    def validate(self, data):  #prevents twice assignment in 1 sem

        bus = data.get("bus")
        driver = data.get("driver")
        semester = data.get("semester")

        if RouteAssignment.objects.filter(
            bus=bus,
            semester=semester,
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "This bus is already assigned in this semester."
            )

        if RouteAssignment.objects.filter(
            driver=driver,
            semester=semester,
            is_active=True
        ).exists():
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
            