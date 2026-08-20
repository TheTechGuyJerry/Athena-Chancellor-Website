import { SEOHead } from "../components/SEOHead";

export function TermsPage() {
  return (
    <main className="wrap" style={{ paddingBlock: "80px 120px" }}>
      <SEOHead title="Terms of Service | Chief Osita Chidoka" description="Terms of service and use for Chief Osita Chidoka's official digital platform." canonicalPath="/termsofservice" />
      <p className="eyebrow">Legal</p>
      <h1>Terms of Service</h1>
      <div style={{ maxWidth: "780px", marginTop: "32px", fontSize: "16px", lineHeight: "1.8", color: "#333" }}>
        <p>Welcome to the official digital platform of Chief Osita Chidoka. By accessing or using this website, you agree to comply with and be bound by the following terms and conditions.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>1. Intellectual Property</h3>
        <p>All essays, policy papers, lecture transcripts, media commentary, and digital assets published on this site remain the intellectual property of Chief Osita Chidoka, unless otherwise attributed. You are permitted to share excerpts with appropriate attribution for non-commercial educational and civic purposes.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>2. Public Submissions</h3>
        <p>Information submitted through mentorship, movement, or press inquiry forms is reviewed solely for administrative processing by Chief Osita Chidoka&apos;s executive team and is not shared with unauthorized third parties.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>3. Amendments</h3>
        <p>We reserve the right to revise these terms as public programs evolve. Continued use of the platform constitutes agreement to the updated policies.</p>
      </div>
    </main>
  );
}

export function PrivacyPage() {
  return (
    <main className="wrap" style={{ paddingBlock: "80px 120px" }}>
      <SEOHead title="Privacy Policy | Chief Osita Chidoka" description="Privacy policy regarding data collection and usage on Chief Osita Chidoka's official website." canonicalPath="/privacypolicy" />
      <p className="eyebrow">Legal</p>
      <h1>Privacy Policy</h1>
      <div style={{ maxWidth: "780px", marginTop: "32px", fontSize: "16px", lineHeight: "1.8", color: "#333" }}>
        <p>Chief Osita Chidoka&apos;s Media Office is committed to protecting your personal data and respecting your privacy.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>1. Data Collection</h3>
        <p>We collect personal information (such as your name, email address, phone number, and profession) only when voluntarily provided by you through form submissions, newsletter subscriptions, or direct correspondence.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>2. Use of Information</h3>
        <p>Your details are used exclusively to process your inquiries, evaluate program applications (e.g. Mekaria Mentorship), or deliver publication dispatches you have subscribed to.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>3. Security &amp; Retention</h3>
        <p>We implement appropriate technical and organizational measures to protect your stored data against unauthorized access, loss, or alteration.</p>
      </div>
    </main>
  );
}

export function CookiesPage() {
  return (
    <main className="wrap" style={{ paddingBlock: "80px 120px" }}>
      <SEOHead title="Cookies Policy | Chief Osita Chidoka" description="Information about how cookies are used on Chief Osita Chidoka's official digital platform." canonicalPath="/cookiespolicy" />
      <p className="eyebrow">Legal</p>
      <h1>Cookies Policy</h1>
      <div style={{ maxWidth: "780px", marginTop: "32px", fontSize: "16px", lineHeight: "1.8", color: "#333" }}>
        <p>This policy explains how our website uses cookies and similar technologies to ensure smooth site navigation and measure essay readership.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>1. What Are Cookies?</h3>
        <p>Cookies are small text files placed on your browser or device when you visit websites. They help store preferences and maintain session states.</p>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "32px", color: "var(--ink)" }}>2. Essential Cookies</h3>
        <p>We use essential cookies for basic security, cookie banner consent tracking, and local admin authentication states. These cookies cannot be disabled without breaking core platform features.</p>
      </div>
    </main>
  );
}
