import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { fetchUnreadNotificationCount } from "../lib/api";
import { useAuth } from "./AuthContext";

type AppChromeContextValue = {
  notificationsOpen: boolean;
  setNotificationsOpen: Dispatch<SetStateAction<boolean>>;
  toggleNotifications: () => void;
  hasUnreadNotifications: boolean;
  refreshNotificationUnreadStatus: () => Promise<void>;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function AppChromeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const refreshNotificationUnreadStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setHasUnreadNotifications(false);
      return;
    }

    try {
      const { unreadCount } = await fetchUnreadNotificationCount();
      setHasUnreadNotifications(unreadCount > 0);
    } catch {
      setHasUnreadNotifications(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshNotificationUnreadStatus();
  }, [refreshNotificationUnreadStatus]);

  const toggleNotifications = useCallback(
    () => setNotificationsOpen((o) => !o),
    [],
  );

  const value = useMemo(
    () => ({
      notificationsOpen,
      setNotificationsOpen,
      toggleNotifications,
      hasUnreadNotifications,
      refreshNotificationUnreadStatus,
    }),
    [
      notificationsOpen,
      toggleNotifications,
      hasUnreadNotifications,
      refreshNotificationUnreadStatus,
    ],
  );

  return (
    <AppChromeContext.Provider value={value}>
      {children}
    </AppChromeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppChrome() {
  const ctx = useContext(AppChromeContext);
  if (ctx == null) {
    throw new Error("useAppChrome must be used within AppChromeProvider");
  }
  return ctx;
}
