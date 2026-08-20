import React, { useRef, useState } from "react";
import { formatDocumentDownloadUrl } from "../lib/url-utils";

interface CMSContentEditorProps {
  value: string;
  onChange: (val: string) => void;
  pdfUrl?: string;
  pdfFileName?: string;
  onPdfChange: (pdfUrl: string, pdfFileName: string) => void;
  mode: "text" | "html";
  onModeChange: (mode: "text" | "html") => void;
  onUploadingStateChange?: (isUploading: boolean) => void;
}

export function CMSContentEditor({
  value,
  onChange,
  pdfUrl,
  pdfFileName,
  onPdfChange,
  mode,
  onModeChange
}: CMSContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [htmlFileName, setHtmlFileName] = useState<string>("");
  const [htmlPreview, setHtmlPreview] = useState<boolean>(false);
  const [pdfUrlError, setPdfUrlError] = useState<string | null>(null);

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

      {/* PDF / DOCUMENT LINK SECTION */}
      <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "var(--ink)" }}>
          📎 PDF / Document Link (For Reader Downloads)
        </label>
        <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 10px 0" }}>
          Administrators will manually upload PDFs/documents to OneDrive, Google Drive, SharePoint, Dropbox, or another external file-storage service and paste the shared HTTPS URL into this field.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
              PDF / Document Link *
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/... or https://onedrive.live.com/..."
              value={pdfUrl && pdfUrl !== "#" ? pdfUrl : ""}
              onChange={(e) => {
                const rawVal = e.target.value.trim();
                let processedVal = rawVal;
                if (rawVal && (rawVal.toLowerCase().startsWith("https://") || rawVal.toLowerCase().startsWith("http://"))) {
                  processedVal = formatDocumentDownloadUrl(rawVal);
                }
                if (rawVal && !rawVal.toLowerCase().startsWith("https://")) {
                  setPdfUrlError("URL must start with https://");
                } else {
                  setPdfUrlError(null);
                }
                onPdfChange(processedVal, pdfFileName || "Official Document.pdf");
              }}
              onBlur={() => {
                if (pdfUrl && (pdfUrl.toLowerCase().startsWith("https://") || pdfUrl.toLowerCase().startsWith("http://"))) {
                  const formatted = formatDocumentDownloadUrl(pdfUrl);
                  if (formatted !== pdfUrl) {
                    onPdfChange(formatted, pdfFileName || "Official Document.pdf");
                  }
                }
              }}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: pdfUrlError ? "1px solid #ef4444" : "1px solid var(--line)",
                borderRadius: "4px",
                fontSize: "13px"
              }}
            />
            {pdfUrlError && (
              <span style={{ fontSize: "11px", color: "#b91c1c", marginTop: "4px", display: "block" }}>
                ⚠️ {pdfUrlError}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
              Document Display Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Osita_Chidoka_Policy_Paper.pdf"
              value={pdfFileName || ""}
              onChange={(e) => onPdfChange(pdfUrl || "", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                fontSize: "13px"
              }}
            />
          </div>

          {pdfUrl && pdfUrl.startsWith("https://") && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>📄</span>
                <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600" }}>
                  Active Link: {pdfFileName || "Document"}
                </span>
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{ padding: "4px 10px", fontSize: "12px", background: "#166534", color: "#fff", borderRadius: "4px", textDecoration: "none", fontWeight: "bold" }}
              >
                Test External Link ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
