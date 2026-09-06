export const TOKEN_KEY = "auth_token";

export const authFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
