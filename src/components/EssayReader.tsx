import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Essay } from "../lib/essays";
import { getCMSData, incrementDownloadCount, addEssayComment, getEssayComments, EssayComment } from "../lib/cms-store";
import { formatDocumentDownloadUrl } from "../lib/url-utils";
import { NewsletterForm } from "./NewsletterForm";

interface EssayReaderProps {
  essay: Essay;
  onClose?: () => void;
  isModal?: boolean;
}

export function EssayReader({ essay, onClose, isModal = false }: EssayReaderProps) {
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<EssayComment[]>(() => getEssayComments(essay.slug));
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setComments(getEssayComments(essay.slug));

    const handleUpdate = () => {
      setComments(getEssayComments(essay.slug));
    };

    window.addEventListener("osita_cms_updated", handleUpdate);
    return () => {
      window.removeEventListener("osita_cms_updated", handleUpdate);
    };
  }, [essay.slug]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await addEssayComment({
        essaySlug: essay.slug,
        authorName: authorName.trim() || "Anonymous Reader",
        authorEmail: authorEmail.trim(),
        comment: commentText.trim(),
      });
      setCommentText("");
      setAuthorName("");
      setAuthorEmail("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (essay.pdfUrl && essay.pdfUrl !== "#" && essay.pdfUrl.trim() !== "") {
      const finalUrl = formatDocumentDownloadUrl(essay.pdfUrl);
      window.open(finalUrl, "_blank", "noopener,noreferrer");
      incrementDownloadCount(essay.slug, 'essay');
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
    incrementDownloadCount(essay.slug, 'essay');
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
            <span>💬 {comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
            <span>📥 {essay.downloads || 12} downloads</span>
          </div>
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

      {/* Comments & Discussion Section */}
      <div className="dark-reader-comments-section">
        <div className="comments-header">
          <h3>Comments &amp; Discussion ({comments.length})</h3>
        </div>

        {submitSuccess && (
          <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", fontSize: "14px", marginBottom: "20px" }}>
            ✓ Thank you! Your comment has been posted successfully.
          </div>
        )}

        {submitError && (
          <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: "8px", fontSize: "14px", marginBottom: "20px" }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handlePostComment} className="comment-form">
          <div className="comment-form-row">
            <input
              type="text"
              placeholder="Your Name (e.g., Dr. Amina Bello)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="comment-input"
              required
            />
            <input
              type="email"
              placeholder="Your Email (optional, kept private)"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="comment-input"
            />
          </div>
          <textarea
            placeholder="Share your thoughts, perspectives, or questions on this essay..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="comment-textarea"
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="comment-submit-btn"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments-msg">
              No comments yet. Be the first to share your thoughts on this essay!
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-card">
                <div className="comment-card-header">
                  <span className="comment-author">{c.authorName}</span>
                  <span className="comment-date">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="comment-body">{c.comment}</p>
              </div>
            ))
          )}
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
        <NewsletterForm source="Essay Reader" />
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
