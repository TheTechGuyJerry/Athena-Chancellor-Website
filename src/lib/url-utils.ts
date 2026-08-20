import { SITE_CONFIG } from "./site-config";

/**
 * Automatically converts SharePoint, OneDrive, and general document links into direct download links by
 * appending or updating the `download=1` query parameter while preserving existing tokens (e.g. `?e=MRkHlg`).
 */
export function formatDocumentDownloadUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return trimmed;

  // 1. If download=1 is already present as a parameter, leave unchanged
  if (/[\?&]download=1(&|$|#)/.test(trimmed)) {
    return trimmed;
  }

  // 2. If another download parameter exists (e.g., download=0 or download=false), replace it with download=1
  if (/([\?&]download=)[^&#]*/.test(trimmed)) {
    return trimmed.replace(/([\?&]download=)[^&#]*/, "$11");
  }

  // 3. Otherwise, append download=1 (preserving any # hash fragment if present)
  const hashIndex = trimmed.indexOf("#");
  const baseUrl = hashIndex !== -1 ? trimmed.slice(0, hashIndex) : trimmed;
  const hashPart = hashIndex !== -1 ? trimmed.slice(hashIndex) : "";

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}download=1${hashPart}`;
}

/**
 * Generates a clean, human-readable, SEO-friendly URL slug from any text title.
 * Converts to lowercase, strips accents and special chars, replaces spaces with hyphens,
 * and collapses redundant hyphens.
 */
export function slugify(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Collapse consecutive -
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing -
}

/**
 * Safely strips HTML tags and markdown formatting from a text string for use in meta descriptions.
 */
export function stripHtml(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formats an absolute production URL for canonical links and Open Graph meta tags.
 */
export function getAbsoluteUrl(path: string = "/"): string {
  const baseUrl = SITE_CONFIG.productionUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
