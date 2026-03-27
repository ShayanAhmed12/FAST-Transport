from django.db import transaction
from django.db.models import F

from .models import (
    SeatAllocation,
    Waitlist,
    RouteAssignment,
    SemesterRegistration,
    Notification
)


def _remove_waitlist_entry(registration):
    waitlist_entry = Waitlist.objects.filter(registration=registration).first()
    if not waitlist_entry:
        return

    Waitlist.objects.filter(
        registration__route=registration.route,
        registration__semester=registration.semester,
        position__gt=waitlist_entry.position,
    ).update(position=F("position") - 1)
    waitlist_entry.delete()


def _get_next_available_seat_number(route_assignment):
    occupied_seats = set(
        SeatAllocation.objects.filter(route_assignment=route_assignment).values_list("seat_number", flat=True)
    )

    for seat_number in range(1, route_assignment.bus.capacity + 1):
        if seat_number not in occupied_seats:
            return seat_number

    return None


def allocate_seat_on_assignment(registration, assignment):
    """Allocate a seat on a specific active route assignment."""
    if SeatAllocation.objects.filter(registration=registration).exists():
        return "Seat already allocated"

    if assignment.route_id != registration.route_id or assignment.semester_id != registration.semester_id:
        return "Assignment does not match student's route and semester"

    if not assignment.is_active:
        return "Route assignment is inactive"

    if not assignment.bus.is_active:
        return "Assigned bus is inactive"

    with transaction.atomic():
        locked_assignment = RouteAssignment.objects.select_for_update().select_related("bus").get(pk=assignment.pk)

        seat_number = _get_next_available_seat_number(locked_assignment)
        if seat_number is None:
            return "Bus is full"

        SeatAllocation.objects.create(
            registration=registration,
            route_assignment=locked_assignment,
            seat_number=seat_number
        )

    _remove_waitlist_entry(registration)

    registration.status = "Confirmed"
    registration.save(update_fields=["status", "updated_at"])

    Notification.objects.create(
        user=registration.student.user,
        title="Seat Allocation Update",
        message=f"Your seat has been allocated. Seat No: {seat_number}",
        type="info"
    )

    return "Seat Allocated"


def reassign_seat_on_assignment(registration, assignment):
    """Move an already allocated student to another active assignment for same route+semester."""
    current_allocation = SeatAllocation.objects.select_related("route_assignment").filter(
        registration=registration
    ).first()
    if not current_allocation:
        return "No seat allocated for this registration"

    if assignment.route_id != registration.route_id or assignment.semester_id != registration.semester_id:
        return "Assignment does not match student's route and semester"

    if not assignment.is_active:
        return "Route assignment is inactive"

    if not assignment.bus.is_active:
        return "Assigned bus is inactive"

    if current_allocation.route_assignment_id == assignment.id:
        return "Student is already assigned to this bus"

    with transaction.atomic():
        assignment_ids = sorted([current_allocation.route_assignment_id, assignment.id])
        locked_assignments = {
            item.id: item
            for item in RouteAssignment.objects.select_for_update().select_related("bus").filter(
                id__in=assignment_ids
            )
        }

        target_assignment = locked_assignments.get(assignment.id)
        if not target_assignment or not target_assignment.is_active or not target_assignment.bus.is_active:
            return "Route assignment is inactive"

        seat_number = _get_next_available_seat_number(target_assignment)
        if seat_number is None:
            return "Bus is full"

        SeatAllocation.objects.filter(pk=current_allocation.pk).delete()
        SeatAllocation.objects.create(
            registration=registration,
            route_assignment=target_assignment,
            seat_number=seat_number,
        )

    Notification.objects.create(
        user=registration.student.user,
        title="Seat Allocation Update",
        message=(
            f"Your seat has been changed to bus {assignment.bus.bus_number}. "
            f"New seat number: {seat_number}"
        ),
        type="info",
    )

    return "Seat Reassigned"

def allocate_seat_for_student(registration):
    route = registration.route
    semester = registration.semester

    # Keep allocation idempotent in case this function is triggered multiple times
    # for the same registration (e.g., via API flow + post_save signal).
    if SeatAllocation.objects.filter(registration=registration).exists():
        return "Seat already allocated"

    if Waitlist.objects.filter(registration=registration).exists():
        return "Already on waitlist"

    # Get active assignment for this route + semester
    assignment = RouteAssignment.objects.filter(
        route=route,
        semester=semester,
        is_active=True
    ).first()

    if not assignment:
        return "No active bus assignment"

    allocation_result = allocate_seat_on_assignment(registration, assignment)
    if allocation_result == "Bus is full":
        # Add to waitlist
        waitlist_position = Waitlist.objects.filter(
            registration__route=route,
            registration__semester=semester
        ).count() + 1

        Waitlist.objects.create(
            registration=registration,
            position=waitlist_position
        )

        registration.status = "Waitlisted"
        registration.save()

        Notification.objects.create(
            user=registration.student.user,
            title="Seat Allocation Update",
            message=f"You are on waitlist. Position: {waitlist_position}",
            type="info"
        )

        return "Added to Waitlist"

    return allocation_result