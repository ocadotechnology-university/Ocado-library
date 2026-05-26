import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, fetchMe, hasRole } from "../lib/api";
import {
  clearStoredToken,
  readStoredToken,
  storeToken,
} from "../lib/authStorage";

type AuthUser = {
  email: string;
  roles: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authLoading: boolean;
  loginWithGoogle: () => void;
  completeLogin: (accessToken: string, remember: boolean) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const stored = readStoredToken();
    if (stored == null) {
      setUser(null);
      return;
    }
    const me = await fetchMe();
    setUser({ email: me.email, roles: me.roles });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (readStoredToken() != null) {
          await loadProfile();
        }
      } catch (error) {
        if (!cancelled && error instanceof ApiError && error.status === 401) {
          clearStoredToken();
          setUser(null);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = "/oauth2/authorization/google";
  }, []);

  const completeLogin = useCallback(
    async (accessToken: string, remember: boolean) => {
      storeToken(accessToken, remember);
      await loadProfile();
    },
    [loadProfile],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user != null,
      isAdmin: user != null && hasRole(user.roles, "ADMIN"),
      authLoading,
      loginWithGoogle,
      completeLogin,
      logout,
    }),
    [user, authLoading, loginWithGoogle, completeLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
