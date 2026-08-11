import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Essay } from "../lib/essays";
import { getCMSData } from "../lib/cms-store";

interface EssayReaderProps {
  essay: Essay;
  onClose?: () => void;
  isModal?: boolean;
}

export function EssayReader({ essay, onClose, isModal = false }: EssayReaderProps) {
  const [copied, setCopied] = useState(false);
  const [emailSub, setEmailSub] = useState("");
  const [subDone, setSubDone] = useState(false);

  const handleDownloadPDF = () => {
    if (essay.pdfUrl && essay.pdfUrl !== "#" && essay.pdfUrl.trim() !== "") {
      window.open(essay.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const textContent = `${essay.title}\nBy Chief Osita Chidoka\nDate: ${essay.month}\nCategory: ${essay.category}\n\n${essay.summary}\n\n${essay.content.join("\n\n")}`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${essay.slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Find 3 related essays excluding current
  const relatedEssays = (getCMSData().essays || [])
    .filter((e) => e.slug !== essay.slug)
    .slice(0, 3);

  const getEssayImage = (cat: string, index: number) => {
    const images = [
      "/images/osita-university.jpg",
      "/images/osita-speaking.jpg",
      "/images/osita-conference.jpg",
      "/images/osita-panel.jpg",
    ];
    return images[index % images.length];
  };

  const body = (
    <div className={`dark-reader-container ${isModal ? "modal-view" : ""}`}>
      {isModal && onClose && (
        <button className="dark-reader-close-btn" onClick={onClose} aria-label="Close reader">
          ✕
        </button>
      )}

      {/* Top Bar */}
      <div className="dark-reader-topbar">
        {!isModal ? (
          <Link to="/collections" className="dark-reader-back-link">
            ← Back to All Collections
          </Link>
        ) : (
          <div></div>
        )}

        <div className="dark-reader-tags">
          <span className="dark-reader-badge category">{essay.category.toLowerCase()}</span>
          <span className="dark-reader-badge doc-type">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            article.pdf
          </span>
        </div>
      </div>

      {/* Featured Cover Image or First Page Graphic in Full Display */}
      {essay.imageUrl && (
        <div className="dark-reader-cover-card">
          <div className="dark-reader-cover-photo-container">
            <img src={essay.imageUrl} alt={essay.title} className="dark-reader-cover-photo" />
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="dark-reader-header">
        <div className="dark-reader-meta-row">
          <span className="dark-reader-date-tag">Published on {essay.month}</span>
          <div className="dark-reader-stats">
            <span>👁 {essay.views || 48} views</span>
            <span>💬 0 comments</span>
            <span>📥 {essay.downloads || 12} downloads</span>
          </div>
        </div>

        {/* Lead Quote Callout */}
        <div className="dark-reader-callout">
          <p>{essay.summary}</p>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="dark-reader-body">
        {essay.content.map((paragraph, index) => {
          if (paragraph.startsWith("## ")) {
            return (
              <h2 key={index} className="dark-reader-h2">
                {paragraph.replace("## ", "")}
              </h2>
            );
          }
          if (paragraph.startsWith("### ")) {
            return (
              <h3 key={index} className="dark-reader-h3">
                {paragraph.replace("### ", "")}
              </h3>
            );
          }
          if (paragraph.startsWith("**")) {
            const cleanText = paragraph.replace(/\*\*/g, "");
            return (
              <p key={index} className="dark-reader-lead">
                <strong>{cleanText}</strong>
              </p>
            );
          }
          if (paragraph.startsWith("*") && paragraph.endsWith("*")) {
            return (
              <p key={index} className="dark-reader-italic">
                <em>{paragraph.replace(/\*/g, "")}</em>
              </p>
            );
          }

          // Check if paragraph is numbered section header e.g. "08 JUSTICE: EQUALITY..."
          if (/^\d{2}\s+[A-Z0-9\s:,\-'"]+$/.test(paragraph.trim())) {
            return (
              <h2 key={index} className="dark-reader-h2">
                {paragraph.trim()}
              </h2>
            );
          }

          // Check if paragraph is numbered list item e.g. "1. World Bank..."
          const matchNumber = paragraph.match(/^(\d+)\.\s+([\s\S]+)/);
          if (matchNumber) {
            const num = matchNumber[1];
            const text = matchNumber[2];
            return (
              <div key={index} className="dark-reader-endnote-item">
                <span className="endnote-number">{num}.</span>
                <span className="endnote-text">{text}</span>
              </div>
            );
          }

          if (/<[a-z][\s\S]*>/i.test(paragraph)) {
            return (
              <div
                key={index}
                className="dark-reader-html-block"
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            );
          }
          return (
            <p key={index} className="dark-reader-p">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="dark-reader-actions">
        <button className="dark-reader-pdf-btn" onClick={handleDownloadPDF}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Share Section */}
      <div className="dark-reader-share-section">
        <div className="share-header">
          <h3>Share this article</h3>
          <span className="info-icon" title="Share with your community">ⓘ</span>
        </div>

        <div className="share-grid">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn fb"
          >
            <span className="share-icon">f</span> Facebook
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(essay.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn tw"
          >
            <span className="share-icon">𝕏</span> Twitter
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn in"
          >
            <span className="share-icon">in</span> LinkedIn
          </a>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(essay.title + " " + window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn wa"
          >
            <span className="share-icon">💬</span> WhatsApp
          </a>

          <a
            href={`mailto:?subject=${encodeURIComponent(essay.title)}&body=${encodeURIComponent(window.location.href)}`}
            className="share-btn em"
          >
            <span className="share-icon">✉</span> Email
          </a>

          <button className="share-btn copy" onClick={handleCopyLink}>
            <span className="share-icon">🔗</span> {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Related Content */}
      <div className="dark-reader-related-section">
        <h2 className="related-heading">Related Content</h2>
        <div className="related-grid">
          {relatedEssays.map((rel, idx) => (
            <Link key={rel.slug} to={`/collections/${rel.slug}`} className="related-card">
              <div className="related-image-wrap">
                <img src={getEssayImage(rel.category, idx)} alt={rel.title} className="related-img" />
              </div>
              <div className="related-card-content">
                <span className="related-tag">{rel.category.toLowerCase()}</span>
                <h3 className="related-title">{rel.title}</h3>
                <p className="related-excerpt">{rel.summary}</p>
                <span className="related-date">{rel.month}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Signup Banner */}
      <div className="dark-reader-newsletter">
        <div className="news-badge">✉ NEWSLETTER</div>
        <h3>Get the latest essays, insights, and initiatives delivered to your inbox.</h3>
        {subDone ? (
          <p className="sub-success">Thank you for subscribing!</p>
        ) : (
          <form
            className="news-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (emailSub) setSubDone(true);
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              value={emailSub}
              onChange={(e) => setEmailSub(e.target.value)}
              required
            />
            <button type="submit">→</button>
          </form>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="essay-modal-overlay" onClick={onClose}>
        <div className="essay-modal-container" onClick={(e) => e.stopPropagation()}>
          {body}
        </div>
      </div>
    );
  }

  return body;
}
