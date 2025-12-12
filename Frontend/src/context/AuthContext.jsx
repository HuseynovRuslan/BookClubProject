import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
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
  
  // Use ref to store the latest user state to avoid stale closures
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      // Only update if profile actually changed to prevent unnecessary re-renders
      setUser(prevUser => {
        if (prevUser?.id === profile?.id && prevUser?.email === profile?.email) {
          return prevUser; // Return same reference if nothing changed
        }
        return profile;
      });
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

  // Memoize refreshProfile separately to prevent it from changing on every render
  const refreshProfileRef = useRef(fetchProfile);
  useEffect(() => {
    refreshProfileRef.current = fetchProfile;
  }, [fetchProfile]);

  const stableRefreshProfile = useCallback(async () => {
    return refreshProfileRef.current();
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
      refreshProfile: stableRefreshProfile,
    }),
    [
      authError,
      stableRefreshProfile,
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


