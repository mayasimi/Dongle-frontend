/**
 * Secure HTML sanitizer for rich text content.
 *
 * Storage format: HTML string produced by Tiptap.
 * Only a strict allowlist of tags and attributes is permitted.
 * All other tags/attributes are stripped before rendering.
 *
 * Allowed tags:  p, br, strong, em, s, u, h1-h3, ul, ol, li,
 *                blockquote, pre, code, a, hr
 * Allowed attrs: href, target, rel (on <a> only)
 *
 * External links are forced to open in a new tab with
 * rel="noopener noreferrer" to prevent tab-napping attacks.
 */

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "s", "u",
  "h1", "h2", "h3",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "hr",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

/**
 * Sanitize an HTML string from Tiptap before rendering.
 * Works on both server (SSR) and client via isomorphic-dompurify.
 */
export function sanitizeHtml(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target"],
  });

  // Post-process on client only: ensure all <a> tags have safe attributes
  if (typeof window !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = clean;
    div.querySelectorAll("a").forEach((anchor) => {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    });
    return div.innerHTML;
  }

  return clean;
}

/**
 * Strip all HTML tags and return plain text.
 * Used for truncated previews (e.g. project cards).
 */
export function htmlToPlainText(html: string): string {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? div.innerText ?? "";
}
