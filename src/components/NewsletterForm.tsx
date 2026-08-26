import React, { useState, FormEvent, useEffect } from "react";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory (FCT)"
];

export function NewsletterForm({ source = "Website" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"initial" | "check_email" | "complete_profile" | "success">("initial");
  
  const [stateOfResidence, setStateOfResidence] = useState("");
  const [organisation, setOrganisation] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscribe/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, source })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start subscription.");
      
      if (data.status === "already_subscribed") {
        setMessage({ text: "This email is already subscribed to updates.", type: "success" });
      } else {
        setStep("check_email");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "We couldn't complete your subscription. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscribe/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend email.");
      
      setMessage({ text: "Email resent successfully.", type: "success" });
      setResendCooldown(60);
    } catch (err: any) {
      setMessage({ text: err.message || "We couldn't send the email. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile(e: FormEvent) {
    e.preventDefault();
    if (!stateOfResidence) {
      setMessage({ text: "Please select your State of Residence.", type: "error" });
      return;
    }
    if (!organisation.trim()) {
      setMessage({ text: "Please enter your Organisation.", type: "error" });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscribe/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          stateOfResidence,
          organisation: organisation.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete subscription.");
      
      if (data.status === "already_subscribed") {
        setMessage({ text: "This email is already subscribed to updates.", type: "success" });
      } else {
        setStep("success");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "We couldn't complete your subscription. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const closeModal = () => {
    setStep("initial");
    setMessage(null);
    setEmail("");
    setStateOfResidence("");
    setOrganisation("");
  };

  return (
    <>
      <form onSubmit={handleStart} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "400px" }}>
        {step === "initial" && message && (
          <div style={{ color: message.type === "success" ? "#4caf50" : "#f44336", fontSize: "14px", fontWeight: "bold" }}>
            {message.text}
          </div>
        )}
        <input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", border: "1px solid #d8d0c3", borderRadius: "4px", outline: "none", color: "#334155" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            background: "#a8863c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Submitting..." : "Subscribe"}
        </button>
      </form>

      {/* Modal Overlay */}
      {step !== "initial" && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99999, padding: "20px"
        }}>
          <div style={{
            background: "#fff", padding: "32px", borderRadius: "8px", maxWidth: "450px", width: "100%",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)", position: "relative"
          }}>
            <button 
              onClick={closeModal}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}
              title="Close"
            >
              &times;
            </button>
            
            <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#a8863c", marginBottom: "8px", fontWeight: "bold" }}>
              CHANCELLOR
            </div>
            
            {step === "check_email" && (
              <div>
                <h2 style={{ fontSize: "24px", marginTop: 0, marginBottom: "16px", color: "#0f172a", fontWeight: "bold" }}>Check Your Email</h2>
                <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "16px", fontSize: "15px" }}>
                  We have sent you an email to continue your subscription. Please check your Inbox. If you cannot find the email, check your Spam or Junk folder.
                </p>
                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "6px", marginBottom: "24px", wordBreak: "break-all", color: "#0f172a", fontWeight: "500", border: "1px solid #e2e8f0" }}>
                  Sent to: {email}
                </div>
                
                {message && (
                  <div style={{ color: message.type === "success" ? "#4caf50" : "#f44336", fontSize: "14px", fontWeight: "bold", marginBottom: "16px" }}>
                    {message.text}
                  </div>
                )}
                
                <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    style={{ padding: "12px", background: "#a8863c", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: (resendCooldown > 0 || loading) ? "not-allowed" : "pointer", width: "100%" }}
                  >
                    {resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : (loading ? "Sending..." : "Resend Email")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}