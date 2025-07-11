import axios from "axios";

const BASE_URL = "http://localhost:5073";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          if (refreshResponse.data.Success) {
            // Update tokens
            localStorage.setItem(
              "token",
              refreshResponse.data.Data.AccessToken
            );
            localStorage.setItem(
              "refreshToken",
              refreshResponse.data.Data.RefreshToken
            );

            // Retry original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.Data.AccessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("userName");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        // No refresh token, clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  register: async (username: string, password: string) => {
    const response = await api.post("/auth/register", {
      username,
      password,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  revokeToken: async (refreshToken: string) => {
    const response = await api.post("/auth/revoke", {
      refreshToken,
    });
    return response.data;
  },
};

// Pump API methods
export const pumpAPI = {
  getAllPumps: async (params?: {
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    pageNumber?: number;
    pageSize?: number;
    filter?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortDirection)
      queryParams.append("sortDirection", params.sortDirection);
    if (params?.pageNumber)
      queryParams.append("pageNumber", params.pageNumber.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.filter) queryParams.append("filter", params.filter);

    const response = await api.get(`/api/pump?${queryParams.toString()}`);
    return response.data;
  },

  getPumpById: async (id: number) => {
    const response = await api.get(`/api/pump/${id}`);
    return response.data;
  },

  createPump: async (pumpData: any) => {
    const response = await api.post("/api/pump", pumpData);
    return response.data;
  },

  updatePump: async (id: number, pumpData: any) => {
    const response = await api.put(`/api/pump/${id}`, pumpData);
    return response.data;
  },

  deletePump: async (id: number) => {
    const response = await api.delete(`/api/pump/${id}`);
    return response.data;
  },
};

// Pump Inspection API methods
export const pumpInspectionAPI = {
  getInspectionsByPump: async (pumpId: number) => {
    const response = await api.get(`/api/pumpinspection/pump/${pumpId}`);
    return response.data;
  },

  getPressureHistory: async (pumpId: number, days: number = 30) => {
    const response = await api.get(
      `/api/pumpinspection/pump/${pumpId}/pressure-history?days=${days}`
    );
    return response.data;
  },

  addInspection: async (inspectionData: {
    pumpId: number;
    pressureReading: number;
    flowRateReading: number;
    notes?: string;
    isOperational: boolean;
  }) => {
    const response = await api.post("/api/pumpinspection", inspectionData);
    return response.data;
  },
};

// Dashboard API methods
export const dashboardAPI = {
  getDashboardStats: async () => {
    const response = await api.get("/api/dashboard/stats");
    return response.data;
  },
};

export default api;
