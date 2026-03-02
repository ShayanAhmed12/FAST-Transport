from django.db import models

# All models here.

from django.db import models
from django.contrib.auth.models import User

print("models.py loaded")

# All models here.

#Student Profile
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    roll_number = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=10)
    batch = models.CharField(max_length=10)
    phone = models.CharField(max_length=20)
    address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.roll_number

#Semester Model
class Semester(models.Model):
    name = models.CharField(max_length=50)
    year = models.IntegerField()
    term = models.CharField(max_length=10)
    start_date = models.DateField()
    end_date = models.DateField()

    is_active = models.BooleanField(default=False)
    registration_open = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} {self.year}"
    

#Route Model
class Route(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
#Stop Model
class Stop(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
