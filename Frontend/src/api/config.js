
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7050";
const USE_API_MOCKS = false;

const ACCESS_TOKEN_KEY = "bookverse_access_token";
const REFRESH_TOKEN_KEY = "bookverse_refresh_token";


export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getEmailFromToken() {
  try {
    const token = getAccessToken();
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
     let payload = parts[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    while (payload.length % 4) {
      payload += '=';
    }
    
    const decodedPayload = JSON.parse(atob(payload));
    
    return decodedPayload.email || decodedPayload.Email || null;
  } catch (error) {
    return null;
  }
}


async function rawRequest(path, { method = "GET", body, headers = {} } = {}) {
  const token = getAccessToken();

  const finalHeaders = { ...headers };

  if (finalHeaders["Content-Type"] === undefined) {
    delete finalHeaders["Content-Type"];
  }

  const isFormData = body instanceof FormData;

  if (!isFormData && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  } else {
    const authRequiredPaths = [
      "/get-current-user-profile",
      "/create-book-review",
      "/get-current-user-reviews",
    ];
    const requiresAuth = authRequiredPaths.some((requiredPath) => path.includes(requiredPath));
    if (requiresAuth) {
      const error = new Error("Authentication required. Please login again.");
      error.status = 401;
      throw error;
    }
  }

  const requestBody = isFormData
    ? body
    : body !== undefined
    ? JSON.stringify(body)
    : undefined;

  const isUserProfileEndpoint = path.includes('/get-user-profile-by-id/') || path.includes('/get-user-profile-by-username/');
  
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: requestBody,
    });
  } catch (networkError) {
    const isConnectionError = 
      networkError.message?.includes("Failed to fetch") ||
      networkError.message?.includes("ERR_CONNECTION_REFUSED") ||
      networkError.message?.includes("NetworkError") ||
      networkError.name === "TypeError";
    
    if (isConnectionError) {
      const friendlyError = new Error("error.network");
      friendlyError.isNetworkError = true;
      friendlyError.translationKey = "error.network";
      friendlyError.originalError = networkError;
      throw friendlyError;
    }
    
    throw networkError;
  }

  if (res.status === 204) {
    return null; 
  }

  let data;
  const contentType = res.headers.get("content-type")?.toLowerCase() || "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    try {
      data = await res.json();
    } catch (e) {
      data = await res.text();
    }
  } else {
    const textData = await res.text();
    data = textData || null;
  }

  if (!res.ok) {
    if (res.status === 404 && isUserProfileEndpoint) {
      return null;
    }
    
    let errorMessage = "error.default";
    let translationKey = null;
    
    if (data) {
      if (typeof data === 'object' && data.title && data.detail) {
        errorMessage = data.detail;
      } else if (typeof data === 'object' && data.title && !data.detail) {
        errorMessage = data.title;
      } else if (typeof data === 'object' && data.errorMessages && Array.isArray(data.errorMessages) && data.errorMessages.length > 0) {
        errorMessage = data.errorMessages[0];
      } else if (typeof data === 'object' && data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'string' && data.trim()) {
        errorMessage = data;
      } else if (typeof data === 'object') {
        errorMessage = null; 
      }
    }
    
    if (!errorMessage || errorMessage === "error.default" || errorMessage === "Xəta baş verdi" || errorMessage === "Request failed with error" || 
        errorMessage === "Internal Server Error" || errorMessage === "An error occurred while processing your request.") {
      switch (res.status) {
        case 400:
          translationKey = "error.400";
          errorMessage = "error.400";
          break;
        case 401:
          translationKey = "error.401";
          errorMessage = "error.401";
          break;
        case 403:
          translationKey = "error.403";
          errorMessage = "error.403";
          break;
        case 404:
          translationKey = "error.404";
          errorMessage = "error.404";
          break;
        case 409:
          translationKey = "error.409";
          errorMessage = "error.409";
          break;
        case 422:
          translationKey = "error.422";
          errorMessage = "error.422";
          break;
        case 500:
          translationKey = "error.500";
          errorMessage = "error.500";
          break;
        case 502:
          translationKey = "error.502";
          errorMessage = "error.502";
          break;
        case 503:
          translationKey = "error.503";
          errorMessage = "error.503";
          break;
        default:
          translationKey = "error.generic";
          errorMessage = "error.generic";
      }
    }
    
    const error = new Error(errorMessage);
    if (translationKey) {
      error.translationKey = translationKey;
      error.status = res.status; 
    }
    error.status = res.status;
    error.data = data;
    throw error;
  }

  if (res.status === 201 && res.headers) {
    const location = res.headers.get("Location");
    if (location) {
      const match = location.match(/\/get-book-by-id\/([^\/\?]+)/);
      if (match && match[1]) {
        return { ...data, id: match[1], location: location };
      }
    }
  }

  return data;
}

export async function apiRequest(
  path,
  options = {},
  { onUnauthorized } = {}
) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    if (err.status === 401 && typeof onUnauthorized === "function") {
      await onUnauthorized(err);
    }
    throw err;
  }
}

export function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export function getImageUrl(url) {
  if (!url || url.trim() === "" || url === "null" || url === "undefined") {
    return null; // Return null to trigger placeholder
  }
    const urlStr = String(url).trim();
  
  if (urlStr.startsWith("blob:")) {
    return urlStr;
  }
  
  if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
    return urlStr;
  }
  
  if (urlStr.startsWith("/")) {
    return `${API_BASE_URL}${urlStr}`;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = uuidRegex.test(urlStr);
  if (isUuid) {
    return `${API_BASE_URL}/images/profiles/${urlStr}`;
  }
  
  const uuidWithExtRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z]{3,4}$/i;
  if (uuidWithExtRegex.test(urlStr)) {
    return `${API_BASE_URL}/images/profiles/${urlStr}`;
  }
  
  const userIdUuidExtRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z]{3,4}$/i;
  if (userIdUuidExtRegex.test(urlStr)) {
    return `${API_BASE_URL}/images/profiles/${urlStr}`;
  }
  
  return `${API_BASE_URL}/${urlStr}`;
}

export { API_BASE_URL, USE_API_MOCKS };


