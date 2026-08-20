import { JoinForm } from "../components/PublicForms";
import { SEOHead } from "../components/SEOHead";

export function MekariaMentorshipPage() {
  return (
    <main>
      <SEOHead
        title="Mekaria Mentorship Programme | Chief Osita Chidoka"
        description="A structured, long-term engagement designed to develop emerging Nigerian leaders in business, politics, and public service."
        canonicalPath="/mekariamentorship"
      />
      <section className="programme-title wrap">
        <p className="eyebrow">Mentorship</p>
        <h1>Mekaria Mentorship</h1>
        <blockquote>
          Mentorship is not advice.<br />
          It is structured exposure, discipline, and accountability over time.
        </blockquote>
      </section>

      <section className="split-feature wrap-wide">
        <img src="/images/osita-speaking.jpg" alt="Osita Chidoka speaking" />
        <div>
          <p className="eyebrow">The programme</p>
          <p>
            The Mekaria Mentorship Programme is a structured, long-term engagement designed to develop emerging Nigerian leaders in business, politics, and public service.
          </p>
          <p>
            It is built on clarity of purpose, disciplined execution, and an understanding of systems.
          </p>
        </div>
      </section>

      <section className="section wrap two-col">
        <div>
          <p className="eyebrow">The focus</p>
          <h2>
            Preparation over<br />
            <em>inspiration.</em>
          </h2>
        </div>
        <ul>
          <li>Developing intellectual clarity</li>
          <li>Building professional discipline</li>
          <li>Understanding systems, not just roles</li>
          <li>Preparing for responsibility, not only opportunity</li>
          <li>Navigating institutions with competence</li>
        </ul>
      </section>

      <section className="programme-facts wrap">
        <div>
          <span>Domain</span>
          <strong>Business, Politics &amp; Public Service</strong>
        </div>
        <div>
          <span>Format</span>
          <strong>1-on-1 Structured Engagement</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>12–24 Months</strong>
        </div>
      </section>

      <section className="form-section wrap">
        <p className="eyebrow">Apply</p>
        <div className="form-layout">
          <div>
            <h2>Apply for Mentorship</h2>
            <p>
              Applications are reviewed individually. Acceptance is selective and based on demonstrated seriousness of purpose.
            </p>
          </div>
          <JoinForm mentorship />
        </div>
      </section>
    </main>
  );
}
