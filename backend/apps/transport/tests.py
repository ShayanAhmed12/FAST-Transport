from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import (
	Bus,
	Driver,
	FeeVerification,
	Route,
	RouteAssignment,
	RouteStop,
	SeatAllocation,
	Semester,
	SemesterRegistration,
	Stop,
	StudentProfile,
	TransportRegistration,
	Waitlist,
)


class TransportAllocationFlowTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.admin = User.objects.create_user(
			username="admin",
			password="adminpass",
			is_staff=True,
		)

		self.semester = Semester.objects.create(
			name="Spring",
			year=2026,
			term="S",
			is_active=True,
			registration_open=True,
		)
		self.route = Route.objects.create(name="Route A", is_active=True)
		self.stop = Stop.objects.create(name="Stop A")
		RouteStop.objects.create(route=self.route, stop=self.stop, stop_order=1)

		self.bus = Bus.objects.create(bus_number="BUS-1", capacity=1, is_active=True)
		self.driver = Driver.objects.create(name="Driver 1", is_available=True)
		self.assignment = RouteAssignment.objects.create(
			route=self.route,
			bus=self.bus,
			driver=self.driver,
			semester=self.semester,
			is_active=True,
		)

		self.bus_2 = Bus.objects.create(bus_number="BUS-2", capacity=2, is_active=True)
		self.driver_2 = Driver.objects.create(name="Driver 2", is_available=True)
		self.assignment_2 = RouteAssignment.objects.create(
			route=self.route,
			bus=self.bus_2,
			driver=self.driver_2,
			semester=self.semester,
			is_active=True,
		)

	def _create_student_with_profile(self, suffix):
		user = User.objects.create_user(username=f"student_{suffix}", password="pass1234")
		profile = StudentProfile.objects.create(
			user=user,
			roll_number=f"22F-{suffix}",
			department="CS",
			batch="22",
			phone="000",
			address="Address",
		)
		return user, profile

	def _create_transport_registration(self, user):
		self.client.force_authenticate(user=user)
		response = self.client.post(
			"/api/transport-registrations/",
			{"stop_id": self.stop.id, "semester_id": self.semester.id},
			format="json",
		)
		self.assertEqual(response.status_code, 201)
		return response

	def _verify_fee_as_admin(self, profile):
		fee = FeeVerification.objects.create(
			student=profile,
			semester=self.semester,
			amount=45000,
			challan_number=f"CHN-{profile.roll_number}",
			is_verified=False,
		)
		self.client.force_authenticate(user=self.admin)
		response = self.client.post(f"/api/fee-verifications/{fee.id}/verify/")
		self.assertEqual(response.status_code, 200)
		return fee

	def test_route_is_auto_assigned_on_transport_registration(self):
		student_user, profile = self._create_student_with_profile("001")
		self._create_transport_registration(student_user)

		registration = TransportRegistration.objects.get(student=profile, semester=self.semester)
		self.assertEqual(registration.route_id, self.route.id)

		semester_registration = SemesterRegistration.objects.get(
			student=profile,
			semester=self.semester,
		)
		self.assertEqual(semester_registration.route_id, self.route.id)
		self.assertEqual(semester_registration.stop_id, self.stop.id)

	def test_seat_is_auto_allocated_after_fee_verification(self):
		student_user, profile = self._create_student_with_profile("002")
		self._create_transport_registration(student_user)
		self._verify_fee_as_admin(profile)

		seat = SeatAllocation.objects.get(registration__student=profile, registration__semester=self.semester)
		self.assertEqual(seat.route_assignment_id, self.assignment.id)
		self.assertEqual(seat.seat_number, 1)

		registration = TransportRegistration.objects.get(student=profile, semester=self.semester)
		self.assertEqual(registration.status, "Approved")

	def test_waitlist_is_auto_created_when_bus_is_full(self):
		first_user, first_profile = self._create_student_with_profile("003")
		self._create_transport_registration(first_user)
		self._verify_fee_as_admin(first_profile)

		second_user, second_profile = self._create_student_with_profile("004")
		self._create_transport_registration(second_user)
		self._verify_fee_as_admin(second_profile)

		seat_count = SeatAllocation.objects.filter(
			registration__semester=self.semester,
			route_assignment=self.assignment,
		).count()
		self.assertEqual(seat_count, 1)

		waitlist = Waitlist.objects.get(registration__student=second_profile, registration__semester=self.semester)
		self.assertEqual(waitlist.position, 1)

	def test_admin_can_reassign_existing_seat(self):
		student_user, profile = self._create_student_with_profile("005")
		self._create_transport_registration(student_user)
		self._verify_fee_as_admin(profile)

		registration = SemesterRegistration.objects.get(student=profile, semester=self.semester)

		self.client.force_authenticate(user=self.admin)
		response = self.client.post(
			"/api/seat-allocations/reassign/",
			{
				"registration_id": registration.id,
				"route_assignment_id": self.assignment_2.id,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		seat = SeatAllocation.objects.get(registration=registration)
		self.assertEqual(seat.route_assignment_id, self.assignment_2.id)
		self.assertEqual(seat.seat_number, 1)

	def test_reassign_requires_verified_fee(self):
		_, profile = self._create_student_with_profile("006")
		registration = SemesterRegistration.objects.create(
			student=profile,
			semester=self.semester,
			route=self.route,
			stop=self.stop,
			status="Confirmed",
		)
		SeatAllocation.objects.create(
			registration=registration,
			route_assignment=self.assignment,
			seat_number=1,
		)

		self.client.force_authenticate(user=self.admin)
		response = self.client.post(
			"/api/seat-allocations/reassign/",
			{
				"registration_id": registration.id,
				"route_assignment_id": self.assignment_2.id,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn("not verified", response.data.get("detail", ""))
