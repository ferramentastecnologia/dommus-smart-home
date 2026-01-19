/**
 * Formats a date string in a user-friendly format
 * @param dateString ISO date string or any valid date input
 * @param format Optional format specification (defaults to localized date string)
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateString}`);
    return dateString;
  }
  
  // Default formatting (localized date)
  if (!format) {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Simple custom formatting for common cases
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'datetime':
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Get relative time description (e.g., "2 days ago", "in 3 hours")
 * @param dateString ISO date string or any valid date input
 * @returns Human-readable relative time
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHrs = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHrs / 24);
  
  if (diffDays === 0) {
    if (diffHrs === 0) {
      if (diffMin === 0) {
        return 'just now';
      }
      return diffMin > 0 ? `in ${diffMin} minute${diffMin !== 1 ? 's' : ''}` : `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? 's' : ''} ago`;
    }
    return diffHrs > 0 ? `in ${diffHrs} hour${diffHrs !== 1 ? 's' : ''}` : `${Math.abs(diffHrs)} hour${Math.abs(diffHrs) !== 1 ? 's' : ''} ago`;
  }
  
  return diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
};

/**
 * Format time from 24-hour format to 12-hour AM/PM format
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Time string in 12-hour format (hh:MM AM/PM)
 */
export const formatTime12Hour = (time: string): string => {
  if (!time || !time.includes(':')) return time;
  
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr, 10);
  
  if (isNaN(hour)) return time;
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minute} ${period}`;
}; 