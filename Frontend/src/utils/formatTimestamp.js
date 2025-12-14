/**
 * Formats a timestamp to a human-readable relative time or absolute date
 * @param {string|Date|number} timestamp - ISO string, Date object, or timestamp number
 * @param {Function} t - Optional translation function
 * @returns {string} Formatted timestamp string
 */
export function formatTimestamp(timestamp, t = null) {
  const getTranslation = (key, fallback) => {
    if (t && typeof t === 'function') {
      return t(key) || fallback;
    }
    return fallback;
  };
  
  if (!timestamp) return getTranslation("post.justNow", "Just now");
  
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
    return getTranslation("post.justNow", "Just now");
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return getTranslation("post.justNow", "Just now");
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Less than 1 minute ago
  if (diffSeconds < 60) {
    return getTranslation("post.justNow", "Just now");
  }
  
  // Less than 1 hour ago
  if (diffMinutes < 60) {
    return diffMinutes === 1 
      ? `1 ${getTranslation("post.minuteAgo", "minute ago")}`
      : `${diffMinutes} ${getTranslation("post.minutesAgo", "minutes ago")}`;
  }
  
  // Less than 24 hours ago
  if (diffHours < 24) {
    return diffHours === 1
      ? `1 ${getTranslation("post.hourAgo", "hour ago")}`
      : `${diffHours} ${getTranslation("post.hoursAgo", "hours ago")}`;
  }
  
  // Less than 7 days ago
  if (diffDays < 7) {
    return diffDays === 1
      ? `1 ${getTranslation("post.dayAgo", "day ago")}`
      : `${diffDays} ${getTranslation("post.daysAgo", "days ago")}`;
  }
  
  // Less than 30 days ago - show as weeks
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1
      ? `1 ${getTranslation("post.weekAgo", "week ago")}`
      : `${weeks} ${getTranslation("post.weeksAgo", "weeks ago")}`;
  }
  
  // Less than 365 days ago - show as months
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1
      ? `1 ${getTranslation("post.monthAgo", "month ago")}`
      : `${months} ${getTranslation("post.monthsAgo", "months ago")}`;
  }
  
  // More than a year ago - show absolute date
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

