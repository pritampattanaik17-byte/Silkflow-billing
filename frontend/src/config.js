// Central API configuration
// In development: uses localhost backend
// In production (Vercel): uses relative URL (same domain)
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : '/api';

export default API_BASE_URL;
