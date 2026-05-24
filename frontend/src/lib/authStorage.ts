const SESSION_TOKEN_KEY = "ocado.library.auth.session.token";
const PERSISTENT_TOKEN_KEY = "ocado.library.auth.persistent.token";
export const REMEMBER_PREF_KEY = "ocado.library.auth.remember";

export function readStoredToken(): { token: string; remember: boolean } | null {
  const persistent = localStorage.getItem(PERSISTENT_TOKEN_KEY);
  if (persistent != null) return { token: persistent, remember: true };
  const session = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (session != null) return { token: session, remember: false };
  return null;
}

export function storeToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(PERSISTENT_TOKEN_KEY, token);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } else {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.removeItem(PERSISTENT_TOKEN_KEY);
  }
}

export function clearStoredToken() {
  localStorage.removeItem(PERSISTENT_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return readStoredToken()?.token ?? null;
}
