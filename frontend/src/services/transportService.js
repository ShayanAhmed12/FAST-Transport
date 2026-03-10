import api from "./api";

export const getToken = (credentials) => api.post("/api/token/", credentials);
export const getUser = () => api.get("/api/user/");
export const signup = (data) => api.post("/api/signup/", data);

export const getDashboard = () => api.get("/api/dashboard/");

export const getStudents = () => api.get("/api/students/");

export const getBuses = () => api.get("/api/buses/");
export const createBus = (data) => api.post("/api/buses/", data);
export const updateBus = (id, data) => api.patch(`/api/buses/${id}/`, data);

export const getDrivers = () => api.get("/api/drivers/");
export const createDriver = (data) => api.post("/api/drivers/", data);
export const updateDriver = (id, data) => api.patch(`/api/drivers/${id}/`, data);

export const getRoutes = () => api.get("/api/routes/");
export const createRoute = (data) => api.post("/api/routes/", data);
export const updateRoute = (id, data) => api.patch(`/api/routes/${id}/`, data);

export const getAssignments = () => api.get("/api/route-assignments/");
export const createAssignment = (data) => api.post("/api/route-assignments/", data);
export const updateAssignment = (id, data) => api.patch(`/api/route-assignments/${id}/`, data);

export const getSemesters = () => api.get("/api/semesters/");
export const createSemester = (data) => api.post("/api/semesters/", data);
export const updateSemester = (id, data) => api.patch(`/api/semesters/${id}/`, data);

export const getComplaints = () => api.get("/api/complaints/");
export const createComplaint = (data) => api.post("/api/complaints/", data);

export const getStops = () => api.get("/api/stops/");
export const createStop = (data) => api.post("/api/stops/", data);