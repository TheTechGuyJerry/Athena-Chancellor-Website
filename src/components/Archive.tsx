import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Essay } from "../lib/essays";

interface ArchiveProps {
  initialEssays: Essay[];
  initialSearch?: string;
}

export function Archive({ initialEssays, initialSearch = "" }: ArchiveProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState(initialSearch);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialEssays.forEach((e) => cats.add(e.category));
    return ["ALL", ...Array.from(cats)];
  }, [initialEssays]);

  const filtered = useMemo(() => {
    return initialEssays.filter((essay) => {
      const matchCat = selectedCategory === "ALL" || essay.category === selectedCategory;
      const matchSearch =
        !search ||
        essay.title.toLowerCase().includes(search.toLowerCase()) ||
        essay.summary.toLowerCase().includes(search.toLowerCase()) ||
        essay.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [initialEssays, selectedCategory, search]);

  // Group by year
  const groupedByYear = useMemo(() => {
    const groups: { [year: number]: Essay[] } = {};
    filtered.forEach((essay) => {
      if (!groups[essay.year]) groups[essay.year] = [];
      groups[essay.year].push(essay);
    });
    return Object.entries(groups)
      .map(([year, list]) => ({ year: Number(year), list }))
      .sort((a, b) => b.year - a.year);
  }, [filtered]);

  return (
    <>
      <div className="archive-controls">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="archive-search">
          <span>⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within archive..."
            aria-label="Search within archive"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                border: 0,
                background: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="archive-count">
          Showing <strong>{filtered.length}</strong> essays
          {selectedCategory !== "ALL" && <em> in {selectedCategory}</em>}
          {search && <em> matching &quot;{search}&quot;</em>}
        </div>
      </div>

      <div className="archive-list">
        {groupedByYear.map(({ year, list }) => (
          <div key={year} className="year-group">
            <div className="year-mark">{year}</div>
            <div className="year-essays">
              {list.map((essay) => (
                <Link
                  key={essay.slug}
                  to={`/collections/${essay.slug}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <article className="essay-card interactive">
                    <div className="essay-card-header">
                      <div className="essay-card-title-group">
                        <h2>{essay.title}</h2>
                        <span className="essay-card-category">{essay.category}</span>
                      </div>
                      <div className="essay-card-date-pdf">
                        <span className="essay-card-date">{essay.month}</span>
                      </div>
                    </div>

                    <p className="essay-card-summary">{essay.summary}</p>

                    <div className="essay-card-footer">
                      <div className="essay-card-meta">
                        <span className="meta-item">👁 {essay.views || 100} views</span>
                        <span className="meta-item">📥 {essay.downloads || 25} downloads</span>
                      </div>
                      <div className="essay-card-actions">
                        <span className="read-now-link" style={{ textDecoration: "none" }}>
                          Read essay <span>→</span>
                        </span>
                        <span className="direct-link-btn" title="Direct link">
                          ↗
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
