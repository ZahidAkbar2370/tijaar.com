// Shared client-side field validators used across web forms
// (register, checkout, profile, contact, …) for consistent
// email / phone / postal validation "according to field".

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize Pakistani mobile to stored form: 03XXXXXXXXX (exactly 11 digits).
 * Accepts: 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX, 3XXXXXXXXX.
 * @returns {string|null}
 */
export function normalizePhonePk(value) {
  if (value == null) return null;
  let digits = String(value).trim().replace(/\D/g, "");
  if (!digits) return null;

  // Strip leading 00 international prefix
  if (digits.startsWith("00")) digits = digits.slice(2);

  // 923XXXXXXXXX → 03XXXXXXXXX
  if (digits.startsWith("92") && digits.length >= 12 && digits[2] === "3") {
    digits = "0" + digits.slice(2, 12);
  }

  // 3XXXXXXXXX (10 digits) → 03XXXXXXXXX
  if (digits.startsWith("3") && digits.length === 10) {
    digits = "0" + digits;
  }

  if (digits.startsWith("03") && digits.length > 11) {
    digits = digits.slice(0, 11);
  }

  if (/^03\d{9}$/.test(digits)) {
    return digits;
  }

  return null;
}

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

/** Valid when it normalizes to exactly 03XXXXXXXXX. */
export function isValidPhone(value) {
  return normalizePhonePk(value) != null;
}

export function isValidZip(value) {
  const t = String(value || "").trim();
  if (!t) return true; // optional
  return /^[0-9]{4,10}$/.test(t);
}

// Returns an error string or null.
export function validateEmail(value, { required = true } = {}) {
  const t = String(value || "").trim();
  if (!t) return required ? "Email is required" : null;
  return isValidEmail(t) ? null : "Enter a valid email address";
}

export function validatePhone(value, { required = true } = {}) {
  const t = String(value || "").trim();
  if (!t) return required ? "Phone number is required" : null;
  return isValidPhone(t) ? null : "Enter a valid mobile number (03XXXXXXXXX, 11 digits)";
}

/**
 * Strict profile verification format: must be exactly 03 + 9 digits (11 total).
 * Does not accept 923… or bare 3… — user must type 03XXXXXXXXX.
 */
export function validatePkMobile03(value, { required = true, label = "Mobile number" } = {}) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return required ? `${label} is required` : null;
  if (!digits.startsWith("03")) return `${label} must start with 03`;
  if (digits.length !== 11) return `${label} must be exactly 11 digits`;
  if (!/^03\d{9}$/.test(digits)) return `Enter a valid ${label.toLowerCase()} (03012345678)`;
  return null;
}

export function validateZip(value) {
  return isValidZip(value) ? null : "Enter a valid postal code";
}
