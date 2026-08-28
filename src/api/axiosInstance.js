/**
 * Backend API base URL and image base URL for building asset URLs.
 * Use imageURL when the API returns a path (e.g. "storage/..." or "upload/...") and you need a full URL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

function getBackendBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  return url.replace(/\/api\/v1\/?$/, "");
}

/** Base URL for images (no trailing path). e.g. "http://127.0.0.1:8000" */
export const imageURL = getBackendBaseUrl() + "/";

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("tijaar_token") || localStorage.getItem("tijaar_token");
}

async function request(method, path, data = null) {
  const headers = { Accept: "application/json", ...(data && typeof data === "object" && !(data instanceof FormData) ? { "Content-Type": "application/json" } : {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { method, headers, credentials: "include" };
  if (data != null) opts.body = data instanceof FormData ? data : JSON.stringify(data);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.message || "Request failed"), { response: { data: json, status: res.status } });
  return { data: json };
}

const axiosInstance = {
  get: (path) => request("GET", path),
  post: (path, data) => request("POST", path, data),
  put: (path, data) => request("PUT", path, data),
  patch: (path, data) => request("PATCH", path, data),
  delete: (path) => request("DELETE", path),
};

export default axiosInstance;
