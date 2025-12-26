const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export type ApiOptions = {
  method?: string;
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
};

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": isFormData ? undefined : "application/json",
      ...options.headers,
    },
    credentials: options.credentials || "include",
    body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  // Try to parse JSON; fallback to text when empty
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as T;
}

export const api = {
  get: <T>(path: string, options: ApiOptions = {}) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: Record<string, unknown> | FormData, options: ApiOptions = {}) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: Record<string, unknown> | FormData, options: ApiOptions = {}) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: Record<string, unknown> | FormData, options: ApiOptions = {}) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options: ApiOptions = {}) => apiFetch<T>(path, { ...options, method: "DELETE" }),
};
