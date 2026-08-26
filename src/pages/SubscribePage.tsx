import React from "react";
import { SEOHead } from "../components/SEOHead";
import { NewsletterForm } from "../components/NewsletterForm";

export function SubscribePage() {
  return (
    <>
      <SEOHead 
        title="Subscribe | Osita Chidoka" 
        description="Join the dispatch to receive the latest essays, insights, and updates directly to your inbox." 
      />
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "80px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <div style={{ 
          background: "#fff", 
          padding: "48px", 
          borderRadius: "8px", 
          border: "1px solid var(--line)",
          maxWidth: "600px",
          width: "100%",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "32px", marginBottom: "16px", color: "var(--text)" }}>Join the Dispatch</h1>
          <p style={{ color: "var(--muted)", fontSize: "18px", lineHeight: "1.6", marginBottom: "32px" }}>
            Get the latest essays, insights, and updates from Chief Osita Chidoka delivered directly to your inbox.
          </p>
          
          <div style={{ display: "flex", justifyContent: "center" }}>
            <NewsletterForm source="Dedicated Subscribe Page" />
          </div>
        </div>
      </div>
    </>
  );
}
