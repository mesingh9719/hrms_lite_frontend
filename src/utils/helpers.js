/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date
 */
export function formatDate(dateStr, options = {}) {
  const defaultOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return new Date(dateStr).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Get today's date formatted
 * @returns {string} - Today's date formatted
 */
export function getTodayFormatted() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string}
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}
