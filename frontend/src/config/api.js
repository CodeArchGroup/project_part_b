const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    ADMIN: '/admin',
    COMPLIANCE: '/shariah/compliance',
    GOALS: '/goals',
    SHARIAH_RULES: '/shariah/rules'
  }
};

export const apiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

export const authHeaders = (includeJson = false) => {
  const token = localStorage.getItem('itqan_token');
  const headers = { Authorization: `Bearer ${token}` };

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};
