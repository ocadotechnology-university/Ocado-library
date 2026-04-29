import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { SidebarTemplate } from "../components/UI/SidebarTemplate";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ocado_technology_logo.jpeg";

type LocationState = {
  from?: { pathname?: string };
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAllowedCompanyEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const state = location.state as LocationState | null;
  const target =
    state?.from?.pathname && state.from.pathname !== "/login"
      ? state.from.pathname
      : "/";

  const handleLogin = () => {
    const normalized = email.trim().toLowerCase();
    if (!isAllowedCompanyEmail(normalized)) {
      setError("This account is not authorized.");
      return;
    }

    try {
      login(normalized, { remember });
      navigate(target, { replace: true });
    } catch {
      setError("Unable to log in right now. Please try again.");
    }
  };

  return (
    <Layout
      topBar={
        <div className="flex h-full items-center px-5 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img
              src={logo}
              alt=""
              className="h-11 w-auto shrink-0 object-contain sm:h-12 lg:h-[3.25rem]"
              width={180}
              height={56}
            />
            <div className="min-w-0">
              <span className="block truncate text-lg font-semibold tracking-tight text-[#eeeef0] sm:text-xl">
                Ocado Library
              </span>
              <span className="hidden text-xs text-[#9e9eae] sm:block">
                Sign in
              </span>
            </div>
          </div>
        </div>
      }
      leftSidebar={<SidebarTemplate>{null}</SidebarTemplate>}
      rightSidebar={<SidebarTemplate>{null}</SidebarTemplate>}
    >
      <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-3xl border border-[#b1b2b5]/70 bg-gradient-to-br from-[#dde2ec] via-[#f5f6fb] to-[#d8dce8] px-4 py-10 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.75),0_10px_30px_-16px_rgb(0_0_0_/0.35)] sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-[#43485e]/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-[#d4e157]/20 blur-2xl" />

        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-[#43485e] sm:text-4xl">
              Sign in to Ocado Library
            </h1>
            <p className="mt-1 text-base text-[#6b7289] sm:text-lg">
              Borrow, reserve, and manage books in one place.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-base font-medium text-[#43485e]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                autoComplete="email"
                placeholder="you@ocado.com"
                className="w-full rounded-xl border border-[#b1b2b5] bg-white/95 px-4 py-3 text-base text-[#43485e] shadow-[0_8px_20px_-14px_rgb(0_0_0_/0.45)] outline-none ring-[#43485e]/20 transition placeholder:text-[#9e9eae] focus:border-[#43485e]/50 focus:ring-2"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-base text-[#43485e]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[#43485e]/40 text-[#43485e] focus:ring-[#43485e]"
              />
              Remember me
            </label>

            {error ? (
              <p className="rounded-lg border border-[#dc2626]/30 bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-xl bg-[#43485e] px-4 py-3 text-base font-medium text-[#eeeef0] shadow-sm transition hover:bg-[#363b4f]"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
