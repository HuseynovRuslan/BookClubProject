import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../api/auth";
import { getCurrentUserProfile } from "../api/users";
import { clearTokens, getAccessToken } from "../api/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      if (error.status === 401) {
        clearTokens();
        setUser(null);
      } else {
        setAuthError(error.message || "Failed to load profile");
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setInitializing(false);
      return;
    }

    fetchProfile()
      .catch(() => {
        // errors handled in fetchProfile, nothing extra here
      })
      .finally(() => setInitializing(false));
  }, [fetchProfile]);

  const login = useCallback(
    async (credentials) => {
      setAuthError(null);
      await loginRequest(credentials);
      return fetchProfile();
    },
    [fetchProfile]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setAuthError(null);
    return registerRequest(payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      authError,
      setAuthError,
      login,
      logout,
      register,
      refreshProfile: fetchProfile,
    }),
    [
      authError,
      fetchProfile,
      initializing,
      login,
      logout,
      register,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}


