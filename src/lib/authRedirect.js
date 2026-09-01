/** Only allow same-origin relative paths (block open redirects). */
export function safeRedirectPath(raw) {
  if (!raw || typeof raw !== "string") return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/login")) return null;
  return path;
}

/** Where to send the user after login (optional redirect query / modal redirect). */
export function postLoginPath(user, redirectTo) {
  const role = user?.role || "customer";
  if (role === "seller") return "/seller/dashboard";
  const ps = user?.private_seller_verification;
  if (user?.is_private_seller && ps?.required && !ps?.complete) return "/customer/verification";
  return safeRedirectPath(redirectTo) || "/customer/dashboard";
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
