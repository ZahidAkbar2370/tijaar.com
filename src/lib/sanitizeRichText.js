/**
 * Strip empty paragraphs/lines from Quill or CKEditor HTML before rendering.
 */
export function sanitizeRichTextHtml(html) {
  if (!html || typeof html !== "string") return html || "";

  const emptyBlock =
    /<(?:p|div)[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?>|<span[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/span>)*<\/(?:p|div)>/gi;

  let cleaned = html;
  let previous = "";
  while (previous !== cleaned) {
    previous = cleaned;
    cleaned = cleaned.replace(emptyBlock, "");
  }

  return cleaned.replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>").trim();
}
