import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.contrib.auth.models import User, Group
from apps.transport.models import (
    StudentProfile, TransportRegistration, SemesterRegistration,
    Challan, FeeVerification
)

# Step 1 - Student group
student_group, _ = Group.objects.get_or_create(name="Student")
for u in User.objects.filter(is_staff=False):
    if not u.groups.filter(name="Student").exists():
        u.groups.add(student_group)
        print(f"[GROUP] Added {u.username} to Student group")

# Step 2 - SemesterRegistration for every TransportRegistration
for reg in TransportRegistration.objects.select_related("student", "semester", "route", "stop"):
    if not reg.route or not reg.stop:
        print(f"[SKIP] TransportRegistration {reg.id} has no route/stop")
        continue
    sem_reg, created = SemesterRegistration.objects.get_or_create(
        student=reg.student,
        semester=reg.semester,
        defaults={"route": reg.route, "stop": reg.stop, "status": reg.status}
    )
    if created:
        print(f"[SEMREG] Created for {reg.student.roll_number} - {reg.semester.name}")
    else:
        print(f"[SEMREG] Already exists for {reg.student.roll_number} - {reg.semester.name}")

# Step 3 - FeeVerification for every paid challan
for challan in Challan.objects.filter(status="paid").select_related("student", "registration__semester"):
    fv, created = FeeVerification.objects.get_or_create(
        student=challan.student,
        semester=challan.registration.semester,
        defaults={"amount": challan.amount, "challan_number": f"CHN-{challan.id:04d}"}
    )
    if created:
        print(f"[FEE] Created FeeVerification for {challan.student.roll_number}")
    else:
        print(f"[FEE] Already exists for {challan.student.roll_number}")

# Summary
print("\n── Summary ──")
print(f"TransportRegistrations: {TransportRegistration.objects.count()}")
print(f"SemesterRegistrations:  {SemesterRegistration.objects.count()}")
print(f"FeeVerifications:       {FeeVerification.objects.count()}")
print(f"Paid challans:          {Challan.objects.filter(status='paid').count()}")