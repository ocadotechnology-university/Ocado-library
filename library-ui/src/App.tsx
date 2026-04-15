import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppChromeProvider, useAppChrome } from "./context/AppChromeContext";
import NotificationPanel from "./components/UI/NotificationPanel";
import Account from "./pages/Account";
import Home from "./pages/Home";

export function AppRoutes() {
  const { notificationsOpen, setNotificationsOpen } = useAppChrome();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppChromeProvider>
        <AppRoutes />
      </AppChromeProvider>
    </BrowserRouter>
  );
}

export default App;
