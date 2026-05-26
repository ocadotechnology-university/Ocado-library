import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { REMEMBER_PREF_KEY } from "../lib/authStorage";
import { useAuth } from "../context/AuthContext";

function parseHashParams(hash: string): URLSearchParams {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(raw);
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { completeLogin, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) return;

    const params = parseHashParams(window.location.hash);
    const token = params.get("access_token");
    if (token == null || token.length === 0) {
      setError("Missing token after Google sign-in. Please try again.");
      return;
    }

    const remember = sessionStorage.getItem(REMEMBER_PREF_KEY) !== "false";

    completeLogin(token, remember)
      .then(() => {
        window.history.replaceState(null, "", "/auth/callback");
        navigate("/", { replace: true });
      })
      .catch(() => {
        setError("Could not verify your session. Please sign in again.");
      });
  }, [completeLogin, isAuthenticated, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb] px-4">
        <p className="rounded-xl border border-[#dc2626]/30 bg-[#fee2e2] px-4 py-3 text-sm text-[#b91c1c]">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb] px-4">
      <p className="text-base text-[#43485e]">Signing in with Google…</p>
    </div>
  );
}
