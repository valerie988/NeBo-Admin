import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password, role: "admin" }),
};

// ── Admin endpoints ───────────────────────────────────────────────────────────
export const adminApi = {
  // Dashboard stats
  stats: () => api.get("/api/admin/stats"),

  // Users
  users:        (params?: any)          => api.get("/api/admin/users", { params }),
  getUser:      (id: string)            => api.get(`/api/admin/users/${id}`),
  verifyFarmer: (id: string)            => api.post(`/api/admin/users/${id}/verify`),
  badgeFarmer:  (id: string, badge: string) => api.post(`/api/admin/users/${id}/badge`, { badge }),
  banUser:      (id: string)            => api.post(`/api/admin/users/${id}/ban`),
  unbanUser:    (id: string)            => api.post(`/api/admin/users/${id}/unban`),
  deleteUser:   (id: string)            => api.delete(`/api/admin/users/${id}`),

  // Products
  products:       (params?: any)        => api.get("/api/admin/products", { params }),
  approveProduct: (id: string)          => api.post(`/api/admin/products/${id}/approve`),
  flagProduct:    (id: string, reason: string) => api.post(`/api/admin/products/${id}/flag`, { reason }),
  deleteProduct:  (id: string)          => api.delete(`/api/admin/products/${id}`),

  // Orders
  orders: (params?: any) => api.get("/api/admin/orders", { params }),

  // Chat
  conversations: (params?: any) => api.get("/api/admin/conversations", { params }),
  messages:      (id: string)   => api.get(`/api/admin/conversations/${id}/messages`),

  // Notifications
  sendPush: (payload: any) => api.post("/api/admin/notifications/send", payload),

  // Analytics
  analytics: (range: string) => api.get("/api/admin/analytics", { params: { range } }),
};

export default api;
