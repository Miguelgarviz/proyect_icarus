// lib/auth.ts
export function getTokenPayload() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1])) as {
      sub: number;
      username: string;
    };
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}