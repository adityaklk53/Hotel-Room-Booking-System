import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('hotel-auth')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Global error handler — redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hotel-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { name: '', email, password }),
  me: () => api.get('/auth/me'),
}

// ── Rooms ─────────────────────────────────────────────────────────────────────
export const roomsApi = {
  list: (params?: Record<string, string>) => api.get('/rooms/', { params }),
  getById: (id: string) => api.get(`/rooms/${id}`),
  create: (data: unknown) => api.post('/rooms/', data),
  update: (id: string, data: unknown) => api.put(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (data: unknown) => api.post('/bookings/', data),
  myBookings: () => api.get('/bookings/my'),
  all: () => api.get('/bookings/'),
  cancel: (id: string) => api.patch(`/bookings/${id}/cancel`),
  updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
}
