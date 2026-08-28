/** Auto-sync product SEO fields from name / short description until seller edits them manually. */

export const emptyMetaTouched = () => ({
  title: false,
  description: false,
  keywords: false,
});

export function initialProductMeta(product) {
  const name = (product?.name || "").trim();
  const short = (product?.short_description || "").trim();
  return {
    meta_title: (product?.meta_title || "").trim() || name,
    meta_description: (product?.meta_description || "").trim() || short.slice(0, 160),
    meta_keywords: (product?.meta_keywords || "").trim() || name,
  };
}

export function initialMetaTouched(product) {
  return {
    title: Boolean(product?.meta_title?.trim()),
    description: Boolean(product?.meta_description?.trim()),
    keywords: Boolean(product?.meta_keywords?.trim()),
  };
}

export function metaTouchKeyForField(name) {
  if (name === "meta_title") return "title";
  if (name === "meta_description") return "description";
  if (name === "meta_keywords") return "keywords";
  return null;
}

export function applyProductFormChange(prev, metaTouched, { name, value, type, checked }) {
  const val = type === "checkbox" ? checked : value;

  if (name === "name") {
    return {
      ...prev,
      name: val,
      meta_title: metaTouched.title ? prev.meta_title : val,
      meta_keywords: metaTouched.keywords ? prev.meta_keywords : val,
    };
  }

  if (name === "short_description") {
    return {
      ...prev,
      short_description: val,
      meta_description: metaTouched.description ? prev.meta_description : val.slice(0, 160),
    };
  }

  return { ...prev, [name]: val };
}
