from .models import (
    SeatAllocation,
    Waitlist,
    RouteAssignment,
    SemesterRegistration,
    Notification
)

def allocate_seat_for_student(registration):
    route = registration.route
    semester = registration.semester

    # Get active assignment for this route + semester
    assignment = RouteAssignment.objects.filter(
        route=route,
        semester=semester,
        is_active=True
    ).first()

    if not assignment:
        return "No active bus assignment"

    bus_capacity = assignment.bus.capacity

    # Count already allocated seats
    allocated_count = SeatAllocation.objects.filter(
        route_assignment=assignment
    ).count()

    if allocated_count < bus_capacity:
        # Allocate next seat
        seat_number = allocated_count + 1

        SeatAllocation.objects.create(
            registration=registration,
            route_assignment=assignment,
            seat_number=seat_number
        )

        registration.status = "Confirmed"
        registration.save()

        Notification.objects.create(
            user=registration.student.user,
            title="Seat Allocation Update",
            message=f"Your seat has been allocated. Seat No: {seat_number}",
            type="info"
        )

        return "Seat Allocated"

    else:
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