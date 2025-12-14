/**
 * @param {string|Date|number} timestamp 
 * @param {Function} t 
 * @returns {string} 
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
  
  if (typeof timestamp === 'string') {
    if (timestamp === "Just now" || timestamp === "Moments ago" || timestamp.toLowerCase().includes("ago")) {
      return timestamp;
    }
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return getTranslation("post.justNow", "Just now");
  }
  
  if (isNaN(date.getTime())) {
    return getTranslation("post.justNow", "Just now");
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return getTranslation("post.justNow", "Just now");
  }
  
  if (diffMinutes < 60) {
    return diffMinutes === 1 
      ? `1 ${getTranslation("post.minuteAgo", "minute ago")}`
      : `${diffMinutes} ${getTranslation("post.minutesAgo", "minutes ago")}`;
  }
  
  if (diffHours < 24) {
    return diffHours === 1
      ? `1 ${getTranslation("post.hourAgo", "hour ago")}`
      : `${diffHours} ${getTranslation("post.hoursAgo", "hours ago")}`;
  }
  
  if (diffDays < 7) {
    return diffDays === 1
      ? `1 ${getTranslation("post.dayAgo", "day ago")}`
      : `${diffDays} ${getTranslation("post.daysAgo", "days ago")}`;
  }
  
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1
      ? `1 ${getTranslation("post.weekAgo", "week ago")}`
      : `${weeks} ${getTranslation("post.weeksAgo", "weeks ago")}`;
  }
  
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1
      ? `1 ${getTranslation("post.monthAgo", "month ago")}`
      : `${months} ${getTranslation("post.monthsAgo", "months ago")}`;
  }
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

