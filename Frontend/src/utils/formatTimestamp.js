/**
 * Formats a timestamp to a human-readable relative time or absolute date
 * @param {string|Date|number} timestamp - ISO string, Date object, or timestamp number
 * @returns {string} Formatted timestamp string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return "Just now";
  
  let date;
  
  // Handle different timestamp formats
  if (typeof timestamp === 'string') {
    // If it's already a formatted string like "Just now", return it
    if (timestamp === "Just now" || timestamp === "Moments ago" || timestamp.toLowerCase().includes("ago")) {
      return timestamp;
    }
    // Try to parse as ISO string or date string
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return "Just now";
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Just now";
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Less than 1 minute ago
  if (diffSeconds < 60) {
    return "Just now";
  }
  
  // Less than 1 hour ago
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than 24 hours ago
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than 7 days ago
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // Less than 30 days ago - show as weeks
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // Less than 365 days ago - show as months
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  // More than a year ago - show absolute date
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

