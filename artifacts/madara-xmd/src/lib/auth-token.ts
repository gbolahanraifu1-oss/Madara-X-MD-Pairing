const AUTH_TOKEN_KEY = "madara-xmd-auth-token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function saveAuthToken(token: unknown): void {
  if (typeof window === "undefined" || typeof token !== "string") return;
  const normalizedToken = token.trim();
  if (normalizedToken) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, normalizedToken);
  }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;

  const data = (error as { data?: unknown }).data;
  if (data && typeof data === "object") {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.trim()) return message;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : fallback;
}