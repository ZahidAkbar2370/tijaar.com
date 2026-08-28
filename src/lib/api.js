const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function getBackendBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  return url.replace(/\/api\/v1\/?$/, "");
}

const TOKEN_KEY = "tijaar_token";

/** Paths we never cache (auth, mutations, or must be fresh). */
const NO_CACHE_PATHS = ["/user", "/logout", "/profile", "/reviews"];

/** In-memory cache for GET requests: faster back/forward and repeat visits. TTL in ms. */
const CACHE_TTL = 30 * 1000; // 30 seconds
const requestCache = new Map();

function getCacheKey(path, token) {
  return token ? `auth:${path}` : path;
}

function getCached(key) {
  const entry = requestCache.get(key);
  if (!entry || Date.now() > entry.expires) {
    if (entry) requestCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  requestCache.set(key, { data, expires: Date.now() + CACHE_TTL });
  if (requestCache.size > 200) {
    const first = requestCache.keys().next().value;
    if (first != null) requestCache.delete(first);
  }
}

/** Call this after login/logout or when you need fresh data (e.g. after adding to cart). */
export function clearApiCache() {
  requestCache.clear();
}

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

function setToken(token, remember = true) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  if (token) {
    if (remember) localStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const isGet = !options.method || options.method === "GET";
  const pathStr = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const canCache = isGet && !NO_CACHE_PATHS.some((p) => pathStr.includes(p)) && !options.skipCache;

  if (canCache && typeof window !== "undefined") {
    const key = getCacheKey(pathStr, token || "");
    const cached = getCached(key);
    if (cached !== null) return Promise.resolve(cached);
  }

  let res;
  try {
    res = await fetch(pathStr, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (networkErr) {
    const base = API_BASE.replace(/\/api\/v1\/?$/, "");
    const err = new Error(
      `Failed to connect to backend at ${base}. Ensure it's running (e.g. npm run dev) and NEXT_PUBLIC_API_URL in .env matches. Restart frontend after changing .env.`
    );
    err.cause = networkErr;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  if (canCache && typeof window !== "undefined") {
    const key = getCacheKey(pathStr, token || "");
    setCached(key, data);
  }

  return data;
}

export const authApi = {
  register: (payload) => apiRequest("/register", { method: "POST", body: JSON.stringify(payload) }),
  registerSeller: async (formData) => {
    const token = typeof window !== "undefined" ? getToken() : null;
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/seller/register`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Registration failed"), { data: json, status: res.status });
    return json;
  },
  login: (payload) => apiRequest("/login", { method: "POST", body: JSON.stringify(payload) }),
  verifyOtp: (payload) => apiRequest("/verify-otp", { method: "POST", body: JSON.stringify(payload) }),
  resendOtp: (email) => apiRequest("/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
  logout: () => apiRequest("/logout", { method: "POST" }),
  user: () => apiRequest("/user"),
  forgotPassword: (email) => apiRequest("/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (payload) => apiRequest("/reset-password", { method: "POST", body: JSON.stringify(payload) }),
  socialRedirectUrl: (provider, redirectPath) => {
    const q = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";
    return apiRequest(`/auth/${provider}/url${q}`);
  },
};

export const userApi = {
  profile: () => apiRequest("/profile"),
  updateProfile: (payload) => apiRequest("/profile", { method: "PUT", body: JSON.stringify(payload) }),
  changePassword: (payload) => apiRequest("/profile/password", { method: "PUT", body: JSON.stringify(payload) }),
  uploadAvatar: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/profile/avatar`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: "include",
    }).then((r) => r.json());
  },
};

export const whatsappApi = {
  status: () => apiRequest("/whatsapp/status"),
  sendOtp: (payload = {}) => apiRequest("/whatsapp/send-otp", { method: "POST", body: JSON.stringify(payload) }),
  verifyOtp: (payload) => apiRequest("/whatsapp/verify-otp", { method: "POST", body: JSON.stringify(payload) }),
};

export const phoneApi = {
  status: () => apiRequest("/phone/status"),
  sendOtp: (payload = {}) => apiRequest("/phone/send-otp", { method: "POST", body: JSON.stringify(payload) }),
  verifyOtp: (payload) => apiRequest("/phone/verify-otp", { method: "POST", body: JSON.stringify(payload) }),
};

export const addressApi = {
  list: () => apiRequest("/addresses"),
  create: (payload) => apiRequest("/addresses", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => apiRequest(`/addresses/${id}`, { method: "DELETE" }),
  setDefault: (id) => apiRequest(`/addresses/${id}/default`, { method: "POST" }),
};

export const locationApi = {
  tree: () => apiRequest("/locations"),
  countries: () => apiRequest("/locations/countries"),
  provinces: (countryId) => apiRequest(`/locations/provinces?country_id=${countryId}`),
  cities: (provinceId) => apiRequest(`/locations/cities?province_id=${provinceId}`),
};

export const savedCardsApi = {
  list: () => apiRequest("/saved-cards"),
  create: (payload) => apiRequest("/saved-cards", { method: "POST", body: JSON.stringify(payload) }),
  delete: (id) => apiRequest(`/saved-cards/${id}`, { method: "DELETE" }),
  setDefault: (id) => apiRequest(`/saved-cards/${id}/default`, { method: "POST" }),
};

export const notificationPreferencesApi = {
  list: () => apiRequest("/notification-preferences"),
  update: (channelOrPayload, type, enabled) => {
    const payload =
      typeof channelOrPayload === "object"
        ? channelOrPayload
        : { channel: channelOrPayload, type, enabled };
    return apiRequest("/notification-preferences", { method: "PUT", body: JSON.stringify(payload) });
  },
};

export const sessionsApi = {
  list: () => apiRequest("/sessions"),
  revoke: (tokenId) => apiRequest(`/sessions/${tokenId}`, { method: "DELETE" }),
};

export const twoFactorApi = {
  enable: () => apiRequest("/two-factor/enable", { method: "POST" }),
  verify: (code) => apiRequest("/two-factor/verify", { method: "POST", body: JSON.stringify({ code }) }),
  disable: (password) => apiRequest("/two-factor/disable", { method: "POST", body: JSON.stringify({ password }) }),
};

export const marketApi = {
  list: () => apiRequest("/markets"),
  current: () => apiRequest("/market/current"),
  setPreference: (market) => apiRequest("/market/preference", { method: "POST", body: JSON.stringify({ market }) }),
};

export const categoryApi = {
  list: (tree = false) => apiRequest(`/categories${tree ? "?tree=1" : ""}`),
  featured: () => apiRequest("/categories/featured"),
  get: (slug) => apiRequest(`/categories/${slug}`),
};

export const productApi = {
  list: (params) => apiRequest(`/products${params ? "?" + new URLSearchParams(params).toString() : ""}`),
  get: (slug) => apiRequest(`/products/${slug}`),
  promotedAds: (params = {}) =>
    apiRequest(`/products/promoted-ads?${new URLSearchParams(params).toString()}`),
  trackAnalytics: (productId, event, sessionId) =>
    apiRequest(`/products/${productId}/analytics`, {
      method: "POST",
      body: JSON.stringify({ event }),
      headers: sessionId ? { "X-Session-ID": String(sessionId) } : undefined,
    }),
};

export const searchApi = {
  suggest: (q) => apiRequest(`/search/suggest?q=${encodeURIComponent(q || "")}`),
  featured: () => apiRequest("/search/featured"),
  trending: () => apiRequest("/search/trending"),
  deals: () => apiRequest("/search/deals"),
};

export const flashDealsApi = {
  list: () => apiRequest("/flash-deals"),
  get: (idOrSlug) => apiRequest(`/flash-deals/${idOrSlug}`),
};

export const cmsApi = {
  page: (slug) => apiRequest(`/pages/${slug}`),
  banners: (position = "home_hero") => apiRequest(`/banners?position=${position}`),
  testimonials: () => apiRequest("/testimonials"),
  faqs: () => apiRequest("/faqs"),
  blogs: (params) => apiRequest(`/blogs${params ? "?" + new URLSearchParams(params).toString() : ""}`),
  blog: (slug) => apiRequest(`/blog/${slug}`),
  newsletter: (payload) => apiRequest("/newsletter", { method: "POST", body: JSON.stringify(payload) }),
  contact: (payload) => apiRequest("/contact", { method: "POST", body: JSON.stringify(payload) }),
  homeSections: () => apiRequest("/home-sections"),
};

/** Public site settings: logos, favicon, SEO meta. No auth required. */
export const siteApi = {
  getSettings: () => apiRequest("/site-settings"),
};

export const wishlistApi = {
  list: () => apiRequest("/wishlist"),
  add: (productId) => apiRequest("/wishlist", { method: "POST", body: JSON.stringify({ product_id: productId }) }),
  remove: (productId) => apiRequest(`/wishlist/${productId}`, { method: "DELETE" }),
  moveToCart: (productId) => apiRequest(`/wishlist/${productId}/move-to-cart`, { method: "POST" }),
  toggleAlert: (productId, type, enabled = true) =>
    apiRequest(`/wishlist/${productId}/alert`, {
      method: "POST",
      body: JSON.stringify({ type: type === "price" ? "price_alert" : "stock_alert", enabled }),
    }),
};

export const notificationApi = {
  list: (params = {}) => {
    const sp = new URLSearchParams();
    if (params.page != null) sp.set("page", params.page);
    if (params.per_page != null) sp.set("per_page", params.per_page);
    if (params.unread_only) sp.set("unread_only", "1");
    const q = sp.toString();
    return apiRequest(`/notifications${q ? "?" + q : ""}`);
  },
  markRead: (notificationIdsOrAll) => {
    const body =
      notificationIdsOrAll === true || notificationIdsOrAll === "all"
        ? { all: true }
        : { notification_ids: Array.isArray(notificationIdsOrAll) ? notificationIdsOrAll : [notificationIdsOrAll] };
    return apiRequest("/notifications/mark-read", { method: "POST", body: JSON.stringify(body) });
  },
  markAllRead: () => apiRequest("/notifications/mark-read", { method: "POST", body: JSON.stringify({ all: true }) }),
  unreadCount: () => apiRequest("/notifications/unread-count"),
  registerFcmToken: (fcmToken, deviceType = "web", deviceName = null) =>
    apiRequest("/notifications/fcm-token", {
      method: "POST",
      body: JSON.stringify({ fcm_token: fcmToken, device_type: deviceType, device_name: deviceName }),
    }),
};

export const conversationApi = {
  list: () => apiRequest("/conversations"),
  unreadCount: () => apiRequest("/conversations/unread-count"),
  start: (data) => apiRequest("/conversations/start", { method: "POST", body: JSON.stringify(data) }),
  create: (data) => apiRequest("/conversations", { method: "POST", body: JSON.stringify(data) }),
  get: (id) => apiRequest(`/conversations/${id}`),
  sendMessage: async (id, { body = "", image = null } = {}) => {
    if (image) {
      const fd = new FormData();
      if (body) fd.append("body", body);
      fd.append("image", image);
      const token = getToken();
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/conversations/${id}/messages`, {
        method: "POST",
        headers,
        body: fd,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json, status: res.status });
      return json;
    }
    return apiRequest(`/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ body }) });
  },
  report: (id, reason) => apiRequest(`/conversations/${id}/report`, { method: "POST", body: JSON.stringify({ reason }) }),
};

export const disputeApi = {
  list: () => apiRequest("/disputes"),
  create: (data) => apiRequest("/disputes", { method: "POST", body: JSON.stringify(data) }),
  get: (id) => apiRequest(`/disputes/${id}`),
  addMessage: (id, body) => apiRequest(`/disputes/${id}/messages`, { method: "POST", body: JSON.stringify({ body }) }),
  respond: (id, body) => apiRequest(`/disputes/${id}/respond`, { method: "POST", body: JSON.stringify({ body }) }),
};

export const cartApi = {
  get: () => apiRequest("/cart"),
  addDeal: (flashDealId) =>
    apiRequest("/cart/add-deal", { method: "POST", body: JSON.stringify({ flash_deal_id: flashDealId }) }),
  add: (productId, quantity, variantId = null, options = null, setQuantity = false) => {
    const payload = { product_id: productId, quantity };
    if (variantId != null && variantId > 0) payload.variant_id = variantId;
    if (setQuantity) payload.set_quantity = true;
    if (options && typeof options === "object" && Object.keys(options).length > 0) payload.options = options;
    return apiRequest("/cart/add", { method: "POST", body: JSON.stringify(payload) });
  },
  update: (productId, quantity, variantId = null) => {
    const payload = { product_id: productId, quantity };
    if (variantId != null && variantId > 0) payload.variant_id = variantId;
    return apiRequest("/cart/update", { method: "PUT", body: JSON.stringify(payload) });
  },
  remove: (productId, variantId = null) => {
    const url = variantId != null && variantId > 0
      ? `/cart/remove/${productId}?variant_id=${variantId}`
      : `/cart/remove/${productId}`;
    return apiRequest(url, { method: "DELETE" });
  },
  clear: () => apiRequest("/cart", { method: "DELETE" }),
  merge: (items) => apiRequest("/cart/merge", { method: "POST", body: JSON.stringify({ items }) }),
};

export const orderApi = {
  list: (page = 1, params = {}) => {
    const q = new URLSearchParams({ page: String(page), ...params });
    return apiRequest(`/orders?${q.toString()}`);
  },
  get: (id) => apiRequest(`/orders/${id}`),
  create: (payload) => apiRequest("/orders", { method: "POST", body: JSON.stringify(payload) }),
  cancel: (id) => apiRequest(`/orders/${id}/cancel`, { method: "POST" }),
  update: (id, payload) => apiRequest(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  retryPayment: (id, payload = {}) =>
    apiRequest(`/orders/${id}/retry-payment`, { method: "POST", body: JSON.stringify(payload) }),
  requestCancellation: (id, payload = {}) =>
    apiRequest(`/orders/${id}/request-cancellation`, {
      method: "POST",
      body: JSON.stringify({ reason: payload.reason || payload.cancellation_reason || "" }),
    }),
};

export const refundApi = {
  request: (payload) => apiRequest("/refunds/request", { method: "POST", body: JSON.stringify(payload) }),
};

export const walletApi = {
  balance: () => apiRequest("/wallet/balance"),
  deposit: (amount, gateway, paymentPhone, paymentCnic) =>
    apiRequest("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({
        amount,
        gateway,
        ...(paymentPhone ? { payment_phone: paymentPhone } : {}),
        ...(paymentCnic ? { payment_cnic: paymentCnic } : {}),
      }),
    }),
  transactions: (params) =>
    apiRequest(`/wallet/transactions${params ? "?" + new URLSearchParams(params).toString() : ""}`),
  export: (params) =>
    apiRequest(`/wallet/export${params ? "?" + new URLSearchParams(params).toString() : ""}`),
};

export const storesApi = {
  getBySlug: (slug) => apiRequest(`/stores/${slug}`),
  list: (params) => apiRequest(`/stores${params ? "?" + new URLSearchParams(params).toString() : ""}`),
};

export const brandApi = {
  list: (params = {}) => {
    const q = typeof params === "string"
      ? (params ? { search: params } : {})
      : params;
    const qs = Object.keys(q).length ? "?" + new URLSearchParams(
      Object.fromEntries(Object.entries(q).filter(([, v]) => v != null && v !== ""))
    ).toString() : "";
    return apiRequest(`/brands${qs}`);
  },
  featured: () => apiRequest("/brands/featured"),
  get: (slug) => apiRequest(`/brands/${slug}`),
};

/** Single request for home page data (banners, sections, categories, featured products/brands, flash deals, testimonials) */
export const homeApi = {
  get: () => apiRequest("/home", { skipCache: true }),
};

export const sellerStoreApi = {
  get: () => apiRequest("/seller/store"),
  update: async (data) => {
    const fd = new FormData();
    const fileKeys = ["logo", "banner", "cover_image"];
    Object.entries(data).forEach(([k, v]) => {
      if (fileKeys.includes(k)) {
        if (v instanceof File) fd.append(k, v);
      } else {
        fd.append(k, v != null ? String(v) : "");
      }
    });
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    // POST so PHP parses multipart/form-data (PUT would leave $request->all() empty)
    const res = await fetch(`${API_BASE}/seller/store/update`, {
      method: "POST",
      headers,
      body: fd,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
    return json;
  },
  vacationMode: (enabled, until) =>
    apiRequest("/seller/vacation-mode", {
      method: "POST",
      body: JSON.stringify({ enabled, until: until || null }),
    }),
  uploadKyc: async (formData) => {
    const fd = formData instanceof FormData ? formData : (() => {
      const body = new FormData();
      if (formData?.file) body.append("kyc_document", formData.file);
      return body;
    })();
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/seller/kyc`, {
      method: "POST",
      headers,
      body: fd,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
    return json;
  },
  create: async (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === "logo" && v) fd.append("logo", v);
      else if (k === "banner" && v) fd.append("banner", v);
      else if (v != null && v !== "") fd.append(k, v);
    });
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/seller/store`, {
      method: "POST",
      headers,
      body: fd,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
    return json;
  },
};

export const sellerProductsApi = {
  list: (params) =>
    apiRequest(`/seller/products${params ? "?" + new URLSearchParams(params).toString() : ""}`),
  get: (id) => apiRequest(`/seller/products/${id}`),
  store: () => apiRequest("/seller/store"),
  export: (params) =>
    apiRequest(`/seller/products/export${params ? "?" + new URLSearchParams(params).toString() : ""}`),
  import: (rows, mapping) =>
    apiRequest("/seller/products/import", {
      method: "POST",
      body: JSON.stringify({ rows, mapping }),
    }),
  promotionEligibility: () => apiRequest("/seller/products/promotion-eligibility"),
  create: async (data) => {
    const fd = new FormData();
    // Accept File or any Blob-like with name (works across envs where instanceof File can differ)
    const fileLike = (v) =>
      v &&
      ((typeof File !== "undefined" && v instanceof File) ||
        (typeof Blob !== "undefined" && v instanceof Blob && v.name != null) ||
        (typeof v === "object" && "size" in v && "name" in v));
    // Append files first so they are never skipped
    if (data.thumbnail && fileLike(data.thumbnail)) {
      fd.append("thumbnail", data.thumbnail, data.thumbnail.name || "thumbnail.jpg");
    }
    if (Array.isArray(data.images)) {
      data.images.forEach((f) => {
        if (fileLike(f)) fd.append("images[]", f, f.name || "image.jpg");
      });
    }
    if (Array.isArray(data.documents)) {
      data.documents.forEach((f) => {
        if (fileLike(f)) fd.append("documents[]", f, f.name || "document");
      });
    }
    if (Array.isArray(data.document_labels)) {
      data.document_labels.forEach((l) => fd.append("document_labels[]", l || ""));
    }
    if (Array.isArray(data.image_alts)) {
      data.image_alts.forEach((alt) => fd.append("image_alts[]", alt || ""));
    }
    // Then append scalar fields
    Object.entries(data).forEach(([k, v]) => {
      if (k === "thumbnail" || k === "images" || k === "documents" || k === "document_labels" || k === "image_alts") return;
      if (k === "is_featured" || k === "is_hot") fd.append(k, v ? "1" : "0");
      else if (v != null && v !== "" && !Array.isArray(v) && typeof v !== "object") fd.append(k, String(v));
    });
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/seller/products`, {
      method: "POST",
      headers,
      body: fd,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
    return json;
  },
  update: async (id, data) => {
    const fd = new FormData();
    fd.append("_method", "PUT");
    const fileLike = (v) =>
      v &&
      ((typeof File !== "undefined" && v instanceof File) ||
        (typeof Blob !== "undefined" && v instanceof Blob && v.name != null) ||
        (typeof v === "object" && "size" in v && "name" in v));
    if (data.thumbnail && fileLike(data.thumbnail)) {
      fd.append("thumbnail", data.thumbnail, data.thumbnail.name || "thumbnail.jpg");
    }
    if (Array.isArray(data.images)) {
      data.images.forEach((f) => {
        if (fileLike(f)) fd.append("images[]", f, f.name || "image.jpg");
      });
    }
    if (Array.isArray(data.documents)) {
      data.documents.forEach((f) => {
        if (fileLike(f)) fd.append("documents[]", f, f.name || "document");
      });
    }
    if (Array.isArray(data.document_labels)) {
      data.document_labels.forEach((l) => fd.append("document_labels[]", l || ""));
    }
    if (Array.isArray(data.image_alts)) {
      data.image_alts.forEach((alt) => fd.append("image_alts[]", alt || ""));
    }
    Object.entries(data).forEach(([k, v]) => {
      if (k === "thumbnail" || k === "images" || k === "documents" || k === "document_labels" || k === "image_alts") return;
      if (k === "is_featured" || k === "is_hot") fd.append(k, v ? "1" : "0");
      else if (v != null && v !== "" && !Array.isArray(v) && typeof v !== "object") fd.append(k, String(v));
    });
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/seller/products/${id}`, {
      method: "POST",
      headers,
      body: fd,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
    return json;
  },
  delete: (id) => apiRequest(`/seller/products/${id}`, { method: "DELETE" }),
  restore: (id) => apiRequest(`/seller/products/${id}/restore`, { method: "POST" }),
  duplicate: (id) => apiRequest(`/seller/products/${id}/duplicate`, { method: "POST" }),
  publish: (id) => apiRequest(`/seller/products/${id}/publish`, { method: "POST" }),
  addFlashDeals: (payload) =>
    apiRequest("/seller/flash-deals-bulk", { method: "POST", body: JSON.stringify(payload) }),
  addNewArrivals: (payload) =>
    apiRequest("/seller/new-arrivals", { method: "POST", body: JSON.stringify(payload) }),
  variants: {
    list: (productId) => apiRequest(`/seller/products/${productId}/variants`),
    createBulk: (productId, variants) =>
      apiRequest(`/seller/products/${productId}/variants/bulk`, {
        method: "POST",
        body: JSON.stringify({ variants }),
      }),
    create: async (productId, data) => {
      const { image, images, ...rest } = data;
      const hasFiles = (image && typeof File !== "undefined" && image instanceof File) ||
        (Array.isArray(images) && images.some((f) => typeof File !== "undefined" && f instanceof File));
      if (hasFiles) {
        const fd = new FormData();
        Object.entries(rest).forEach(([k, v]) => {
          if (k === "attributes" && v && typeof v === "object") {
            Object.entries(v).forEach(([ak, av]) => fd.append("attributes[" + ak + "]", String(av)));
          } else if (v != null && v !== "" && typeof v !== "object") fd.append(k, v);
        });
        if (image && typeof File !== "undefined" && image instanceof File) fd.append("image", image);
        if (Array.isArray(images))
          images.forEach((f) => { if (typeof File !== "undefined" && f instanceof File) fd.append("images[]", f); });
        const token = getToken();
        const res = await fetch(`${API_BASE}/seller/products/${productId}/variants`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
          body: fd,
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
        return json;
      }
      return apiRequest(`/seller/products/${productId}/variants`, {
        method: "POST",
        body: JSON.stringify(rest),
      });
    },
    update: async (productId, variantId, data) => {
      const { image, images, ...rest } = data;
      const hasFiles = (image && typeof File !== "undefined" && image instanceof File) ||
        (Array.isArray(images) && images.some((f) => typeof File !== "undefined" && f instanceof File));
      if (hasFiles) {
        const fd = new FormData();
        fd.append("_method", "PUT");
        Object.entries(rest).forEach(([k, v]) => {
          if (k === "attributes" && v && typeof v === "object")
            Object.entries(v).forEach(([ak, av]) => fd.append("attributes[" + ak + "]", String(av)));
          else if (v != null && v !== "" && typeof v !== "object") fd.append(k, v);
        });
        if (image && typeof File !== "undefined" && image instanceof File) fd.append("image", image);
        if (Array.isArray(images))
          images.forEach((f) => { if (typeof File !== "undefined" && f instanceof File) fd.append("images[]", f); });
        const token = getToken();
        const res = await fetch(`${API_BASE}/seller/products/${productId}/variants/${variantId}`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
          body: fd,
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
        return json;
      }
      return apiRequest(`/seller/products/${productId}/variants/${variantId}`, {
        method: "PUT",
        body: JSON.stringify(rest),
      });
    },
    delete: (productId, variantId) =>
      apiRequest(`/seller/products/${productId}/variants/${variantId}`, { method: "DELETE" }),
  },
};

export const sellerFlashDealsApi = {
  list: () => apiRequest("/seller/flash-deals"),
  get: (id) => apiRequest(`/seller/flash-deals/${id}`),
  create: async (data) => {
    const fd = new FormData();
    fd.append("name", data.name || "");
    fd.append("discount_type", data.discount_type || "percentage");
    fd.append("discount_value", String(data.discount_value ?? 0));
    if (data.ends_at) fd.append("ends_at", data.ends_at);
    const selections = data.product_selections ?? (data.product_ids ? data.product_ids.map((id) => ({ product_id: id, variant_id: null })) : []);
    selections.forEach((s, i) => {
      fd.append(`product_selections[${i}][product_id]`, s.product_id);
      fd.append(`product_selections[${i}][variant_id]`, s.variant_id ?? "");
    });
    if (data.image && (data.image instanceof File || (typeof File !== "undefined" && data.image instanceof File))) {
      fd.append("image", data.image, data.image.name || "image.jpg");
    }
    if (data.image_alt) fd.append("image_alt", data.image_alt);
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/seller/flash-deals`, { method: "POST", headers, body: fd, credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
    return json;
  },
  update: async (id, data) => {
    const fd = new FormData();
    fd.append("_method", "PUT");
    if (data.name != null) fd.append("name", data.name);
    if (data.discount_type != null) fd.append("discount_type", data.discount_type);
    if (data.discount_value != null) fd.append("discount_value", String(data.discount_value));
    if (data.ends_at !== undefined) fd.append("ends_at", data.ends_at || "");
    if (data.is_active !== undefined) fd.append("is_active", data.is_active ? "1" : "0");
    const selections = data.product_selections ?? (data.product_ids ? data.product_ids.map((pid) => ({ product_id: pid, variant_id: null })) : null);
    if (selections?.length) {
      selections.forEach((s, i) => {
        fd.append(`product_selections[${i}][product_id]`, s.product_id);
        fd.append(`product_selections[${i}][variant_id]`, s.variant_id ?? "");
      });
    }
    if (data.image && (data.image instanceof File || (typeof File !== "undefined" && data.image instanceof File))) {
      fd.append("image", data.image, data.image.name || "image.jpg");
    }
    if (data.image_alt) fd.append("image_alt", data.image_alt);
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/seller/flash-deals/${id}`, { method: "POST", headers, body: fd, credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
    return json;
  },
  delete: (id) => apiRequest(`/seller/flash-deals/${id}`, { method: "DELETE" }),
};

export const sellerOrdersApi = {
  list: (params = {}) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set("page", params.page);
    if (params.status) sp.set("status", params.status);
    if (params.order_number) sp.set("order_number", params.order_number);
    if (params.date_from) sp.set("date_from", params.date_from);
    if (params.date_to) sp.set("date_to", params.date_to);
    const q = sp.toString();
    return apiRequest("/seller/orders" + (q ? "?" + q : ""));
  },
  get: (id) => apiRequest(`/seller/orders/${id}`),
  approve: (id) => apiRequest(`/seller/orders/${id}/approve`, { method: "POST" }),
  reject: (id, reason) =>
    apiRequest(`/seller/orders/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejection_reason: reason }),
    }),
  approveCancellation: (id) =>
    apiRequest(`/seller/orders/${id}/approve-cancellation`, { method: "POST" }),
  rejectCancellation: (id) =>
    apiRequest(`/seller/orders/${id}/reject-cancellation`, { method: "POST" }),
};

export const sellerShipmentApi = {
  addTracking: (orderId, data) =>
    apiRequest(`/seller/orders/${orderId}/tracking`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (shipmentId, status) =>
    apiRequest(`/seller/shipments/${shipmentId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

export const inventoryApi = {
  updateStock: (productId, data) =>
    apiRequest(`/seller/products/${productId}/stock`, { method: "PUT", body: JSON.stringify(data) }),
  updateLowStockThreshold: (productId, data) =>
    apiRequest(`/seller/products/${productId}/low-stock-threshold`, { method: "PUT", body: JSON.stringify(data) }),
  stockHistory: (productId, page = 1) =>
    apiRequest(`/seller/products/${productId}/stock-history?page=${page}`),
  lowStock: (page = 1) => apiRequest(`/seller/inventory/low-stock?page=${page}`),
  outOfStock: (page = 1) => apiRequest(`/seller/inventory/out-of-stock?page=${page}`),
};

export const payoutsApi = {
  earnings: () => apiRequest("/payouts/earnings"),
  request: (payoutMethod = "bank", amount = null) =>
    apiRequest("/payouts/request", {
      method: "POST",
      body: JSON.stringify({
        method: payoutMethod,
        ...(amount != null && amount > 0 ? { amount: parseFloat(amount) } : {}),
      }),
    }),
  history: () => apiRequest("/payouts/history"),
};

export const paymentApi = {
  preview: (data) => apiRequest("/payment/preview", { method: "POST", body: JSON.stringify(data) }),
};

export const shippingApi = {
  calculate: (data) => apiRequest("/shipping/calculate", { method: "POST", body: JSON.stringify(data) }),
  estimate: (data) => apiRequest("/shipping/estimate", { method: "POST", body: JSON.stringify(data) }),
};

export const couponApi = {
  validate: (code) => apiRequest("/coupons/validate", { method: "POST", body: JSON.stringify({ code: code.trim() }) }),
};

export const reviewApi = {
  list: (params) => apiRequest(`/reviews?${new URLSearchParams(params).toString()}`),
  create: async (data) => {
    if (data.images?.length) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === "images") data.images.forEach((f) => fd.append("images[]", f));
        else if (k === "product_ids" && Array.isArray(v)) v.forEach((id) => fd.append("product_ids[]", id));
        else if (v != null && v !== "") fd.append(k, v);
      });
      const token = getToken();
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json });
      return json;
    }
    return apiRequest("/reviews", { method: "POST", body: JSON.stringify(data) });
  },
  helpful: (id) => apiRequest(`/reviews/${id}/helpful`, { method: "POST" }),
  report: (id, reason) => apiRequest(`/reviews/${id}/report`, { method: "POST", body: JSON.stringify({ reason }) }),
  reply: (id, body) => apiRequest(`/reviews/${id}/reply`, { method: "POST", body: JSON.stringify({ body }) }),
};

export const promotionApi = {
  packages: () => apiRequest("/promotions/packages"),
  mySubscriptions: () => apiRequest("/promotions/my-subscriptions"),
  history: (page = 1) => apiRequest(`/promotions/history?page=${page}`),
  eligibility: () => apiRequest("/promotions/eligibility"),
  purchase: (data) => apiRequest("/promotions/purchase", { method: "POST", body: JSON.stringify(data) }),
};

export const privateListingsApi = {
  config: () => apiRequest("/private-listings/config"),
  list: () => apiRequest("/private-listings"),
  orders: (page = 1) => apiRequest(`/private-listings/orders?page=${page}`),
  getOrder: (orderId) => apiRequest(`/private-listings/orders/${orderId}`),
  create: async (payload) => {
    if (payload.images?.length || payload.thumbnail || payload.documents?.length) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (k === "images") (payload.images || []).forEach((file) => fd.append("images[]", file));
        else if (k === "image_alts" && Array.isArray(v)) v.forEach((alt) => fd.append("image_alts[]", alt || ""));
        else if (k === "documents") (payload.documents || []).forEach((file) => fd.append("documents[]", file));
        else if (k === "document_labels" && Array.isArray(v)) v.forEach((label) => fd.append("document_labels[]", label || ""));
        else if (v != null && v !== "" && !Array.isArray(v)) fd.append(k, v);
      });
      const token = getToken();
      const res = await fetch(`${API_BASE}/private-listings`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data.message || "Request failed"), { data, status: res.status });
      return data;
    }
    return apiRequest("/private-listings", { method: "POST", body: JSON.stringify(payload) });
  },
  update: async (id, payload) => {
    if (payload.images?.length || payload.thumbnail || payload.documents?.length) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (k === "images") (payload.images || []).forEach((file) => fd.append("images[]", file));
        else if (k === "image_alts" && Array.isArray(v)) v.forEach((alt) => fd.append("image_alts[]", alt || ""));
        else if (k === "documents") (payload.documents || []).forEach((file) => fd.append("documents[]", file));
        else if (k === "document_labels" && Array.isArray(v)) v.forEach((label) => fd.append("document_labels[]", label || ""));
        else if (k === "is_featured" || k === "is_hot") fd.append(k, v ? "1" : "0");
        else if (v != null && v !== "" && !Array.isArray(v)) fd.append(k, v);
      });
      fd.append("_method", "PUT");
      const token = getToken();
      const res = await fetch(`${API_BASE}/private-listings/${id}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data.message || "Request failed"), { data, status: res.status });
      return data;
    }
    return apiRequest(`/private-listings/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  delete: (id) => apiRequest(`/private-listings/${id}`, { method: "DELETE" }),
  restore: (id) => apiRequest(`/private-listings/${id}/restore`, { method: "POST" }),
  activate: (id) => apiRequest(`/private-listings/${id}/activate`, { method: "POST" }),
  payActivate: (id, payload = {}) =>
    apiRequest(`/private-listings/${id}/pay-activate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  approveOrder: (id) =>
    apiRequest(`/private-listings/orders/${id}/approve`, { method: "POST" }),
  rejectOrder: (id, reason) =>
    apiRequest(`/private-listings/orders/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejection_reason: reason }),
    }),
  approveCancellation: (id) =>
    apiRequest(`/private-listings/orders/${id}/approve-cancellation`, { method: "POST" }),
  rejectCancellation: (id) =>
    apiRequest(`/private-listings/orders/${id}/reject-cancellation`, { method: "POST" }),
};

export const privateSellerApi = {
  status: () => apiRequest("/private-seller/status"),
  apply: async (payload = {}) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (k === "id_front" || k === "id_back" || k === "id_document") {
        if (v instanceof File || (typeof File !== "undefined" && v instanceof File)) {
          fd.append(k, v);
        }
        return;
      }
      if (v != null && v !== "") fd.append(k, String(v));
    });
    // Backend currently accepts id_document; map front side if present
    if (payload.id_front && !payload.id_document) {
      fd.append("id_document", payload.id_front);
    }
    const token = getToken();
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/private-seller/apply`, {
      method: "POST",
      headers,
      body: fd,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.message || "Failed"), { data: json, status: res.status });
    return json;
  },
};

export { getToken, setToken };
