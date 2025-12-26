import axios from 'axios';

const runtimeBaseURL =
  (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_BASE_URL) || '';

const baseURL = runtimeBaseURL || import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export default api;
