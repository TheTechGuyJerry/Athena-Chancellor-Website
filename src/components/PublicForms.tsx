import React, { FormEvent, useState } from "react";
import { addCMSInquiry } from "../lib/cms-store";

const states = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function JoinForm({ mentorship = false }: { mentorship?: boolean }) {
  const [done, setDone] = useState(false);

  function go(e: FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return (
      <div className="form-success">
        <h3>Submission Received</h3>
        <p>Thank you for submitting your details. Our administrative office will review your entry promptly.</p>
      </div>
    );
  }

  return (
    <form className="public-form" onSubmit={go}>
      <div className="form-grid">
        <Field label="Full name *">
          <input required />
        </Field>
        <Field label="Email *">
          <input type="email" required />
        </Field>
        <Field label="Phone *">
          <input required />
        </Field>
        <Field label="State of residence *">
          <select required defaultValue="">
            <option value="" disabled>Select state</option>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {mentorship && (
          <Field label="Age *">
            <input type="number" required />
          </Field>
        )}
        <Field label="Profession *">
          <input required />
        </Field>
        <Field label="Educational status">
          <select>
            <option>Select</option>
            <option>Secondary</option>
            <option>ND/NCE</option>
            <option>HND/Bachelor</option>
            <option>Masters</option>
            <option>PhD</option>
            <option>Other</option>
          </select>
        </Field>
        {mentorship && (
          <Field label="Leadership interest">
            <select>
              <option>Select</option>
              <option>Business</option>
              <option>Politics</option>
              <option>Public service</option>
              <option>Community leadership</option>
              <option>Multiple areas</option>
            </select>
          </Field>
        )}
      </div>

      <Field label="Why do you want to join this programme? *">
        <textarea rows={5} required />
      </Field>

      {mentorship && (
        <>
          <Field label="What do you hope to achieve? *">
            <textarea rows={5} required />
          </Field>
          <Field label="Previous leadership / mentorship experience">
            <textarea rows={4} />
          </Field>
        </>
      )}

      <button className="form-submit" type="submit">
        Submit application
      </button>
    </form>
  );
}

export function PressForm() {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [spamAnswer, setSpamAnswer] = useState("");

  function go(e: FormEvent) {
    e.preventDefault();
    if (spamAnswer.trim() !== "5") {
      alert("Spam check failed. Please answer the math question correctly.");
      return;
    }
    setSubmitting(true);

    try {
      addCMSInquiry({
        name,
        organization: org,
        email,
        phone,
        subject,
        message,
      });
      setDone(true);
    } catch {
      alert("Error submitting press inquiry");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="form-success">
        <h3>Press Inquiry Received</h3>
        <p>Thank you for reaching out. Your request has been logged into Chief Osita Chidoka&apos;s media dashboard and our team will review it promptly.</p>
      </div>
    );
  }

  return (
    <form className="public-form" onSubmit={go}>
      <div className="form-grid">
        <Field label="Full name *">
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Organisation *">
          <input value={org} onChange={(e) => setOrg(e.target.value)} required />
        </Field>
        <Field label="Email *">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <Field label="Subject *">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </Field>
      <Field label="Message *">
        <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </Field>
      <Field label="Spam Protection: What is 2 + 3? *">
        <input type="text" value={spamAnswer} onChange={(e) => setSpamAnswer(e.target.value)} required />
      </Field>
      <button className="form-submit" type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}
