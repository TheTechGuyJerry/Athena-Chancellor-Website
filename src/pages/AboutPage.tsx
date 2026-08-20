import { Link } from "react-router-dom";
import { getCMSData } from "../lib/cms-store";
import { SEOHead } from "../components/SEOHead";

const roles = [
  ["Chancellor", "Athena Centre for Policy and Leadership"],
  ["Chairman", "Mekaria Institute of Technology and Administration, Obosi"],
  ["Co-founder", "ClearPath Media (Africa Explained)"],
  ["Patron", "Nneka Chidoka Outreach Programme"],
  ["Chairman, Governing Board", "Nigerian Research and Education Network (NgREN)"],
];

export function AboutPage() {
  return (
    <main>
      <SEOHead
        title="About | Chief Osita Chidoka"
        description="Learn about Chief Osita Chidoka's background in public administration, transport reform, electoral processes, and institutional development in Nigeria."
        canonicalPath="/about"
        type="profile"
      />
      <section className="page-title wrap">
        <p className="eyebrow">About</p>
        <h1>Osita Chidoka</h1>
      </section>

      <section className="split-feature wrap-wide">
        <img src="/images/osita-portrait.png" alt="Osita Chidoka" />
        <div>
          <p className="eyebrow">Background</p>
          <p>I have spent more than three decades working within and around Nigerian public institutions in roles that demanded both execution and reflection.</p>
          <p>My work has crossed public administration, transport reform, electoral processes, and institutional development. Through it all, one question has remained: why do systems fail, and what does it take to make them work?</p>
          <p>This platform brings that experience together as an ongoing inquiry.</p>
          <div style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
             {getCMSData().settings.cvUrl && (
               <a href={getCMSData().settings.cvUrl} target="_blank" rel="noopener noreferrer" className="gold-button" style={{ display: "inline-block", textDecoration: "none" }}>View / Download CV</a>
             )}
          </div>
        </div>
      </section>

      <section className="section wrap about-grid">
        <div>
          <p className="eyebrow">Areas of focus</p>
        </div>
        <ul>
          <li>Governance and state capacity</li>
          <li>Leadership and institutional discipline</li>
          <li>Political economy and reform</li>
          <li>The practical realities of building systems in Nigeria</li>
          <li>Access to care and better health outcomes</li>
        </ul>
      </section>

      <section className="section wrap two-col about-life">
        <div>
          <p className="eyebrow">Early life</p>
          <h2>A Nigerian upbringing,<br /><em>a national outlook.</em></h2>
        </div>
        <div>
          <p>Born in Enugu on July 18, 1971, Osita Chidoka studied in Enugu and at the University of Nigeria, Enugu Campus.</p>
          <p>Experiences across Nigeria shaped a deep appreciation for the country&apos;s cultural diversity and strengthened a commitment to national unity and public service.</p>
        </div>
      </section>

      <section className="section wrap institutions-section">
        <div>
          <p className="eyebrow">Board Memberships & Institutions</p>
          <h2>Building platforms<br /><em>that endure.</em></h2>
          <p>Each institution works in a different domain, while sharing the same concern: understanding how systems work and how they can work better.</p>
        </div>
        <div className="role-list">
          {roles.map(([r, p]) => (
            <div key={r + p}>
              <span>{r}</span>
              <strong>{p}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="manifesto">
        <div className="wrap">
          <p>This is a working body of thought—evolving as experience grows and the questions deepen.</p>
          <Link className="light-button" to="/collections">
            Explore the writing
          </Link>
        </div>
      </section>
    </main>
  );
}
