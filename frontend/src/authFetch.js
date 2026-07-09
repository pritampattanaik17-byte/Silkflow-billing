import API_BASE_URL from './config';

/**
 * Authenticated fetch wrapper.
 *
 * - Automatically attaches the JWT Bearer token from localStorage.
 * - Checks for 401 responses (expired/invalid token) and triggers logout.
 * - Provides consistent error handling.
 *
 * Usage:
 *   const data = await authFetch('/invoices');
 *   const data = await authFetch('/invoices', { method: 'POST', body: JSON.stringify(payload) });
 */
export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  // Attach Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Default Content-Type for requests with a body
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear auth and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Only redirect if not already on login/register page
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Session expired. Please log in again.');
  }

  return response;
};

/**
 * Checks if the stored JWT token is expired.
 * Returns true if expired or missing, false if still valid.
 */
export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    // JWT structure: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Malformed token
  }
};
