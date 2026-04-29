import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  email: string;
};

type LoginOptions = {
  remember: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, options: LoginOptions) => void;
  logout: () => void;
  isAllowedCompanyEmail: (email: string) => boolean;
};

const SESSION_KEY = "ocado.library.auth.session";
const PERSISTENT_KEY = "ocado.library.auth.persistent";
const ADMIN_EMAIL = "admin@ocado.com";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredEmail(): string | null {
  const persistent = localStorage.getItem(PERSISTENT_KEY);
  if (persistent != null) return persistent;
  return sessionStorage.getItem(SESSION_KEY);
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isAllowedCompanyEmail(email: string): boolean {
  return normalizeEmail(email).endsWith("@ocado.com");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = readStoredEmail();
    return stored ? { email: stored } : null;
  });

  const login = (email: string, options: LoginOptions) => {
    const normalized = normalizeEmail(email);
    if (!isAllowedCompanyEmail(normalized)) {
      throw new Error("Only @ocado.com accounts are allowed");
    }

    if (options.remember) {
      localStorage.setItem(PERSISTENT_KEY, normalized);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, normalized);
      localStorage.removeItem(PERSISTENT_KEY);
    }
    setUser({ email: normalized });
  };

  const logout = () => {
    localStorage.removeItem(PERSISTENT_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user != null,
      isAdmin: user?.email === ADMIN_EMAIL,
      login,
      logout,
      isAllowedCompanyEmail,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
