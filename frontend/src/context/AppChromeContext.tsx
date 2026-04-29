import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type AppChromeContextValue = {
  notificationsOpen: boolean;
  setNotificationsOpen: Dispatch<SetStateAction<boolean>>;
  toggleNotifications: () => void;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function AppChromeProvider({ children }: { children: ReactNode }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const toggleNotifications = useCallback(
    () => setNotificationsOpen((o) => !o),
    [],
  );

  const value = useMemo(
    () => ({
      notificationsOpen,
      setNotificationsOpen,
      toggleNotifications,
    }),
    [notificationsOpen, toggleNotifications],
  );

  return (
    <AppChromeContext.Provider value={value}>
      {children}
    </AppChromeContext.Provider>
  );
}

export function useAppChrome() {
  const ctx = useContext(AppChromeContext);
  if (ctx == null) {
    throw new Error("useAppChrome must be used within AppChromeProvider");
  }
  return ctx;
}
