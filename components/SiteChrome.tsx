"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const nav = [["Home","/home"],["About","/about"],["Blog","/blog"],["The Canon","/collections"]];

export function SiteChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [cookie, setCookie] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => setCookie(!localStorage.getItem("osita-cookie-choice")), []);
  function chooseCookie(value: string) { localStorage.setItem("osita-cookie-choice", value); setCookie(false); }
  function submitSearch(e: FormEvent) { e.preventDefault(); if (search.trim()) location.href = `/collections?q=${encodeURIComponent(search.trim())}`; }
  return <>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="/home">Osita Chidoka</a>
        <button className="menu-button" aria-label="Toggle navigation" onClick={() => setMenu(!menu)}><span></span><span></span></button>
        <div className={`header-tools ${menu ? "open" : ""}`}>
          <nav>{nav.map(([label, href]) => <a key={href} className={path === href || (href === "/home" && path === "/") ? "active" : ""} href={href}>{label}</a>)}</nav>
          <form className="header-search" onSubmit={submitSearch}><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search" placeholder="Search…" /></form>
          <a className="signin" href="/admin">CMS Admin</a>
        </div>
      </div>
    </header>
    {children}
    <Footer />
    {cookie && <aside className="cookie-card" aria-live="polite"><span className="cookie-icon">◔</span><div><strong>Cookie Notice</strong><p>We use cookies to improve your browsing experience and understand site traffic.</p><div className="cookie-actions"><button onClick={()=>chooseCookie("accepted")}>Accept</button><button className="secondary" onClick={()=>chooseCookie("declined")}>Decline</button></div></div></aside>}
  </>;
}

function Footer() {
  return <footer><div className="wrap footer-grid">
    <div><a className="brand footer-brand" href="/home">Osita Chidoka</a><p>Public servant. Writer. Institution builder.</p><div className="socials"><a href="https://web.facebook.com/ositadinmabchidoka" aria-label="Facebook">f</a><a href="https://x.com/osita_chidoka" aria-label="X">𝕏</a><a href="https://www.instagram.com/osita_chidoka/" aria-label="Instagram">◎</a><a href="https://www.youtube.com/@ositachidokaikeobosi7562" aria-label="YouTube">▶</a></div></div>
    <div><span className="footer-title">Writing</span><a href="/collections">The Canon</a><a href="/collections?category=development">Governance</a><a href="/collections?category=leadership">Leadership</a><a href="/collections?category=politics">Politics</a></div>
    <div><span className="footer-title">More</span><a href="/about">About</a><a href="/unlocknaija">Unlock Naija</a><a href="/mekariamentorship">Mekaria Mentorship</a><a href="/pressinquiry">Press Inquiry</a><a href="/admin">Admin CMS</a></div>
    <div><a className="footer-email" href="mailto:enquiries@ositachidoka.com">enquiries@ositachidoka.com</a></div>
  </div><div className="wrap footer-bottom"><span>© 2026 Osita Chidoka. All rights reserved.</span><div><a href="/privacypolicy">Privacy Policy</a><a href="/termsofservice">Terms of Service</a><a href="/cookiespolicy">Cookies Policy</a><a href="/admin">CMS Backend</a></div></div></footer>;
}
