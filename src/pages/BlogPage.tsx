import { useState, useEffect, FormEvent } from "react";
import { getCMSData, addCMSSubscriber, DispatchPost } from "../lib/cms-store";

export function BlogPage() {
  const [posts, setPosts] = useState<DispatchPost[]>(() => {
    const data = getCMSData();
    return data.dispatches.filter((p) => p.published !== false);
  });

  useEffect(() => {
    const handleUpdate = () => {
      const data = getCMSData();
      setPosts(data.dispatches.filter((p) => p.published !== false));
    };
    window.addEventListener("osita_cms_updated", handleUpdate);
    return () => window.removeEventListener("osita_cms_updated", handleUpdate);
  }, []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [subEmail, setSubEmail] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<DispatchPost | null>(null);

  useEffect(() => {
    if (selectedPost) {
      window.scrollTo(0, 0);
    }
  }, [selectedPost]);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes("@")) return;
    setSubLoading(true);

    try {
      addCMSSubscriber(subEmail, "Blog Page");
      setSubSuccess(true);
      setSubEmail("");
    } catch {
      alert("Failed to subscribe.");
    } finally {
      setSubLoading(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCategory =
      category === "All Categories" || p.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["Politics", "Youth", "Development", "Transport", "Business", "Culture", "Leadership"];

  if (selectedPost) {
    return (
      <main style={{ paddingBlock: "40px 80px", background: "var(--paper)" }}>
        <div className="wrap-wide">
          <div className="dark-reader-container">
            <div className="dark-reader-topbar">
              <button
                onClick={() => setSelectedPost(null)}
                className="dark-reader-back-link"
                style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}
              >
                ← Back to All Dispatches
              </button>
              <div className="dark-reader-tags">
                <span className="dark-reader-badge category">{selectedPost.category.toLowerCase()}</span>
              </div>
            </div>

            <div className="dark-reader-header">
              <h1 className="dark-reader-title">{selectedPost.title}</h1>
              <p className="dark-reader-date">Published on {selectedPost.date} · By {selectedPost.author || "Osita Chidoka"}</p>
            </div>

            <div className="dark-reader-body">
              <p className="dark-reader-lead">{selectedPost.summary}</p>
              {Array.isArray(selectedPost.content) && selectedPost.content.length > 0 ? (
                selectedPost.content.map((paragraph, idx) => {
                  if (/<[a-z][\s\S]*>/i.test(paragraph)) {
                    return (
                      <div
                        key={idx}
                        style={{ marginBottom: "24px", lineHeight: "1.8" }}
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    );
                  }
                  return (
                    <p key={idx} className="dark-reader-p">
                      {paragraph}
                    </p>
                  );
                })
              ) : null}
            </div>

            {selectedPost.pdfUrl && selectedPost.pdfUrl !== "#" && (
              <div className="dark-reader-actions">
                <a
                  href={selectedPost.pdfUrl}
                  download={selectedPost.pdfFileName || "dispatch_document.pdf"}
                  className="dark-reader-pdf-btn"
                  style={{ textDecoration: "none" }}
                >
                  📄 Download Attached PDF
                </a>
              </div>
            )}

            <div style={{ paddingTop: "24px", borderTop: "1px solid #1e293b" }}>
              <button
                onClick={() => setSelectedPost(null)}
                className="gold-button"
                style={{ border: 0 }}
              >
                ← Back to Dispatches
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="page-title wrap">
        <p className="eyebrow">The Dispatch</p>
        <h1>Blog &amp; Dispatches</h1>
        <p style={{ maxWidth: "680px", marginTop: "16px", color: "var(--muted)" }}>
          Short-form commentaries, media briefs, and updates from Chief Osita Chidoka&apos;s public engagements.
        </p>
      </section>

      <section className="blog-body wrap" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "48px", paddingBottom: "100px" }}>
        <div className="blog-main">
          <div className="blog-filters" style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="⌕ Search posts..."
              style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--line)", background: "#fff", borderRadius: "4px" }}
            />
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: "10px 14px", border: "1px solid var(--line)", background: "#fff", borderRadius: "4px" }}
            >
              <option>All Categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="no-posts" style={{ padding: "40px", textAlign: "center", border: "1px solid var(--line)", background: "#fff" }}>
              <p>No dispatches found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All Categories");
                }}
                className="gold-button"
                style={{ marginTop: "16px" }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="dispatches-grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="dispatch-post-card clickable"
                  onClick={() => setSelectedPost(post)}
                  style={{
                    cursor: "pointer",
                    padding: "28px",
                    border: "1px solid var(--line)",
                    background: "#fff",
                    borderRadius: "8px",
                    transition: "all 0.2s ease"
                  }}
                >
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
              ))}
            </div>
          )}
        </div>

        <aside className="blog-aside">
          <div className="subscribe-card" style={{ padding: "24px", border: "1px solid var(--line)", background: "#fff", borderRadius: "8px", marginBottom: "24px" }}>
            <strong style={{ fontSize: "16px", display: "block", marginBottom: "8px" }}>✉ Stay Updated</strong>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>Get Chief Osita Chidoka&apos;s latest insights directly in your inbox.</p>
            {subSuccess ? (
              <div className="sub-success-box" style={{ padding: "10px", background: "#e4eddf", color: "#35552c", borderRadius: "4px", fontSize: "13px" }}>✓ Subscribed successfully!</div>
            ) : (
              <form onSubmit={handleSubscribe} className="subscribe-form" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
                <button type="submit" disabled={subLoading} className="gold-button" style={{ border: 0, padding: "10px" }}>
                  {subLoading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>

          <div className="category-card" style={{ padding: "24px", border: "1px solid var(--line)", background: "#fff", borderRadius: "8px" }}>
            <strong style={{ fontSize: "16px", display: "block", marginBottom: "16px" }}>Categories</strong>
            <div
              className="category-count-row"
              onClick={() => setCategory("All Categories")}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: "14px",
                color: category === "All Categories" ? "var(--gold)" : "var(--ink)",
                fontWeight: category === "All Categories" ? "bold" : "normal"
              }}
            >
              <span>All Categories</span>
              <span style={{ color: "var(--muted)" }}>{posts.length}</span>
            </div>
            {categories.map((c) => {
              const count = posts.filter((p) => p.category.toLowerCase() === c.toLowerCase()).length;
              return (
                <div
                  key={c}
                  className="category-count-row"
                  onClick={() => setCategory(c)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--line)",
                    fontSize: "14px",
                    color: category === c ? "var(--gold)" : "var(--ink)",
                    fontWeight: category === c ? "bold" : "normal"
                  }}
                >
                  <span>{c}</span>
                  <span style={{ color: "var(--muted)" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </section>
    </main>
  );
}
