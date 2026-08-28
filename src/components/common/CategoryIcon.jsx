"use client";

import * as LucideIcons from "lucide-react";
import { Package } from "lucide-react";

/**
 * Converts kebab-case icon name (from admin) to PascalCase for Lucide.
 * e.g. "shopping-bag" -> "ShoppingBag", "building-2" -> "Building2"
 */
function iconNameToPascal(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + (s.slice(1) || "").toLowerCase())
    .join("");
}

/**
 * Renders the category icon from admin (Lucide icon name in kebab-case).
 * Uses Lucide React so any icon selected in admin displays correctly on the frontend.
 */
export default function CategoryIcon({ icon, className = "w-5 h-5", ...props }) {
  if (!icon) {
    return <Package className={className} aria-hidden {...props} />;
  }
  const pascal = iconNameToPascal(icon.trim());
  const IconComponent = LucideIcons[pascal];
  if (IconComponent && typeof IconComponent === "function") {
    return <IconComponent className={className} aria-hidden {...props} />;
  }
  return <Package className={className} aria-hidden {...props} />;
}
