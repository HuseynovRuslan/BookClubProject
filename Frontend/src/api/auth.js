import {
  apiRequest,
  setTokens,
  clearTokens,
  getRefreshToken,
  USE_API_MOCKS,
  delay,
} from "./config";
import { loadMockAccount, saveMockAccount } from "./mockStorage";

const MOCK_ACCESS = "mock-access-token";
const MOCK_REFRESH = "mock-refresh-token";

function setMockTokens() {
  setTokens({
    accessToken: MOCK_ACCESS,
    refreshToken: MOCK_REFRESH,
  });
}

async function mockRegister(payload) {
  await delay();
  const existing = loadMockAccount();
  const updated = {
    ...existing,
    id: existing?.id || `mock-${Date.now()}`,
    name: payload.name || existing.name,
    surname: payload.surname || existing.surname,
    email: payload.email || existing.email,
    password: payload.password || existing.password,
    role: payload.role || existing.role || "reader",
  };
  saveMockAccount(updated);
  return {
    message:
      "Mock registration successful. Set VITE_USE_API_MOCKS=false to hit real backend.",
  };
}

async function mockLogin({ email, password }) {
  await delay();
  const account = loadMockAccount();
  if (
    account.email.toLowerCase() !== email.toLowerCase() ||
    account.password !== password
  ) {
    throw new Error("Invalid email or password (mock credentials)");
  }
  setMockTokens();
  return {
    accessToken: MOCK_ACCESS,
    refreshToken: MOCK_REFRESH,
    user: {
      id: account.id,
      name: `${account.name}${account.surname ? ` ${account.surname}` : ""}`,
      email: account.email,
      role: account.role,
      bio: account.bio,
    },
  };
}

async function mockLogout() {
  await delay(200);
  clearTokens();
}

async function mockRefresh() {
  await delay(200);
  setMockTokens();
  return {
    accessToken: MOCK_ACCESS,
    refreshToken: MOCK_REFRESH,
  };
}

async function mockConfirmEmail() {
  await delay(200);
  return { message: "Email confirmed (mock mode)" };
}

export async function register(payload) {
  if (USE_API_MOCKS) {
    return mockRegister(payload);
  }
  
  // Backend may expect FirstName/LastName (PascalCase) or firstName/lastName (camelCase)
  // Try PascalCase first (most common in .NET backends)
  const firstName = payload.firstName || payload.name || "";
  const lastName = payload.lastName || payload.surname || "";
  
  // Ensure fields are not null or empty
  if (!firstName || firstName.trim() === "") {
    throw new Error("First name is required");
  }
  if (!lastName || lastName.trim() === "") {
    throw new Error("Last name is required");
  }
  
  const backendPayload = {
    Username: payload.username || "",
    FirstName: firstName.trim(),
    LastName: lastName.trim(),
    Email: payload.email || "",
    Password: payload.password || "",
    Role: payload.role || "reader",
  };
  
  console.log("Register payload to backend:", backendPayload);
  
  try {
    return await apiRequest("/api/Auth/register", {
      method: "POST",
      body: backendPayload,
    });
  } catch (err) {
    // If PascalCase fails with 400, try camelCase
    if (err.status === 400) {
      console.log("PascalCase failed, trying camelCase:", err);
      const camelCasePayload = {
        username: payload.username || "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: payload.email || "",
        password: payload.password || "",
        role: payload.role || "reader",
      };
      console.log("Register payload (camelCase) to backend:", camelCasePayload);
      return await apiRequest("/api/Auth/register", {
        method: "POST",
        body: camelCasePayload,
      });
    }
    throw err;
  }
}

export async function login({ email, password }) {
  if (USE_API_MOCKS) {
    return mockLogin({ email, password });
  }

  try {
    console.log("Attempting login with:", { email });
    const response = await apiRequest("/api/Auth/login", {
      method: "POST",
      body: { usernameOrEmail: email, password },
    });

    console.log("Login response:", response);

    // Backend ApiResponse<T> wrapper ilə qaytarır: { isSuccess, message, data: { accessToken, refreshToken } }
    const authData = response.data || response;
    
    console.log("Auth data:", authData);
    
    if (authData && (authData.accessToken || authData.refreshToken)) {
      setTokens({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });
      console.log("Tokens saved successfully");
    } else {
      console.error("Login response format error:", response);
      throw new Error("Invalid response format from server");
    }

    return authData;
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      data: error.data
    });
    throw error;
  }
}

export async function logout() {
  if (USE_API_MOCKS) {
    return mockLogout();
  }
  try {
    await apiRequest("/api/Auth/logout", {
      method: "POST",
    });
  } catch {
  }
  clearTokens();
}

export async function refreshToken() {
  if (USE_API_MOCKS) {
    return mockRefresh();
  }
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error("No refresh token");
  }

  const response = await apiRequest("/api/Auth/refresh", {
    method: "POST",
    body: { refreshToken: refreshTokenValue },
  });

  // Backend ApiResponse<T> wrapper ilə qaytarır: { isSuccess, message, data: { accessToken, refreshToken } }
  const authData = response.data || response;

  if (authData.accessToken || authData.refreshToken) {
    setTokens({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken || refreshTokenValue,
    });
  }
  return authData;
}

export async function confirmEmail(token) {
  if (USE_API_MOCKS) {
    return mockConfirmEmail();
  }
  return apiRequest(`/api/Auth/confirm-email?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

async function mockForgotPassword(email) {
  await delay(500);
  return { 
    message: "Password reset email sent (mock mode). Check your inbox at " + email 
  };
}

export async function forgotPassword(email) {
  if (USE_API_MOCKS) {
    return mockForgotPassword(email);
  }

  try {
    // Try common endpoint patterns
    const endpoints = [
      "/api/Auth/forgot-password",
      "/api/Auth/forgotpassword",
      "/api/Users/forgot-password",
      "/api/Users/forgotpassword",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await apiRequest(endpoint, {
          method: "POST",
          body: { email: email.trim() },
        });
        return response;
      } catch (err) {
        // If 404, try next endpoint
        if (err.status === 404) {
          continue;
        }
        // For other errors, throw immediately
        throw err;
      }
    }

    // If all endpoints failed with 404, throw a helpful error
    throw new Error("Forgot password endpoint not found. Please contact support.");
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}

