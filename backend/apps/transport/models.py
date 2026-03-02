from django.db import models

# All models here.

from django.db import models
from django.contrib.auth.models import User

print("models.py loaded")

# All models here.

from django.db import models


class User(models.Model):
    username = models.CharField(max_length=150)
    email = models.EmailField(max_length=254)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    role = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    roll_number = models.CharField(max_length=20)
    department = models.CharField(max_length=100, null=True, blank=True)
    batch = models.CharField(max_length=20, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Semester(models.Model):
    name = models.CharField(max_length=50)
    year = models.IntegerField()
    term = models.CharField(max_length=20, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    registration_open = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Route(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Stop(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class RouteStop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    stop_order = models.IntegerField()
    morning_eta = models.TimeField(null=True, blank=True)
    evening_eta = models.TimeField(null=True, blank=True)


class Bus(models.Model):
    bus_number = models.CharField(max_length=20)
    capacity = models.IntegerField()
    model = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Driver(models.Model):
    name = models.CharField(max_length=150)
    cnic = models.CharField(max_length=15, null=True, blank=True)
    license_no = models.CharField(max_length=30, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class RouteAssignment(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SemesterRegistration(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, null=True, blank=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SeatAllocation(models.Model):
    registration = models.ForeignKey(SemesterRegistration, on_delete=models.CASCADE)
    route_assignment = models.ForeignKey(RouteAssignment, on_delete=models.CASCADE)
    seat_number = models.IntegerField()
    allocated_at = models.DateTimeField(auto_now_add=True)


class Waitlist(models.Model):
    registration = models.ForeignKey(SemesterRegistration, on_delete=models.CASCADE)
    position = models.IntegerField()
    added_at = models.DateTimeField(auto_now_add=True)


class FeeVerification(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    challan_number = models.CharField(max_length=50, null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Complaint(models.Model):
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="complaints_submitted")
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    category = models.CharField(max_length=20, null=True, blank=True)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=15, null=True, blank=True)
    priority = models.CharField(max_length=10, null=True, blank=True)
    admin_response = models.TextField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="complaints_resolved")
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)


class RouteChangeRequest(models.Model):
    registration = models.ForeignKey(SemesterRegistration, on_delete=models.CASCADE)
    current_route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="current_routes")
    requested_route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="requested_routes")
    requested_stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, null=True, blank=True)
    admin_remarks = models.TextField(null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)


class MaintenanceSchedule(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    maintenance_type = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)