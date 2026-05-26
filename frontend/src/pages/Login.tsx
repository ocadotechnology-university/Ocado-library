import { useMemo, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { SidebarTemplate } from "../components/UI/SidebarTemplate";
import { REMEMBER_PREF_KEY } from "../lib/authStorage";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ocado_technology_logo.jpeg";

type LocationState = {
  from?: { pathname?: string };
};

export default function Login() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle, isAuthenticated, authLoading } = useAuth();
  const [remember, setRemember] = useState(true);

  const oauthError = useMemo(() => {
    if (searchParams.get("error") === "oauth_failed") {
      return "Google sign-in failed. Please try again.";
    }
    return null;
  }, [searchParams]);

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const state = location.state as LocationState | null;
  const target =
    state?.from?.pathname && state.from.pathname !== "/login"
      ? state.from.pathname
      : "/";

  const handleGoogleLogin = () => {
    sessionStorage.setItem(REMEMBER_PREF_KEY, remember ? "true" : "false");
    sessionStorage.setItem("ocado.library.auth.returnTo", target);
    loginWithGoogle();
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
              Use your Google account to borrow and manage books.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2 text-base text-[#43485e]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[#43485e]/40 text-[#43485e] focus:ring-[#43485e]"
              />
              Remember me
            </label>

            {oauthError ? (
              <p className="rounded-lg border border-[#dc2626]/30 bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]">
                {oauthError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#b1b2b5] bg-white px-4 py-3 text-base font-medium text-[#43485e] shadow-sm transition hover:bg-[#f8f9fc] disabled:opacity-60"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
