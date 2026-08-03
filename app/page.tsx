import Link from "next/link";

const institutions = [
  ["The Canon", "Essays and long-form writing on governance, leadership, and institutional development.", "/collections", "Browse writing"],
  ["Athena Centre for Policy and Leadership", "Advancing policy thinking and developing ethical leadership in Nigeria.", "https://athenacentre.org/", "Learn more"],
  ["Mekaria Institute of Technology and Administration", "Building technical competence and leadership capacity in Obosi, Anambra State.", "/mekariamentorship", "Learn more"],
  ["ClearPath Media (Africa Explained)", "Interpreting what matters in Nigeria and across Africa with clarity and disciplined analysis.", "https://clearpathmediatv.com/", "Learn more"],
];

const roles = [
  ["Chancellor", "Athena Centre for Policy and Leadership"],
  ["Chairman", "Mekaria Institute of Technology and Administration, Obosi"],
  ["Co-founder", "ClearPath Media (Africa Explained)"],
  ["Patron", "Nneka Chidoka Outreach Programme"],
  ["Chairman, Governing Board", "Nigerian Research and Education Network (NgREN)"],
];

export default function Home() {
  return (
    <main>
      <section className="hero wrap">
        <p className="eyebrow">Public servant · Writer · Institution builder</p>
        <h1>Osita Chidoka</h1>
        <p className="hero-copy">I write about governance, leadership, and the patient work of building institutions—drawing on public service, policy engagement, and lived experience.</p>
        <img className="hero-image" src="/images/osita-conference.jpg" alt="Osita Chidoka speaking at a university event" />
        <article className="featured">
          <div>
            <p className="eyebrow">Featured essay</p>
            <h2>From Alibi to Agency</h2>
          </div>
          <div>
            <h3>Re-Inventing the South-East Through Data, Discipline and Purpose</h3>
            <p>A case for structured ambition, stronger institutions, and purposeful regional development.</p>
            <Link className="text-link" href="/collections">Read essay <span>→</span></Link>
          </div>
        </article>
      </section>

      <section className="section wrap">
        <div className="section-heading two-col">
          <p className="eyebrow">The work</p>
          <div>
            <h2>The Work</h2>
            <p>The work spans writing, institutions, and public engagement—each addressing a different part of how systems function and how they can improve.</p>
          </div>
        </div>
        <div className="work-grid">
          {institutions.map(([title, body, href, cta]) => (
            <article key={title} className="work-card">
              <h3>{title}</h3><p>{body}</p>
              <a className="text-link" href={href}>{cta} <span>→</span></a>
            </article>
          ))}
        </div>
        <div className="center-action"><Link className="outline-button" href="/about">View institutions</Link></div>
      </section>

      <section className="manifesto">
        <div className="wrap"><p>This platform is not commentary. It is an attempt to think clearly about difficult problems—and to contribute, where possible, to their solution.</p></div>
      </section>

      <section className="section wrap field-section">
        <p className="eyebrow">In the field</p>
        <div className="image-grid">
          <img src="/images/osita-speaking.jpg" alt="Osita Chidoka speaking" />
          <img src="/images/osita-panel.jpg" alt="Panel discussion" />
          <img src="/images/osita-event.jpg" alt="Public engagement" />
        </div>
      </section>

      <section className="section wrap institutions-section">
        <div>
          <p className="eyebrow">Institutions</p>
          <h2>Ideas are necessary,<br/><em>but insufficient.</em></h2>
          <p>Institutions are where ideas are tested, applied, and sustained. Building them is slow, technical, and often unspectacular—which is precisely why it matters.</p>
        </div>
        <div className="role-list">
          {roles.map(([role, place]) => <div key={role+place}><span>{role}</span><strong>{place}</strong></div>)}
        </div>
      </section>

      <section className="dispatch">
        <div className="wrap dispatch-inner">
          <p>Receive new essays directly.</p>
          <Link className="light-button" href="/blog">Subscribe to the dispatch</Link>
        </div>
      </section>

      <section className="connect wrap">
        <p className="eyebrow">Connect</p>
        <h2>Let&apos;s build Nigeria<br/><em>together.</em></h2>
        <p>For media inquiries, speaking invitations, or mentorship enquiries.</p>
        <div className="button-row"><Link className="gold-button" href="/pressinquiry">Press inquiry</Link><a className="outline-button" href="mailto:enquiries@ositachidoka.com">Email directly</a></div>
      </section>
    </main>
  );
}
