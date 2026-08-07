"use client";

import { useEffect, useMemo, useState } from "react";
import { essays, Essay } from "../lib/essays";
import { EssayReader } from "./EssayReader";
import Link from "next/link";

const categories = ["ALL", "POLITICS", "YOUTH", "DEVELOPMENT", "TRANSPORT", "BUSINESS", "CULTURE"];

export function Archive() {
  const [allEssays, setAllEssays] = useState<Essay[]>(essays);
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [essayViews, setEssayViews] = useState<Record<string, number>>({});
  const [essayDownloads, setEssayDownloads] = useState<Record<string, number>>({});

  useEffect(() => {
    // Fetch live essays from CMS backend API
    fetch("/api/cms/essays")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllEssays(data);
        }
      })
      .catch(() => {
        // Fallback to static list
      });

    const p = new URLSearchParams(location.search);
    const q = p.get("q");
    const c = p.get("category");
    if (q) setQuery(q);
    if (c) setCategory(c.toUpperCase());
  }, []);

  useEffect(() => {
    // Initialize counts for current loaded essays
    const initViews: Record<string, number> = {};
    const initDownloads: Record<string, number> = {};
    allEssays.forEach((e) => {
      initViews[e.slug] = e.views ?? 0;
      initDownloads[e.slug] = e.downloads ?? 0;
    });
    setEssayViews(initViews);
    setEssayDownloads(initDownloads);
  }, [allEssays]);

  const openEssay = (essay: Essay) => {
    setSelectedEssay(essay);
    setEssayViews((prev) => ({
      ...prev,
      [essay.slug]: (prev[essay.slug] ?? essay.views ?? 0) + 1,
    }));
  };

  const closeEssay = () => {
    setSelectedEssay(null);
  };

  const handleQuickDownload = (e: React.MouseEvent, essay: Essay) => {
    e.stopPropagation();

    // Increment count
    setEssayDownloads((prev) => ({
      ...prev,
      [essay.slug]: (prev[essay.slug] ?? essay.downloads ?? 0) + 1,
    }));

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

  const filtered = useMemo(() => {
    return allEssays.filter((e) => {
      const matchCat = category === "ALL" || e.category.toUpperCase() === category;
      const matchQuery =
        !query ||
        (e.title + " " + e.summary + " " + e.category).toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [allEssays, category, query]);

  const years = useMemo(() => [...new Set(filtered.map((e) => e.year))], [filtered]);

  return (
    <>
      <div className="archive-controls">
        <div className="category-tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={c === category ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="archive-search">
          <span>⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the archive…"
          />
        </div>
      </div>

      <p className="archive-count">
        <strong>{filtered.length}</strong> <em>{filtered.length === 1 ? "essay" : "essays"} in the archive</em>
      </p>

      <div className="archive-list">
        {years.map((year) => (
          <section className="year-group" key={year}>
            <div className="year-mark">{year}</div>
            <div className="year-essays">
              {filtered
                .filter((e) => e.year === year)
                .map((e) => {
                  const currentViews = essayViews[e.slug] ?? e.views ?? 0;
                  const currentDownloads = essayDownloads[e.slug] ?? e.downloads ?? 0;

                  return (
                    <article
                      className="essay-card interactive"
                      key={e.title}
                      onClick={() => openEssay(e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          openEssay(e);
                        }
                      }}
                    >
                      <div className="essay-card-header">
                        <div className="essay-card-title-group">
                          <h2>
                            <span className="title-text">{e.title}</span>
                          </h2>
                          <span className="essay-card-category">{e.category}</span>
                        </div>
                        <div className="essay-card-date-pdf">
                          <span className="essay-card-date">{e.month}</span>
                          <button
                            className="essay-card-pdf-btn"
                            onClick={(ev) => handleQuickDownload(ev, e)}
                            title="Download Essay PDF/Text"
                          >
                            PDF / DOC ↓
                          </button>
                        </div>
                      </div>

                      <p className="essay-card-summary">{e.summary}</p>

                      <div className="essay-card-footer">
                        <div className="essay-card-meta">
                          <span className="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            {currentViews} views
                          </span>
                          <span className="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                            {currentDownloads} downloads
                          </span>
                        </div>

                        <div className="essay-card-actions">
                          <span className="read-now-link">
                            Read Essay <span>→</span>
                          </span>
                          <Link
                            href={`/collections/${e.slug}`}
                            className="direct-link-btn"
                            onClick={(ev) => ev.stopPropagation()}
                            title="Direct link to essay page"
                          >
                            ↗
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty">No essays found matching your search.</p>
      )}

      {/* Full Modal Reader */}
      {selectedEssay && (
        <div className="essay-modal-overlay" onClick={closeEssay}>
          <div className="essay-modal-container" onClick={(e) => e.stopPropagation()}>
            <EssayReader
              essay={{
                ...selectedEssay,
                views: essayViews[selectedEssay.slug] ?? selectedEssay.views,
                downloads: essayDownloads[selectedEssay.slug] ?? selectedEssay.downloads,
              }}
              onClose={closeEssay}
            />
          </div>
        </div>
      )}
    </>
  );
}
