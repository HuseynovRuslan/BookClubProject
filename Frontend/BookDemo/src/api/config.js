
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7050";
const USE_API_MOCKS =
  import.meta.env.VITE_USE_API_MOCKS !== "false"; // default true for local demo

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

/**
 * Decodes JWT token and extracts email claim
 * JWT format: header.payload.signature
 * We decode the payload (base64url) to get the claims
 */
export function getEmailFromToken() {
  try {
    const token = getAccessToken();
    if (!token) return null;

    // JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    // Base64URL decoding (replace - with +, _ with /, add padding if needed)
    let payload = parts[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (payload.length % 4) {
      payload += '=';
    }

    // Decode base64
    const decodedPayload = JSON.parse(atob(payload));

    // Extract email from claims (JWT standard uses 'email' claim)
    return decodedPayload.email || decodedPayload.Email || null;
  } catch (error) {
    console.warn('Failed to decode JWT token for email:', error);
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
    // Check if endpoint requires authentication
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

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: requestBody,
  });

  // Handle 204 No Content response
  if (res.status === 204) {
    return null; // or return {} for consistency
  }

  let data;
  const contentType = res.headers.get("content-type")?.toLowerCase() || "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    try {
      data = await res.json();
    } catch (e) {
      // If JSON parsing fails, try text
      data = await res.text();
    }
  } else {
    const textData = await res.text();
    // If empty response, return null
    data = textData || null;
  }

  if (!res.ok) {
    // Backend ApiResponse formatında error-lar: { isSuccess: false, message, errorMessages: [] }
    let errorMessage = "Request failed with error";
    if (data) {
      if (typeof data === 'object' && data.errorMessages && Array.isArray(data.errorMessages) && data.errorMessages.length > 0) {
        errorMessage = data.errorMessages[0];
      } else if (typeof data === 'object' && data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'string' && data.trim()) {
        errorMessage = data;
      }
    }
    const error = new Error(errorMessage);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * High-level request helper with basic 401 handling hook.
 * `onUnauthorized` can trigger token refresh or logout from outside.
 */
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

/**
 * Şəkil URL-ini formatlaşdırır
 * Əgər relative path-dirsə, backend URL-i əlavə edir
 */
export function getImageUrl(url) {
  if (!url || url.trim() === "" || url === "null" || url === "undefined") {
    return null; // Return null to trigger placeholder
  }

  // Əgər tam URL-dirsə (http/https), olduğu kimi qaytar
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Əgər relative path-dirsə (/images/...), backend URL-i əlavə et
  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  // Əgər sadə path-dirsə (images/...), backend URL-i əlavə et
  return `${API_BASE_URL}/${url}`;
}

export { API_BASE_URL, USE_API_MOCKS };


