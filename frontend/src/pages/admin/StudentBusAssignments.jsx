import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import {
	listCurrentSeatAllocations,
	reassignStudentSeat,
} from "../../services/transportService";

function StudentBusAssignmentsPage() {
	const [allocatedRows, setAllocatedRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [reassigningRegistrationId, setReassigningRegistrationId] = useState(null);
	const [selectedReassignments, setSelectedReassignments] = useState({});

	const fetchAssignmentData = async () => {
		setLoading(true);
		try {
			const allocatedRes = await listCurrentSeatAllocations();
			const fetchedAllocatedRows = allocatedRes.data || [];
			setAllocatedRows(fetchedAllocatedRows);

			const reassignDefaults = {};
			fetchedAllocatedRows.forEach((row) => {
				reassignDefaults[row.registration_id] = String(row.current_route_assignment_id);
			});

			setSelectedReassignments(reassignDefaults);
		} catch {
			alert("Failed to load student seat assignment data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAssignmentData();
	}, []);

	const handleSelectReassignment = (registrationId, assignmentId) => {
		setSelectedReassignments((prev) => ({
			...prev,
			[registrationId]: assignmentId,
		}));
	};

	const handleReassignSeat = async (row) => {
		const assignmentId = selectedReassignments[row.registration_id];
		if (!assignmentId) {
			alert("Please select a target bus assignment first.");
			return;
		}

		if (Number(assignmentId) === Number(row.current_route_assignment_id)) {
			alert("Please choose a different bus assignment to change the seat.");
			return;
		}

		setReassigningRegistrationId(row.registration_id);
		try {
			await reassignStudentSeat({
				registration_id: row.registration_id,
				route_assignment_id: Number(assignmentId),
			});
			await fetchAssignmentData();
		} catch (err) {
			const detail = err.response?.data?.detail || "Failed to reassign seat.";
			alert(detail);
		} finally {
			setReassigningRegistrationId(null);
		}
	};

	const currentColumns = [
		{ key: "roll_number", label: "Roll Number" },
		{ key: "student_name", label: "Student" },
		{ key: "semester", label: "Semester" },
		{ key: "route", label: "Route" },
		{ key: "stop", label: "Stop" },
		{
			key: "current_seat",
			label: "Current Seat",
			render: (row) => `${row.current_bus} - Seat ${row.current_seat_number}`,
		},
		{
			key: "new_assignment",
			label: "Move To",
			render: (row) => {
				const assignmentOptions = row.assignment_options || [];
				const selectedId = selectedReassignments[row.registration_id] || "";
				const selectedOption = assignmentOptions.find(
					(option) => String(option.id) === String(selectedId)
				);

				if (assignmentOptions.length === 0) {
					return <span style={mutedTextStyle}>No active assignment for this route.</span>;
				}

				return (
					<div style={assignmentControlWrapStyle}>
						<select
							value={selectedId}
							onChange={(e) => handleSelectReassignment(row.registration_id, e.target.value)}
							style={selectStyle}
							disabled={reassigningRegistrationId === row.registration_id}
						>
							<option value="">Select Bus</option>
							{assignmentOptions.map((option) => (
								<option key={option.id} value={option.id}>
									{option.bus_number} ({option.available_seats}/{option.total_seats} seats available)
								</option>
							))}
						</select>
						{selectedOption && (
							<span style={mutedTextStyle}>Driver: {selectedOption.driver_name}</span>
						)}
					</div>
				);
			},
		},
		{
			key: "reassign_action",
			label: "Action",
			render: (row) => {
				const assignmentOptions = row.assignment_options || [];
				const selectedId = selectedReassignments[row.registration_id] || "";
				const selectedOption = assignmentOptions.find(
					(option) => String(option.id) === String(selectedId)
				);

				const isBusy = reassigningRegistrationId === row.registration_id;
				const hasSelection = Boolean(selectedOption);
				const isSameAssignment = Number(selectedId) === Number(row.current_route_assignment_id);
				const hasSeatAvailable = Boolean(selectedOption && selectedOption.available_seats > 0);

				return (
					<button
						style={assignBtnStyle}
						onClick={() => handleReassignSeat(row)}
						disabled={isBusy || !hasSelection || isSameAssignment || !hasSeatAvailable}
					>
						{isBusy ? "Changing..." : "Change Seat"}
					</button>
				);
			},
		},
	];

	return (
		<div style={{ display: "flex" }}>
			<Sidebar role="staff" />
			<div style={{ flex: 1 }}>
				<Navbar title="Admin - Student Bus Assignment" />
				<div style={{ padding: "24px" }}>
					<h2>Student Bus Assignments</h2>
					<section style={sectionWrapStyle}>
						<h3 style={sectionHeadingStyle}>Update Existing Seats</h3>
						<p style={mutedTextStyle}>
							Change bus/seat assignment for students who already have an allocated seat.
						</p>
						{loading ? (
							<p>Loading allocated students...</p>
						) : allocatedRows.length === 0 ? (
							<p style={mutedTextStyle}>No current seat allocations available.</p>
						) : (
							<Table columns={currentColumns} rows={allocatedRows} />
						)}
					</section>
				</div>
			</div>
		</div>
	);
}

const mutedTextStyle = { color: "#666", fontSize: "13px" };

const assignmentControlWrapStyle = {
	display: "flex",
	flexDirection: "column",
	gap: "6px",
	minWidth: "230px",
};

const selectStyle = {
	width: "100%",
	padding: "8px",
};

const assignBtnStyle = {
	padding: "8px 14px",
	border: "none",
	borderRadius: "4px",
	background: "#0f3460",
	color: "#fff",
	cursor: "pointer",
	fontWeight: 600,
};

const sectionWrapStyle = {
	padding: "16px",
	border: "1px solid #e5e7eb",
	borderRadius: "8px",
	background: "#fff",
};

const sectionHeadingStyle = {
	margin: "0 0 10px",
	fontSize: "18px",
	color: "#1f2937",
};

export default StudentBusAssignmentsPage;
