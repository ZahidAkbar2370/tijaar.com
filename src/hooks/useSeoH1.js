"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";
import { resolveSeoH1 } from "@/lib/seoHeadings";

/**
 * Client hook for admin-configurable page H1 text.
 * @param {string} pageType
 * @param {object} vars - { name, title, query, fallback }
 */
export function useSeoH1(pageType, vars = {}) {
  const settings = useSiteSettings();
  return resolveSeoH1(pageType, settings, vars);
}
