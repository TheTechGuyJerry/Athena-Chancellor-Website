import React, { useState, useRef, useEffect } from "react";

interface ShareDropdownProps {
  title: string;
  url?: string;
  buttonText?: string;
  variant?: "dark" | "light" | "gold";
}

export function ShareDropdown({
  title,
  url,
  buttonText = "Share",
  variant = "light",
}: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareClick = (e: React.MouseEvent, targetUrl: string) => {
    e.stopPropagation();
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          border: variant === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
          background: variant === "dark" ? "#0F172A" : "#ffffff",
          color: variant === "dark" ? "#ffffff" : "#0f172a",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "#0284c7";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = variant === "dark" ? "#334155" : "#cbd5e1";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 1000,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "8px",
            minWidth: "220px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: "6px 10px 8px 10px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "4px",
            }}
          >
            Share Options
          </div>

          <button
            onClick={(e) => handleShareClick(e, `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "8px 12px",
              border: 0,
              background: "transparent",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#1e293b",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#1877f2", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>
              f
            </span>
            <span>Facebook</span>
          </button>

          <button
            onClick={(e) => handleShareClick(e, `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "8px 12px",
              border: 0,
              background: "transparent",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#1e293b",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#000000", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>
              𝕏
            </span>
            <span>Twitter / X</span>
          </button>

          <button
            onClick={(e) => handleShareClick(e, `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "8px 12px",
              border: 0,
              background: "transparent",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#1e293b",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0a66c2", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold" }}>
              in
            </span>
            <span>LinkedIn</span>
          </button>

          <button
            onClick={(e) => handleShareClick(e, `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "8px 12px",
              border: 0,
              background: "transparent",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#1e293b",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#25D366", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
              💬
            </span>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={(e) => handleShareClick(e, `mailto:?subject=${encodedTitle}&body=${encodedUrl}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "8px 12px",
              border: 0,
              background: "transparent",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#1e293b",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#475569", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>
              ✉
            </span>
            <span>Email</span>
          </button>

          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "4px", paddingTop: "4px" }}>
            <button
              onClick={handleCopyLink}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "8px 12px",
                border: 0,
                background: copied ? "#f0fdf4" : "transparent",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                color: copied ? "#166534" : "#0284c7",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseOver={(e) => {
                if (!copied) e.currentTarget.style.background = "#f0f9ff";
              }}
              onMouseOut={(e) => {
                if (!copied) e.currentTarget.style.background = "transparent";
              }}
            >
              <span>🔗</span>
              <span>{copied ? "Link Copied!" : "Copy Share Link"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
