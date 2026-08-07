import type { Metadata } from "next";
import { Archive } from "../../components/Archive";

export const metadata: Metadata = { title: "The Canon" };

export default function Collections() {
  return (
    <main>
      <section className="canon-intro wrap">
        <p className="eyebrow">THE CANON</p>
        <p className="canon-lead">
          Essays, policy notes, speeches, and long-form writing — organised as a body of thought, not a stream of content.
        </p>
        <p className="canon-desc">
          The work collected here reflects an ongoing attempt to understand Nigeria — not as it is described, but as it functions.
        </p>
        <Archive />
      </section>
      <section className="dispatch">
        <div className="wrap dispatch-inner">
          <div>
            <p className="eyebrow">THE DISPATCH</p>
            <p>New essays are added as they are completed. Receive them directly.</p>
          </div>
          <a className="light-button" href="/blog">Subscribe to the dispatch</a>
        </div>
      </section>
    </main>
  );
}

