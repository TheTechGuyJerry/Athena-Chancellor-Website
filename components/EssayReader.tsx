"use client";

import { useState } from "react";
import { Essay } from "../lib/essays";
import Link from "next/link";

interface EssayReaderProps {
  essay: Essay;
  isStandalonePage?: boolean;
  onClose?: () => void;
}

export function EssayReader({ essay, isStandalonePage = false, onClose }: EssayReaderProps) {
  const [downloadCount, setDownloadCount] = useState(essay.downloads ?? 0);
  const [copied, setCopied] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Increment local download count
    setDownloadCount((prev) => prev + 1);

    // Create a beautifully formatted plain text / markdown file for download
    const header = `OSITA CHIDOKA — THE CANON\n=========================================\n\nTITLE: ${essay.title.toUpperCase()}\nCATEGORY: ${essay.category}\nDATE: ${essay.month}\n\nSUMMARY:\n${essay.summary}\n\n-----------------------------------------\n\n`;
    const body = essay.content.join("\n\n");
    const footer = `\n\n-----------------------------------------\nDownloaded from Osita Chidoka Platform — https://ositachidoka.org\n© Osita Chidoka. All rights reserved.`;

    const blob = new Blob([header + body + footer], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Osita_Chidoka_${essay.slug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/collections/${essay.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article className={`essay-reader ${isStandalonePage ? "standalone" : "modal-body"}`}>
      {!isStandalonePage && onClose && (
        <button className="essay-reader-close" onClick={onClose} aria-label="Close reader">
          ✕
        </button>
      )}

      <header className="essay-reader-header">
        <div className="essay-reader-meta">
          <span className="essay-category-badge">{essay.category}</span>
          <span className="essay-date">{essay.month}</span>
        </div>
        <h1 className="essay-reader-title">{essay.title}</h1>
        <p className="essay-reader-summary">{essay.summary}</p>

        <div className="essay-reader-toolbar">
          <button className="reader-btn primary" onClick={handleDownload}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17V3"/>
              <path d="m6 11 6 6 6-6"/>
              <path d="M19 21H5"/>
            </svg>
            Download Essay ({downloadCount})
          </button>

          <button className="reader-btn secondary" onClick={handlePrint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save PDF
          </button>

          <button className="reader-btn secondary" onClick={handleCopyLink}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            {copied ? "Link Copied!" : "Share Link"}
          </button>

          {!isStandalonePage && (
            <Link className="reader-btn outline" href={`/collections/${essay.slug}`}>
              Open Direct Page ↗
            </Link>
          )}
        </div>
      </header>

      <div className="essay-reader-content">
        {essay.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <footer className="essay-reader-footer">
        <div className="author-credit">
          <strong>Osita Chidoka</strong>
          <span>Public Servant, Writer & Institution Builder</span>
        </div>
        <div className="footer-actions">
          <button className="download-text-btn" onClick={handleDownload}>
            Download full text file
          </button>
        </div>
      </footer>
    </article>
  );
}
