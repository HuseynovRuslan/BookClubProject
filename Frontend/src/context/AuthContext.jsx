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
  const [isGuest, setIsGuest] = useState(() => {
    return sessionStorage.getItem("bookverse_guest_mode") === "true";
  });
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUser(prevUser => {
        if (prevUser?.id === profile?.id && prevUser?.email === profile?.email) {
          const prevAvatar = prevUser?.avatarUrl || prevUser?.AvatarUrl || prevUser?.profilePictureUrl || prevUser?.ProfilePictureUrl;
          const newAvatar = profile?.avatarUrl || profile?.AvatarUrl || profile?.profilePictureUrl || profile?.ProfilePictureUrl;
          if (prevAvatar === newAvatar) {
            return prevUser; 
          }
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
    const guestMode = sessionStorage.getItem("bookverse_guest_mode") === "true";
    
    if (guestMode) {
      setIsGuest(true);
      setInitializing(false);
      return;
    }
    
    if (!token) {
      setInitializing(false);
      return;
    }

    fetchProfile()
      .catch(() => {
      })
      .finally(() => setInitializing(false));
  }, [fetchProfile]);

  const login = useCallback(
    async (credentials) => {
      setAuthError(null);
      sessionStorage.removeItem("bookverse_guest_mode");
      setIsGuest(false);
      await loginRequest(credentials);
      return fetchProfile();
    },
    [fetchProfile]
  );

  const loginAsGuest = useCallback(() => {
    setIsGuest(true);
    sessionStorage.setItem("bookverse_guest_mode", "true");
    setUser(null);
    setAuthError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!isGuest) {
        await logoutRequest();
      }
    } finally {
      clearTokens();
      sessionStorage.removeItem("bookverse_guest_mode");
      setUser(null);
      setIsGuest(false);
    }
  }, [isGuest]);

  const register = useCallback(async (payload) => {
    setAuthError(null);
    return registerRequest(payload);
  }, []);

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
      isGuest,
      initializing,
      authError,
      setAuthError,
      login,
      loginAsGuest,
      logout,
      register,
      refreshProfile: stableRefreshProfile,
    }),
    [
      authError,
      stableRefreshProfile,
      initializing,
      login,
      loginAsGuest,
      logout,
      register,
      user,
      isGuest,
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


