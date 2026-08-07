import { PressForm } from "../components/PublicForms";

export function PressInquiryPage() {
  return (
    <main>
      <section className="page-title wrap">
        <p className="eyebrow">Media</p>
        <h1>Press Inquiry</h1>
      </section>

      <section className="press-feature wrap-wide">
        <div>
          <p className="eyebrow">Media relations</p>
          <p>For interview requests, press briefings, statements, and media inquiries.</p>
          <p>All requests are reviewed individually. Please provide enough context to enable a considered response.</p>
          <hr />
          <p className="eyebrow">Direct contact</p>
          <a href="mailto:enquiries@ositachidoka.com">enquiries@ositachidoka.com</a>
        </div>
        <img src="/images/osita-panel.jpg" alt="Osita Chidoka at a media engagement" />
      </section>

      <section className="form-section wrap">
        <p className="eyebrow">Submit</p>
        <div className="form-layout">
          <div>
            <h2>Submit an Inquiry</h2>
            <p>Please complete this form for media and press requests.</p>
          </div>
          <PressForm />
        </div>
      </section>
    </main>
  );
}
