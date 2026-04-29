import axios from "axios";

const API_URL = "http://localhost:8000/api";
export const STORAGE_URL = "http://localhost:8000/storage";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const residentService = {
  getAll: (params) => api.get("/residents", { params }),
  getById: (id) => api.get(`/residents/${id}`),
  create: (data) => {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }
    return api.post("/residents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }
    formData.append("_method", "PUT");
    return api.post(`/residents/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id) => api.delete(`/residents/${id}`),
  deleteAll: () => api.delete("/residents"),
};

export const houseService = {
  getAll: (params) => api.get("/houses", { params }),
  getById: (id) => api.get(`/houses/${id}`),
  create: (data) => api.post("/houses", data),
  update: (id, data) => api.put(`/houses/${id}`, data),
  delete: (id) => api.delete(`/houses/${id}`),
  assignResident: (id, data) => api.post(`/houses/${id}/assign`, data),
  vacate: (id, data) => api.post(`/houses/${id}/vacate`, data),
};

export const paymentService = {
  getAll: (params) => api.get("/payments", { params }),
  create: (data) => api.post("/payments", data),
  calculate: (data) => api.get("/payments/calculate", { params: data }),
  delete: (id) => api.delete(`/payments/${id}`),
  deleteBulk: (ids) => api.delete("/payments", { data: { ids } }),
};

export const expenseService = {
  getAll: (params) => api.get("/expenses", { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  deleteAll: () => api.delete("/expenses"),
};

export const dashboardService = {
  getData: (month, year) => api.get("/dashboard", { params: { month, year } }),
};

export const billingService = {
  getSummary: (params) => api.get("/billing/summary", { params }),
};

export default api;
