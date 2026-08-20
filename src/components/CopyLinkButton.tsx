import React, { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: "transparent",
        border: "1px solid var(--line)",
        padding: "8px 16px",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        fontWeight: "bold",
        color: "var(--ink)"
      }}
    >
      {copied ? "✓ Link Copied" : "🔗 Copy Link"}
    </button>
  );
}