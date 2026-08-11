import React, { useRef, useState } from "react";
import { uploadCMSFile } from "../lib/cms-store";

interface CMSContentEditorProps {
  value: string;
  onChange: (val: string) => void;
  pdfUrl?: string;
  pdfFileName?: string;
  onPdfChange: (pdfUrl: string, pdfFileName: string) => void;
  mode: "text" | "html";
  onModeChange: (mode: "text" | "html") => void;
}

export function CMSContentEditor({
  value,
  onChange,
  pdfUrl,
  pdfFileName,
  onPdfChange,
  mode,
  onModeChange,
}: CMSContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [htmlFileName, setHtmlFileName] = useState<string>("");
  const [htmlPreview, setHtmlPreview] = useState<boolean>(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

  // Formatting helpers
  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (selectedText) {
      replacement = `${tagStart}${selectedText}${tagEnd}`;
    } else {
      replacement = `${tagStart}Text here${tagEnd}`;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + tagStart.length,
        start + tagStart.length + (selectedText.length || 9)
      );
    }, 50);
  };

  const handleFontFamilyChange = (font: string) => {
    if (!font) return;
    insertFormatting(`<span style="font-family: ${font}">`, `</span>`);
  };

  const handleFontSizeChange = (size: string) => {
    if (!size) return;
    insertFormatting(`<span style="font-size: ${size}">`, `</span>`);
  };

  const handleInsertLink = () => {
    const url = prompt("Enter link URL:", "https://");
    if (!url) return;
    insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, `</a>`);
  };

  // HTML Upload handler
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHtmlFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlText = event.target?.result as string;
      if (htmlText) {
        onChange(htmlText);
      }
    };
    reader.readAsText(file);
  };

  // PDF Upload handler using Firebase Storage
  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please select a valid .pdf file.");
      return;
    }

    setIsUploadingPdf(true);
    setPdfUploadError(null);

    try {
      const attachment = await uploadCMSFile(file, "general");
      onPdfChange(attachment.url, attachment.filename);
    } catch (err) {
      console.error("PDF upload error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setPdfUploadError(errMsg);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  return (
    <div style={{ background: "#faf8f5", border: "1px solid var(--line)", borderRadius: "8px", padding: "16px" }}>
      {/* Editor Header / Mode Selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          borderBottom: "1px solid var(--line)",
          paddingBottom: "10px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "var(--ink)" }}>
          Content &amp; Formatting Options
        </span>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => onModeChange("text")}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "4px",
              border: "1px solid var(--line)",
              background: mode === "text" ? "#121528" : "#fff",
              color: mode === "text" ? "#fff" : "var(--ink)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📝 Text &amp; Formatting Editor
          </button>
          <button
            type="button"
            onClick={() => onModeChange("html")}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "4px",
              border: "1px solid var(--line)",
              background: mode === "html" ? "#121528" : "#fff",
              color: mode === "html" ? "#fff" : "var(--ink)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🌐 Upload HTML File
          </button>
        </div>
      </div>

      {/* TEXT / RICH FORMATTING MODE */}
      {mode === "text" && (
        <div>
          {/* Formatting Toolbar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "10px",
              background: "#fff",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid var(--line)",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              title="Bold"
              onClick={() => insertFormatting("<b>", "</b>")}
              style={{ padding: "4px 8px", fontWeight: "bold", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              B
            </button>
            <button
              type="button"
              title="Italic"
              onClick={() => insertFormatting("<i>", "</i>")}
              style={{ padding: "4px 8px", fontStyle: "italic", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              I
            </button>
            <button
              type="button"
              title="Underline"
              onClick={() => insertFormatting("<u>", "</u>")}
              style={{ padding: "4px 8px", textDecoration: "underline", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              U
            </button>
            <span style={{ borderLeft: "1px solid #ddd", height: "18px", margin: "0 2px" }} />
            <button
              type="button"
              title="Heading 2"
              onClick={() => insertFormatting("<h2>", "</h2>")}
              style={{ padding: "4px 8px", fontWeight: "bold", fontSize: "11px", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              H2
            </button>
            <button
              type="button"
              title="Heading 3"
              onClick={() => insertFormatting("<h3>", "</h3>")}
              style={{ padding: "4px 8px", fontWeight: "bold", fontSize: "11px", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              H3
            </button>
            <button
              type="button"
              title="Blockquote"
              onClick={() => insertFormatting("<blockquote>", "</blockquote>")}
              style={{ padding: "4px 8px", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              💬 Quote
            </button>
            <button
              type="button"
              title="Bullet List"
              onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
              style={{ padding: "4px 8px", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              • List
            </button>
            <button
              type="button"
              title="Hyperlink"
              onClick={handleInsertLink}
              style={{ padding: "4px 8px", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "3px", cursor: "pointer" }}
            >
              🔗 Link
            </button>
            <span style={{ borderLeft: "1px solid #ddd", height: "18px", margin: "0 2px" }} />

            {/* Font Family Dropdown */}
            <select
              defaultValue=""
              onChange={(e) => {
                handleFontFamilyChange(e.target.value);
                e.target.value = "";
              }}
              style={{ padding: "4px", fontSize: "12px", border: "1px solid #ccc", borderRadius: "3px", background: "#fff" }}
            >
              <option value="" disabled>Font Style...</option>
              <option value="Georgia, serif">Georgia (Serif)</option>
              <option value="'Playfair Display', serif">Playfair Display</option>
              <option value="'Inter', sans-serif">Inter (Sans-serif)</option>
              <option value="Courier New, monospace">Monospace</option>
            </select>

            {/* Font Size Dropdown */}
            <select
              defaultValue=""
              onChange={(e) => {
                handleFontSizeChange(e.target.value);
                e.target.value = "";
              }}
              style={{ padding: "4px", fontSize: "12px", border: "1px solid #ccc", borderRadius: "3px", background: "#fff" }}
            >
              <option value="" disabled>Font Size...</option>
              <option value="22px">Large (22px)</option>
              <option value="18px">Medium (18px)</option>
              <option value="15px">Normal (15px)</option>
              <option value="13px">Small (13px)</option>
            </select>
          </div>

          <textarea
            ref={textareaRef}
            rows={10}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your content here. Separate paragraphs with blank lines. You can use HTML tags (<b>bold</b>, <i>italic</i>, <h2>heading</h2>, <ul>list</ul>) or markdown ## Heading."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--line)",
              borderRadius: "6px",
              fontSize: "14px",
              lineHeight: "1.6",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* HTML FILE UPLOAD MODE */}
      {mode === "html" && (
        <div style={{ background: "#fff", padding: "20px", borderRadius: "6px", border: "1px dashed var(--gold)", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🌐</div>
          <strong style={{ display: "block", fontSize: "15px", marginBottom: "4px" }}>Upload HTML File (.html / .htm)</strong>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 16px 0" }}>
            Select an existing HTML document. The content will be parsed and rendered directly as the publication body.
          </p>

          <input
            type="file"
            accept=".html,.htm"
            onChange={handleHtmlFileUpload}
            style={{ display: "none" }}
            id="cms-html-upload-input"
          />
          <label
            htmlFor="cms-html-upload-input"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "var(--gold)",
              color: "#fff",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            📁 Choose HTML Document
          </label>

          {value && (
            <div style={{ marginTop: "20px", textAlign: "left", background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#166534" }}>
                  ✓ HTML Content Loaded {htmlFileName ? `(${htmlFileName})` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setHtmlPreview(!htmlPreview)}
                  style={{ padding: "4px 10px", fontSize: "12px", border: "1px solid #ccc", background: "#fff", borderRadius: "4px", cursor: "pointer" }}
                >
                  {htmlPreview ? "Hide Preview" : "👁 Toggle Live HTML Preview"}
                </button>
              </div>

              {htmlPreview && (
                <div
                  style={{
                    maxHeight: "250px",
                    overflowY: "auto",
                    padding: "16px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* PDF ATTACHMENT SECTION FOR DOWNLOADS */}
      <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "var(--ink)" }}>
          📎 PDF Document Attachment (For Reader Downloads)
        </label>
        <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 10px 0" }}>
          Attach an official PDF file so readers can click &quot;Download PDF&quot; on the article page to receive this exact document.
        </p>

        {pdfUrl && pdfUrl !== "#" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <span style={{ fontSize: "20px" }}>📄</span>
              <div>
                <strong style={{ fontSize: "13px", color: "#166534", display: "block" }}>
                  {pdfFileName || "Attached Document.pdf"}
                </strong>
                <span style={{ fontSize: "11px", color: "#15803d" }}>PDF Attachment Active</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={pdfUrl}
                download={pdfFileName || "attached_document.pdf"}
                style={{ padding: "6px 12px", fontSize: "12px", background: "#166534", color: "#fff", borderRadius: "4px", textDecoration: "none", fontWeight: "bold" }}
              >
                Download Test
              </a>
              <button
                type="button"
                onClick={() => onPdfChange("#", "")}
                style={{ padding: "6px 12px", fontSize: "12px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "4px", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfFileUpload}
              disabled={isUploadingPdf}
              style={{ display: "none" }}
              id="cms-pdf-upload-input"
            />
            <label
              htmlFor="cms-pdf-upload-input"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: isUploadingPdf ? "#f3f4f6" : "#fff",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isUploadingPdf ? "not-allowed" : "pointer",
                color: "var(--ink)",
              }}
            >
              {isUploadingPdf ? "⏳ Uploading PDF to Firebase Storage..." : "📄 Select PDF File (.pdf)"}
            </label>
            {pdfUploadError && (
              <div style={{ marginTop: "8px", color: "#b91c1c", fontSize: "12px", background: "#fef2f2", padding: "6px 12px", borderRadius: "4px", border: "1px solid #fca5a5" }}>
                ❌ PDF Upload Failed: {pdfUploadError}. Please try again.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
