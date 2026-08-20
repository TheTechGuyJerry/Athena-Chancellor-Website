import React, { useState, FormEvent } from "react";
import { addCMSSubscriber } from "../lib/cms-store";

export function NewsletterForm({ source = "Website" }: { source?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await addCMSSubscriber(email, name, source);
      setMessage({ text: "Thank you for subscribing!", type: "success" });
      setName("");
      setEmail("");
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to subscribe.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "400px" }}>
      {message && (
        <div style={{ color: message.type === "success" ? "#4caf50" : "#f44336", fontSize: "14px", fontWeight: "bold" }}>
          {message.text}
        </div>
      )}
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ padding: "10px", border: "1px solid #d8d0c3", borderRadius: "4px" }}
      />
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: "10px", border: "1px solid #d8d0c3", borderRadius: "4px" }}
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
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}