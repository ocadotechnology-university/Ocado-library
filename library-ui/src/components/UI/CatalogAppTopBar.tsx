import { useLocation, useNavigate } from "react-router-dom";
import { useAppChrome } from "../../context/AppChromeContext";
import { useAuth } from "../../context/AuthContext";
import TopBar from "./TopBar";

export type CatalogAppTopBarProps = {
  /** Runs before navigation — e.g. close book overlay on the catalogue page. */
  onLogoClick?: () => void;
};

/**
 * Project-wide top bar: logo returns to `/`, account opens `/account`, notifications toggle the global slide panel.
 */
export default function CatalogAppTopBar({ onLogoClick }: CatalogAppTopBarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const { notificationsOpen, setNotificationsOpen, toggleNotifications } = useAppChrome();

  return (
    <TopBar
      onLogoClick={() => {
        onLogoClick?.();
        setNotificationsOpen(false);
        navigate("/");
      }}
      notificationsPanelOpen={notificationsOpen}
      onNotificationsClick={() => toggleNotifications()}
      accountPanelOpen={pathname === "/account"}
      roleBadgeText={isAdmin ? "Admin account" : null}
      onAccountClick={() => {
        setNotificationsOpen(false);
        navigate("/account");
      }}
    />
  );
}
