"use client";

import { usePathname } from "next/navigation";
import CategoryMegaMenu from "./CategoryMegaMenu";

export default function ConditionalCategoryMenu() {
  const pathname = usePathname() || "";
  const hideOnAccount = pathname.startsWith("/customer") || pathname.startsWith("/seller");
  if (hideOnAccount) return null;
  return <CategoryMegaMenu />;
}
