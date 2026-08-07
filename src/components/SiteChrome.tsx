import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const links = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/blog", label: "BLOG" },
  { href: "/collections", label: "THE CANON" },
];

export function SiteHeader() {
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/collections?search=${encodeURIComponent(q.trim())}`);
      setQ("");
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/">
          Osita Chidoka
        </Link>
        <div className="header-tools">
          <nav className={menuOpen ? "open" : ""}>
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={active ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <form className="header-search" onSubmit={onSearch}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.7, flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              aria-label="Search"
            />
          </form>
          <button className="signin" onClick={() => navigate("/admin")}>
            Sign In
          </button>
          <button
            className="menu-button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      style={{
        background: "#11100e",
        color: "#f5f0e8",
        padding: "80px 0 40px",
        borderTop: "1px solid #2e2a24",
      }}
    >
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            marginBottom: "60px",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "24px",
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              Osita Chidoka
            </h3>
            <p style={{ color: "#a0988c", fontSize: "14px", lineHeight: "1.6" }}>
              Public Servant, Writer &amp; Institution Builder.
              <br />
              Thinking clearly about governance, state capacity, and leadership.
            </p>
          </div>
          <div>
            <span
              style={{
                display: "block",
                color: "#a8863c",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: ".15em",
                marginBottom: "16px",
              }}
            >
              Navigation
            </span>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, lineHeight: "2.2" }}>
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    style={{ color: "#d8d0c3", fontSize: "14px", textDecoration: "none" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span
              style={{
                display: "block",
                color: "#a8863c",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: ".15em",
                marginBottom: "16px",
              }}
            >
              Legal &amp; Privacy
            </span>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, lineHeight: "2.2" }}>
              <li>
                <Link to="/termsofservice" style={{ color: "#d8d0c3", fontSize: "14px" }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacypolicy" style={{ color: "#d8d0c3", fontSize: "14px" }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookiespolicy" style={{ color: "#d8d0c3", fontSize: "14px" }}>
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: "#a8863c", fontSize: "14px", fontWeight: "bold" }}>
                  CMS Admin Panel →
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #2e2a24",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "13px",
            color: "#7e7568",
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Osita Chidoka. All rights reserved.
          </p>
          <p style={{ margin: 0 }}>
            Designed &amp; Maintained for Chief Osita Chidoka&apos;s Media Office.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function CookieNotice() {
  const [accepted, setAccepted] = useState(() => {
    return localStorage.getItem("osita_cookie_accepted") === "true";
  });

  if (accepted) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        left: "20px",
        maxWidth: "480px",
        margin: "0 0 0 auto",
        background: "#121528",
        color: "#fff",
        padding: "20px 24px",
        borderRadius: "8px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        zIndex: 1000,
        fontSize: "13px",
        lineHeight: "1.5",
        border: "1px solid #2e348c",
      }}
    >
      <p style={{ margin: "0 0 12px 0", color: "#e2e8f0" }}>
        We use essential cookies to enhance your reading experience and measure reader engagement across Chief Osita Chidoka&apos;s published essays.
      </p>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          onClick={() => {
            localStorage.setItem("osita_cookie_accepted", "true");
            setAccepted(true);
          }}
          style={{
            background: "#a8863c",
            color: "#fff",
            border: 0,
            padding: "8px 16px",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: ".05em",
          }}
        >
          Accept Cookies
        </button>
        <Link to="/cookiespolicy" style={{ color: "#cbd5e1", textDecoration: "underline" }}>
          Learn more
        </Link>
      </div>
    </div>
  );
}
