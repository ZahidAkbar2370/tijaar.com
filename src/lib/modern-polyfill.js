/**
 * Minimal polyfills for modern browser targets (Chrome/Edge/Firefox 111+, Safari 16.4+).
 * Replaces Next.js polyfill-module to drop ~11 KiB of unnecessary legacy shims.
 */
if (typeof URL !== "undefined" && typeof URL.canParse !== "function") {
  URL.canParse = function canParse(url, base) {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}
