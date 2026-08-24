import { useEffect } from "react";
import { SITE_CONFIG } from "../lib/site-config";
import { getAbsoluteUrl } from "../lib/url-utils";
import { useLocation } from "react-router-dom";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  structuredData?: any;
}

export function SEOHead({
  title = SITE_CONFIG.defaultTitle,
  description = SITE_CONFIG.defaultDescription,
  canonicalPath,
  image = SITE_CONFIG.defaultImage,
  type = "website",
  article,
  structuredData,
}: SEOHeadProps) {
  const location = useLocation();
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = getAbsoluteUrl(currentPath);

  useEffect(() => {
    // Basic Head
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);

    // Canonical
    let linkCanonical = document.querySelector(`link[rel="canonical"]`);
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // Open Graph
    setMeta("og:site_name", SITE_CONFIG.siteName, true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:image", getAbsoluteUrl(image), true);

    // Article Meta
    if (type === "article" && article) {
      if (article.publishedTime) setMeta("article:published_time", article.publishedTime, true);
      if (article.modifiedTime) setMeta("article:modified_time", article.modifiedTime, true);
      if (article.author) setMeta("article:author", article.author, true);
      if (article.section) setMeta("article:section", article.section, true);
    }

    // Twitter Card
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", getAbsoluteUrl(image));
    if (SITE_CONFIG.socials.x) {
      const handle = SITE_CONFIG.socials.x.split("/").pop();
      if (handle) setMeta("twitter:site", `@${handle}`);
    }

    // Structured Data (JSON-LD)
    let scriptJsonLd = document.querySelector(`script[id="json-ld-schema"]`);
    if (!scriptJsonLd) {
      scriptJsonLd = document.createElement("script");
      scriptJsonLd.setAttribute("type", "application/ld+json");
      scriptJsonLd.setAttribute("id", "json-ld-schema");
      document.head.appendChild(scriptJsonLd);
    }
    
    // Default Breadcrumb Schema
    const pathSegments = currentPath.split("/").filter(Boolean);
    const breadcrumbItems = pathSegments.map((segment, index) => {
      const url = getAbsoluteUrl("/" + pathSegments.slice(0, index + 1).join("/"));
      return {
        "@type": "ListItem",
        "position": index + 2,
        "name": segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        "item": url
      };
    });

    const defaultBreadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": getAbsoluteUrl("/")
        },
        ...breadcrumbItems
      ]
    };

    const finalStructuredData = structuredData 
      ? (Array.isArray(structuredData) ? [...structuredData, defaultBreadcrumb] : [structuredData, defaultBreadcrumb])
      : [defaultBreadcrumb];

    scriptJsonLd.textContent = JSON.stringify(finalStructuredData);

  }, [title, description, canonicalUrl, image, type, article, structuredData]);

  return null;
}
