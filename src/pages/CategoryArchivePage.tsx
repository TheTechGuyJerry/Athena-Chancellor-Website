import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCMSData, incrementDownloadCount, DispatchPost } from "../lib/cms-store";
import { formatDocumentDownloadUrl, stripHtml } from "../lib/url-utils";
import { NewsletterForm } from "../components/NewsletterForm";
import { CopyLinkButton } from "../components/CopyLinkButton";
import { extractYouTubeId, getEpisodeThumbnailUrl } from "../lib/osita-importer";
import { SEOHead } from "../components/SEOHead";

export function CategoryArchivePage({ title, description, categoryMatch }: { title: string; description: string; categoryMatch: string }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const isMatch = (cat: string) => {
    if (!cat) return false;
    const c1 = cat.toLowerCase().trim();
    const c2 = categoryMatch.toLowerCase().trim();
    if (!c1 || !c2) return false;
    return c1 === c2 || c1.includes(c2);
  };

  const [posts, setPosts] = useState<DispatchPost[]>(() => {
    const data = getCMSData() || {};
    if (categoryMatch.toLowerCase().includes("press")) {
      return ((data.pressReleases || []) as unknown as DispatchPost[]).filter((p) => p.published !== false);
    }
    const items = data.insights || data.dispatches || [];
    return items.filter((p) => p.published !== false);
  });

  useEffect(() => {
    const handleUpdate = () => {
      const data = getCMSData() || {};
      if (categoryMatch.toLowerCase().includes("press")) {
        setPosts(((data.pressReleases || []) as unknown as DispatchPost[]).filter((p) => p.published !== false));
      } else {
        const items = data.insights || data.dispatches || [];
        setPosts(items.filter((p) => p.published !== false));
      }
    };
    handleUpdate();
    window.addEventListener("osita_cms_updated", handleUpdate);
    return () => window.removeEventListener("osita_cms_updated", handleUpdate);
  }, [categoryMatch]);

  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<DispatchPost | null>(null);

  useEffect(() => {
    if (slug) {
      const post = posts.find((p) => p.slug === slug || p.id === slug);
      if (post) {
        setSelectedPost(post);
      } else {
        setSelectedPost(null);
      }
    } else {
      setSelectedPost(null);
    }
  }, [slug, posts]);

  useEffect(() => {
    if (selectedPost) {
      window.scrollTo(0, 0);
    }
  }, [selectedPost]);

  const basePath = categoryMatch === "Insight" ? "/insights" : "/press-releases";

  const handleSelectPost = (post: DispatchPost | null) => {
    if (post) {
      navigate(`${basePath}/${post.slug || post.id}`);
    } else {
      navigate(basePath);
    }
  };

  const filteredPosts = posts
    .filter((p) => {
      return !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isVideoLibraryLayout = title.toLowerCase().includes("insight") || categoryMatch.toLowerCase().includes("insight");

  if (selectedPost) {
    const ytId = extractYouTubeId(selectedPost.episodeUrl || selectedPost.pdfUrl);
    const thumbUrl = getEpisodeThumbnailUrl(selectedPost.episodeUrl, selectedPost.imageUrl);

    return (
      <main style={{ paddingBlock: "40px 80px", background: "#f8fafc" }}>
        <SEOHead
          title={`${selectedPost.title} | ${title} | Chief Osita Chidoka`}
          description={stripHtml(selectedPost.summary)}
          canonicalPath={`${basePath}/${selectedPost.slug || selectedPost.id}`}
          type="article"
          image={thumbUrl || selectedPost.imageUrl}
          article={{
            publishedTime: new Date(selectedPost.date).toISOString(),
            author: selectedPost.author || "Osita Chidoka",
            section: selectedPost.category,
          }}
        />
        <div className="wrap-wide">
          {isVideoLibraryLayout ? (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <button onClick={() => handleSelectPost(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px", padding: 0 }}>
                   ← Back to {title}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
                <div className="flex flex-col gap-6">
                  {ytId ? (
                    <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "16 / 9", background: "#000", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        title={selectedPost.title}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : thumbUrl ? (
                    <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "16 / 9", background: "#f1f5f9" }}>
                      <img src={thumbUrl} alt={selectedPost.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : null}

                  <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                      <h1 className="font-serif text-2xl text-slate-900 leading-snug m-0">{selectedPost.title}</h1>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link copied!");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        COPY WEB LINK
                      </button>
                    </div>
                    <div className="text-[15px] leading-relaxed text-slate-700">
                      {(!Array.isArray(selectedPost.content) || selectedPost.content.length === 0 || stripHtml(selectedPost.content[0]).trim() !== selectedPost.summary.trim()) && (
                        <p className="mb-4">{selectedPost.summary}</p>
                      )}
                      {Array.isArray(selectedPost.content) && selectedPost.content.length > 0 ? (
                        selectedPost.content.map((paragraph, idx) => {
                          if (/<[a-z][\s\S]*>/i.test(paragraph)) {
                            return <div key={idx} className="mb-4" dangerouslySetInnerHTML={{ __html: paragraph }} />;
                          }
                          return <p key={idx} className="mb-4">{paragraph}</p>;
                        })
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-6">
                    <h3 className="font-serif text-[20px] text-slate-900 mb-4 mt-0">About the Programme</h3>
                    <p className="text-[14px] leading-relaxed text-slate-600 m-0">
                      Osita Chidoka invites leading thinkers, public servants, and change agents to review the three critical decisions or milestones that shaped their leadership tenure.
                    </p>
                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-3 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cadence</span>
                        <span className="text-slate-900 font-semibold">Twice Weekly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Coverage</span>
                        <span className="text-slate-900 font-semibold">Nigeria</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f4f4f5] border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-300">
                        OC
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-slate-900 m-0 mb-1">Osita Chidoka</h4>
                        <p className="text-[13px] italic text-slate-500 m-0">Host, OsitaInsight</p>
                      </div>
                    </div>
                    <p className="text-[15px] italic leading-relaxed text-slate-700 m-0">
                      OsitaInsight examines governance, public leadership, political institutions, and civic responsibility through calm, evidence-based commentary.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="dark-reader-container" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "32px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
              <div className="dark-reader-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <button onClick={() => handleSelectPost(null)} className="dark-reader-back-link" style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", padding: "8px 16px", fontWeight: "600", fontSize: "14px", color: "#334155" }}>
                  ← Back to {title}
                </button>
                <div className="dark-reader-tags">
                  <span className="dark-reader-badge category" style={{ background: "#0F172A", color: "#fff", padding: "4px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>
                    {selectedPost.category}
                  </span>
                </div>
              </div>

              {ytId ? (
                <div style={{ marginBottom: "28px", borderRadius: "8px", overflow: "hidden", aspectRatio: "16 / 9", background: "#000", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                    title={selectedPost.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : thumbUrl ? (
                <div style={{ marginBottom: "28px", borderRadius: "8px", overflow: "hidden", aspectRatio: "16 / 9", background: "#f1f5f9" }}>
                  <img src={thumbUrl} alt={selectedPost.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : null}

              <div className="dark-reader-header" style={{ marginBottom: "20px" }}>
                <h1 className="dark-reader-title" style={{ fontFamily: "Georgia, serif", fontSize: "32px", color: "#0F172A", margin: "0 0 8px 0" }}>{selectedPost.title}</h1>
                <p className="dark-reader-date" style={{ color: "#64748b", fontSize: "14px" }}>
                  Published on {selectedPost.date} · By {selectedPost.author || "Osita Chidoka"}
                </p>
              </div>

              <div className="dark-reader-body" style={{ fontSize: "16px", lineHeight: "1.7", color: "#334155" }}>
                {(!Array.isArray(selectedPost.content) || selectedPost.content.length === 0 || stripHtml(selectedPost.content[0]).trim() !== selectedPost.summary.trim()) && (
                  <p className="dark-reader-lead" style={{ fontWeight: "500", fontSize: "18px", color: "#1e293b", marginBottom: "20px" }}>{selectedPost.summary}</p>
                )}
                {Array.isArray(selectedPost.content) && selectedPost.content.length > 0 ? (
                  selectedPost.content.map((paragraph, idx) => {
                    if (/<[a-z][\s\S]*>/i.test(paragraph)) {
                      return (
                        <div key={idx} style={{ marginBottom: "24px", lineHeight: "1.8" }} dangerouslySetInnerHTML={{ __html: paragraph }} />
                      );
                    }
                    return <p key={idx} className="dark-reader-p" style={{ marginBottom: "20px" }}>{paragraph}</p>;
                  })
                ) : null}
              </div>

              {selectedPost.episodeUrl && (
                <div className="dark-reader-actions" style={{ marginTop: "24px", marginBottom: "16px" }}>
                  <a href={selectedPost.episodeUrl} target="_blank" rel="noopener noreferrer" className="gold-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", background: "#0F172A", color: "#fff", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold" }}>
                    <span>▶ Watch / Listen Episode on {selectedPost.source || "ClearPath Media"}</span>
                  </a>
                </div>
              )}

              {selectedPost.pdfUrl && selectedPost.pdfUrl !== "#" && !selectedPost.episodeUrl && (
                <div className="dark-reader-actions" style={{ marginTop: "16px" }}>
                  <a href={formatDocumentDownloadUrl(selectedPost.pdfUrl)} target="_blank" rel="noopener noreferrer" className="dark-reader-pdf-btn" style={{ textDecoration: "none", background: "#0284c7", color: "#fff", padding: "12px 20px", borderRadius: "6px", display: "inline-block" }} onClick={() => incrementDownloadCount(selectedPost.id, 'dispatch')}>
                    📄 View / Download Attached Document
                  </a>
                </div>
              )}

              <div style={{ marginTop: "28px", display: "flex", gap: "16px", alignItems: "center" }}>
                <CopyLinkButton url={window.location.href} />
              </div>

              <div style={{ paddingTop: "24px", marginTop: "24px", borderTop: "1px solid #e2e8f0" }}>
                <button onClick={() => handleSelectPost(null)} style={{ background: "#0F172A", color: "#fff", border: 0, padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                  ← Back to {title}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#f8fafc", minHeight: "80vh", paddingBottom: "80px" }}>
      <SEOHead
        title={`${title} | Chief Osita Chidoka`}
        description={description}
        canonicalPath={basePath}
      />
      <section className="wrap" style={{ paddingTop: "40px", paddingBottom: "24px" }}>
        {isVideoLibraryLayout ? (
          /* VIDEO LIBRARY SPECIFIC HEADER MATCHING REFERENCE DESIGN */
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px", marginBottom: "32px" }}>
            <div style={{ borderLeft: "4px solid #0F172A", paddingLeft: "16px" }}>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: "700", color: "#0F172A", margin: 0, lineHeight: 1.2 }}>
                Video Library
              </h1>
            </div>

            {/* Search Box Matching Reference Image */}
            <div style={{ position: "relative", minWidth: "280px" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search index or topics..."
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 38px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}>
                🔍
              </span>
            </div>
          </div>
        ) : (
          <div className="page-title" style={{ marginBottom: "32px" }}>
            <p className="eyebrow" style={{ color: "var(--gold)", textTransform: "uppercase", fontWeight: "bold", fontSize: "12px", letterSpacing: "0.05em" }}>Archive</p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "var(--ink)", margin: "8px 0" }}>{title}</h1>
            <p style={{ maxWidth: "680px", marginTop: "8px", color: "var(--muted)", fontSize: "15px" }}>{description}</p>
          </div>
        )}
      </section>

      <section className="wrap">
        {filteredPosts.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", border: "1px solid #e2e8f0", background: "#fff", borderRadius: "12px", margin: "16px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📰</div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#0F172A", margin: "0 0 8px 0" }}>
              No {title} Available
            </h3>
            <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
              {search
                ? `No items found matching "${search}".`
                : isVideoLibraryLayout
                ? "No episodes found in this video library."
                : `There are currently no official ${title.toLowerCase()} published.`}
            </p>
          </div>
        ) : isVideoLibraryLayout ? (
          /* 3-COLUMN VIDEO LIBRARY GRID LAYOUT MATCHING USER IMAGE */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
            {filteredPosts.map((post) => {
              const thumbUrl = getEpisodeThumbnailUrl(post.episodeUrl, post.imageUrl);
              return (
                <Link
                  key={post.id}
                  to={`${basePath}/${post.slug || post.id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <article
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "all 0.2s ease"
                    }}
                    className="video-library-card"
                  >
                    <div>
                      {/* Fetched Thumbnail Display */}
                      {thumbUrl && (
                        <div
                          style={{
                            borderRadius: "6px",
                            overflow: "hidden",
                            aspectRatio: "16 / 9",
                            marginBottom: "16px",
                            background: "#0F172A",
                            cursor: "pointer",
                            position: "relative"
                          }}
                        >
                        <img
                          src={thumbUrl}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                          onError={(e) => {
                            // Fallback if image fails
                            (e.target as HTMLImageElement).src = "https://www.clearpathmedia.ng/images/ositainsight.jpg";
                          }}
                        />
                      </div>
                    )}

                    {/* Top Row: Date + Share Button */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "13px", color: "#64748b" }}>
                      <span>{post.date}</span>
                      <button
                        title="Share Episode"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = post.episodeUrl || window.location.href;
                          navigator.clipboard.writeText(url);
                          alert("Episode link copied to clipboard!");
                        }}
                        style={{ background: "none", border: 0, cursor: "pointer", color: "#64748b", fontSize: "16px", padding: "2px" }}
                      >
                        🔗
                      </button>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "19px",
                        fontWeight: "700",
                        color: "#0F172A",
                        lineHeight: "1.35",
                        margin: "0 0 10px 0",
                        cursor: "pointer"
                      }}
                    >
                      {post.title}
                    </h3>

                    {/* Author Line */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", marginBottom: "12px", fontWeight: "500" }}>
                      <span>👤</span>
                      <span>{post.author || "Osita Chidoka"}</span>
                    </div>

                    {/* Description (Line clamped) */}
                    <p
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.55",
                        color: "#334155",
                        marginBottom: "24px",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {post.summary}
                    </p>
                  </div>

                  {/* Full Width Dark Navy Watch Video Button */}
                  <div
                    style={{
                      background: "#0B192C",
                      color: "#ffffff",
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "4px",
                      fontWeight: "700",
                      fontSize: "13px",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "background 0.2s ease"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#1E293B")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#0B192C")}
                  >
                    <span>WATCH VIDEO →</span>
                  </div>
                </article>
              </Link>
              );
            })}
          </div>
        ) : (
          /* STANDARD ARCHIVE LIST */
          <div className="dispatches-grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`${basePath}/${post.slug || post.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <article className="dispatch-post-card clickable" style={{ cursor: "pointer", padding: "28px", border: "1px solid var(--line)", background: "#fff", borderRadius: "8px", transition: "all 0.2s ease" }}>
                  <div className="dispatch-card-meta" style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "12px" }}>
                    <span className="cat-badge" style={{ color: "var(--gold)", fontWeight: "bold", textTransform: "uppercase" }}>{post.category}</span>
                    <span className="dispatch-date" style={{ color: "var(--muted)" }}>{post.date}</span>
                  </div>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", margin: "0 0 12px 0", color: "var(--ink)" }}>{post.title}</h2>
                  <p style={{ color: "#4a453e", fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px 0" }}>{post.summary}</p>
                  <div className="dispatch-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span className="author" style={{ color: "var(--muted)", fontStyle: "italic" }}>By {post.author || "Osita Chidoka"}</span>
                    <span className="read-more-link" style={{ color: "var(--gold)", fontWeight: "bold" }}>Read article →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

