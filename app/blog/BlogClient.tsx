"use client";

import { useEffect, useState, FormEvent } from "react";
import { DispatchPost } from "../../lib/cms-store";

export function BlogClient() {
  const [posts, setPosts] = useState<DispatchPost[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [subEmail, setSubEmail] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<DispatchPost | null>(null);

  useEffect(() => {
    fetch("/api/cms/dispatches")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data.filter((p) => p.published !== false));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes("@")) return;
    setSubLoading(true);

    try {
      const res = await fetch("/api/cms/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail, source: "Blog Page" }),
      });

      if (res.ok) {
        setSubSuccess(true);
        setSubEmail("");
      }
    } catch {
      alert("Failed to subscribe.");
    } finally {
      setSubLoading(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = category === "All Categories" || p.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["Politics", "Youth", "Development", "Transport", "Business", "Culture", "Leadership"];

  return (
    <>
      <section className="blog-body wrap">
        <div className="blog-main">
          <div className="blog-filters">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="⌕ Search posts..."
            />
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <p>No dispatches found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All Categories");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="dispatches-grid">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="dispatch-post-card clickable"
                  onClick={() => setSelectedPost(post)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="dispatch-card-meta">
                    <span className="cat-badge">{post.category}</span>
                    <span className="dispatch-date">{post.date}</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.summary}</p>
                  <div className="dispatch-card-footer">
                    <span className="author">By {post.author || "Osita Chidoka"}</span>
                    <span className="read-more-link">Read article →</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="blog-aside">
          <div className="subscribe-card">
            <strong>✉ Stay Updated</strong>
            <p>Get Chief Osita Chidoka&apos;s latest insights directly in your inbox.</p>
            {subSuccess ? (
              <div className="sub-success-box">✓ Subscribed successfully!</div>
            ) : (
              <form onSubmit={handleSubscribe} className="subscribe-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={subLoading}>
                  {subLoading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>

          <div className="category-card">
            <strong>Categories</strong>
            {categories.map((c) => {
              const count = posts.filter((p) => p.category.toLowerCase() === c.toLowerCase()).length;
              return (
                <div
                  key={c}
                  className="category-count-row"
                  onClick={() => setCategory(c)}
                  style={{ cursor: "pointer" }}
                >
                  <span>{c}</span>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      {selectedPost && (
        <div className="essay-modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="essay-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="essay-modal-close" onClick={() => setSelectedPost(null)} aria-label="Close article">
              ✕
            </button>
            <div className="essay-reader-header">
              <div className="essay-reader-tags">
                <span className="essay-category-badge">{selectedPost.category}</span>
                <span className="essay-date-badge">{selectedPost.date}</span>
              </div>
              <h1 className="essay-reader-title">{selectedPost.title}</h1>
              <p className="essay-reader-author">By {selectedPost.author || "Osita Chidoka"}</p>
            </div>
            <hr className="essay-reader-divider" />
            <div className="essay-reader-body">
              <p className="essay-lead-summary">{selectedPost.summary}</p>
              {Array.isArray(selectedPost.content) && selectedPost.content.length > 0 ? (
                selectedPost.content.map((paragraph, idx) => (
                  <p key={idx} className="essay-paragraph">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="essay-paragraph">{selectedPost.summary}</p>
              )}
            </div>
            <div className="essay-reader-footer">
              <button className="light-button" onClick={() => setSelectedPost(null)}>
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
