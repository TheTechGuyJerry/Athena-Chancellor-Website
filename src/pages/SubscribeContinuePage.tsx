import React, { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory (FCT)"
];

export function SubscribeContinuePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"validate" | "complete_profile" | "success" | "error">("validate");
  const [errorMessage, setErrorMessage] = useState("");

  const [stateOfResidence, setStateOfResidence] = useState("");
  const [organisation, setOrganisation] = useState("");

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setErrorMessage("This confirmation link is no longer valid.");
        setStep("error");
        setValidating(false);
        return;
      }

      try {
        const res = await fetch("/api/subscribe/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "This confirmation link is no longer valid.");
        }

        setEmail(data.email);
        setStep("complete_profile");
      } catch (err: any) {
        if (err.message.includes("expired")) {
          setErrorMessage("This confirmation link has expired. Please request a new subscription email.");
        } else {
          setErrorMessage("This confirmation link is no longer valid.");
        }
        setStep("error");
      } finally {
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  async function handleCompleteProfile(e: FormEvent) {
    e.preventDefault();
    if (!stateOfResidence) {
      setErrorMessage("Please select your State of Residence.");
      return;
    }
    if (!organisation.trim()) {
      setErrorMessage("Please enter your Organisation.");
      return;
    }
    
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/subscribe/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          stateOfResidence,
          organisation: organisation.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete subscription.");
      
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "We couldn't complete your subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "60vh", padding: "80px 20px", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc" }}>
      <SEOHead title="Confirm Subscription | Chief Osita Chidoka" />
      
      <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", maxWidth: "480px", width: "100%", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#a8863c", marginBottom: "12px", fontWeight: "bold" }}>
          CHANCELLOR
        </div>

        {validating && step === "validate" && (
          <div>
            <h1 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#0f172a", fontFamily: "Georgia, serif" }}>Validating Link...</h1>
            <p style={{ color: "#475569" }}>Please wait while we confirm your email address.</p>
          </div>
        )}

        {!validating && step === "error" && (
          <div>
            <h1 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#0f172a", fontFamily: "Georgia, serif" }}>Confirmation Link Expired or Invalid</h1>
            <p style={{ color: "#475569", marginBottom: "24px" }}>{errorMessage}</p>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "12px 24px", background: "#a8863c", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", width: "100%" }}
            >
              Return to Website
            </button>
          </div>
        )}

        {!validating && step === "complete_profile" && (
          <form onSubmit={handleCompleteProfile}>
            <h1 style={{ fontSize: "24px", margin: "0 0 8px 0", color: "#0f172a", fontFamily: "Georgia, serif" }}>Complete Your Profile</h1>
            <p style={{ color: "#475569", marginBottom: "24px", fontSize: "15px" }}>Help us understand our audience better.</p>
            
            {errorMessage && (
              <div style={{ color: "#f44336", fontSize: "14px", fontWeight: "bold", marginBottom: "16px", padding: "12px", background: "#fef2f2", borderRadius: "6px" }}>
                {errorMessage}
              </div>
            )}
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px", color: "#334155" }}>State of Residence</label>
              <select 
                value={stateOfResidence}
                onChange={e => setStateOfResidence(e.target.value)}
                required
                style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "#fff", color: "#0f172a", fontSize: "15px", outline: "none" }}
              >
                <option value="" disabled>Select your state</option>
                {NIGERIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px", color: "#334155" }}>Organisation</label>
              <input 
                type="text"
                placeholder="Enter your organisation"
                value={organisation}
                onChange={e => setOrganisation(e.target.value)}
                required
                style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "#fff", color: "#0f172a", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading && !validating}
              style={{
                padding: "14px",
                background: "#a8863c",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                fontSize: "16px"
              }}
            >
              {(loading && !validating) ? "Saving..." : "Complete Subscription"}
            </button>
          </form>
        )}

        {!validating && step === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h1 style={{ fontSize: "28px", margin: "0 0 16px 0", color: "#0f172a", fontFamily: "Georgia, serif" }}>Subscription Complete</h1>
            <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "32px", fontSize: "16px" }}>
              Thank you for subscribing. You will now receive updates from Osita Chidoka.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "14px 32px", background: "#a8863c", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", width: "100%", fontSize: "16px" }}
            >
              Return to Website
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
