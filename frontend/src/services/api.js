const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.detail || 'API request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Websites
  getWebsites: () => request('/websites'),
  createWebsite: (payload) => request('/websites', { method: 'POST', body: JSON.stringify(payload) }),
  updateWebsite: (id, payload) => request(`/websites/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteWebsite: (id) => request(`/websites/${id}`, { method: 'DELETE' }),
  getMetrics: () => request('/websites/metrics/summary'),

  // Checks & Audits
  triggerCheck: (siteId) => request(`/websites/${siteId}/check`, { method: 'POST' }),
  getLogs: (siteId, limit = 50) => request(`/websites/${siteId}/logs?limit=${limit}`),
  getAudits: (siteId, limit = 10) => request(`/websites/${siteId}/audits?limit=${limit}`),

  // Alerts
  getAlerts: (siteId) => request(`/websites/${siteId}/alerts`),
  createAlert: (siteId, payload) => request(`/websites/${siteId}/alerts`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteAlert: (siteId, alertId) => request(`/websites/${siteId}/alerts/${alertId}`, { method: 'DELETE' }),
};
