import { Link } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";

export function NotFoundPage({ message = "The page you are looking for does not exist, has been moved, or is temporarily unavailable." }: { message?: string }) {
  return (
    <main className="wrap" style={{ paddingBlock: "100px 140px", textAlign: "center", minHeight: "60vh" }}>
      <SEOHead 
        title="404 - Page Not Found | Chief Osita Chidoka" 
        description={message} 
      />
      
      <p className="eyebrow" style={{ color: "var(--gold)" }}>ERROR 404</p>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "48px", color: "var(--ink)", marginBottom: "24px" }}>
        Page Not Found
      </h1>
      
      <p style={{ maxWidth: "500px", margin: "0 auto 40px auto", color: "var(--muted)", fontSize: "18px", lineHeight: "1.6" }}>
        {message}
      </p>
      
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/" className="gold-button">
          ← Return to Homepage
        </Link>
        <Link to="/essays" className="outline-button">
          Explore Essays
        </Link>
        <Link to="/insights" className="outline-button">
          View Osita Insights
        </Link>
      </div>
    </main>
  );
}
