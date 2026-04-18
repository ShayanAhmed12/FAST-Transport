import axios from "axios";

const LOADING_EVENT = "app:network-loading";
let pendingRequestCount = 0;

function emitLoadingState() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LOADING_EVENT, {
      detail: { count: pendingRequestCount },
    })
  );
}

function beginRequest() {
  pendingRequestCount += 1;
  emitLoadingState();
}

function endRequest() {
  pendingRequestCount = Math.max(0, pendingRequestCount - 1);
  emitLoadingState();
}

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use(
  (config) => {
    beginRequest();
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    endRequest();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    endRequest();
    return response;
  },
  async (error) => {
    endRequest();
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post("http://localhost:8000/api/token/refresh/", { refresh });
          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
