import api from './axios';

// Auth
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

// Projects
export const projectAPI = {
  getAll: (params) => api.get('/api/projects', { params }),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  getMy: () => api.get('/api/projects/my'),
  updateStatus: (id, status) => api.patch(`/api/projects/${id}/status`, { status }),
};

// Bids
export const bidAPI = {
  place: (projectId, data) => api.post(`/api/bids/project/${projectId}`, data),
  getForProject: (projectId) => api.get(`/api/bids/project/${projectId}`),
  getMy: () => api.get('/api/bids/my'),
  accept: (id) => api.post(`/api/bids/${id}/accept`),
  reject: (id) => api.post(`/api/bids/${id}/reject`),
};

// Payments
export const paymentAPI = {
  initiate: (data) => api.post('/api/payments/initiate', data),
  release: (id) => api.post(`/api/payments/${id}/release`),
  getMy: () => api.get('/api/payments/my'),
};

// Submissions
export const submissionAPI = {
  submit: (projectId, data) => api.post(`/api/submissions/project/${projectId}`, data),
  getForProject: (projectId) => api.get(`/api/submissions/project/${projectId}`),
  review: (id, data) => api.post(`/api/submissions/${id}/review`, data),
};

// Messages
export const messageAPI = {
  send: (data) => api.post('/api/messages/send', data),
  getConversation: (userId) => api.get(`/api/messages/conversation/${userId}`),
  getPartners: () => api.get('/api/messages/partners'),
  getUnread: () => api.get('/api/messages/unread'),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAllRead: () => api.post('/api/notifications/mark-all-read'),
  markRead: (id) => api.post(`/api/notifications/${id}/read`),
};

// Users
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  getById: (id) => api.get(`/api/users/${id}`),
  updateProfile: (data) => api.put('/api/users/profile', data),
  addFunds: (amount) => api.post('/api/users/wallet/add', { amount }),
  getReviews: (id) => api.get(`/api/users/${id}/reviews`),
  submitReview: (data) => api.post('/api/users/reviews', data),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
  getProjects: () => api.get('/api/admin/projects'),
};

// AI
export const aiAPI = {
  chat: (data) => api.post('/api/ai/chat', data),
};
