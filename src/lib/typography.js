/** Default rich-text font sizes — mirrored in backend config/settings_defaults.php */
export const TYPOGRAPHY_DEFAULTS = {
  h1: "1.875rem",
  h2: "1.5rem",
  h3: "1.25rem",
  h4: "1.125rem",
  h5: "1rem",
  h6: "0.875rem",
  p: "1rem",
  body: "1.125rem",
};

const CSS_VAR_MAP = {
  h1: "--font-size-h1",
  h2: "--font-size-h2",
  h3: "--font-size-h3",
  h4: "--font-size-h4",
  h5: "--font-size-h5",
  h6: "--font-size-h6",
  p: "--font-size-p",
  body: "--font-size-body",
};

export function mergeTypography(fromApi) {
  if (!fromApi || typeof fromApi !== "object") return { ...TYPOGRAPHY_DEFAULTS };
  return { ...TYPOGRAPHY_DEFAULTS, ...fromApi };
}

export function typographyCssVariables(typography) {
  const merged = mergeTypography(typography);
  return Object.entries(CSS_VAR_MAP)
    .map(([key, varName]) => `${varName}: ${merged[key] || TYPOGRAPHY_DEFAULTS[key]};`)
    .join("\n");
}
