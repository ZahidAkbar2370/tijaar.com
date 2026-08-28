"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";
import { typographyCssVariables } from "@/lib/typography";

export default function TypographyStyles() {
  const { typography } = useSiteSettings();
  const css = `:root {\n${typographyCssVariables(typography)}\n}`;

  return <style id="site-typography-vars" dangerouslySetInnerHTML={{ __html: css }} />;
}
