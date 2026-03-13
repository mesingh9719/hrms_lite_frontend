const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'https://etharabackend-phi.vercel.app/api';

/**
 * Parse error response and return user-friendly message
 */
function parseErrorMessage(data) {
  // Handle new error format: { success: false, error: { message, fields } }
  if (data?.error?.message) {
    return data.error.message;
  }
  
  // Handle field-level errors: { error: { fields: { field_name: "error" } } }
  if (data?.error?.fields) {
    const fieldErrors = Object.entries(data.error.fields)
      .map(([field, msg]) => {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `${fieldName}: ${msg}`;
      })
      .join('. ');
    return fieldErrors;
  }
  
  // Handle legacy format: { errors: { field: ["error"] } }
  if (data?.errors && typeof data.errors === 'object') {
    return Object.entries(data.errors)
      .map(([field, msgs]) => {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
        return `${fieldName}: ${message}`;
      })
      .join('. ');
  }
  
  // Simple error string
  if (typeof data?.error === 'string') {
    return data.error;
  }
  
  return 'Something went wrong. Please try again.';
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error('Could not connect to the backend API.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = parseErrorMessage(data);
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = data;
    error.fields = data?.error?.fields || data?.errors || {};
    throw error;
  }

  return data;
}

export async function getEmployees() {
  const data = await request('/employees/');
  // Handle paginated response
  return Array.isArray(data) ? data : (data.results || []);
}

export function createEmployee(payload) {
  return request('/employees/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeEmployee(employeePk) {
  return request(`/employees/${employeePk}/`, {
    method: 'DELETE',
  });
}

export function getAttendance({ employeeId, date }) {
  const params = new URLSearchParams();
  if (employeeId) params.set('employee_id', employeeId);
  if (date) params.set('date', date);
  const query = params.toString();
  return request(`/attendance/${query ? `?${query}` : ''}`);
}

export async function getEmployeeAttendance(employeePk) {
  const data = await request(`/employees/${employeePk}/attendance/`);
  // Handle paginated response
  return Array.isArray(data) ? data : (data.results || []);
}

export function createAttendance(payload) {
  return request('/attendance/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getDashboardSummary() {
  return request('/dashboard/');
}
