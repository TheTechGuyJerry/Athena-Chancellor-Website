const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const resendImports = `
import { Resend } from "resend";
import { collection, getDocs, setDoc, doc, query, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./src/lib/firebase";
`;

serverCode = serverCode.replace('import { db } from "./src/lib/firebase";', '');
serverCode = serverCode.replace('import { collection, getDocs } from "firebase/firestore";', resendImports);

const resendRoutes = `
  // Newsletter Subscribe Routes
  const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Chancellor Updates <newsletter@updates.ositachidoka.com>";

  const sendSubscriptionEmail = async (email) => {
    return resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Complete Your Subscription",
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">CHANCELLOR</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Complete Your Subscription</h2>
            <p>Thank you for subscribing to updates from Osita Chidoka.</p>
            <p>We have received your email address.</p>
            <p><strong>Please return to the Chancellor website to complete your subscription</strong> by providing your State of Residence and Organisation.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">If you did not request this subscription, you may ignore this email.</p>
          </div>
        </div>
      \`
    });
  };

  app.post("/api/subscribe/start", async (req, res) => {
    try {
      const { email, source } = req.body;
      if (!email || typeof email !== 'string') return res.status(400).json({ error: "Invalid email" });
      
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes("@")) {
          return res.status(400).json({ error: "Invalid email" });
      }
      
      // check if subscriber exists
      const q = query(collection(db, "subscribers"), where("email", "==", normalizedEmail));
      const snap = await getDocs(q);
      
      let subId = "";
      
      if (!snap.empty) {
         const docSnap = snap.docs[0];
         const data = docSnap.data();
         if (data.status === "subscribed") {
             return res.json({ status: "already_subscribed" });
         }
         subId = docSnap.id;
         // update source
         await updateDoc(doc(db, "subscribers", subId), {
           source: source || data.source || "Website",
           updatedAt: new Date().toISOString()
         });
      } else {
         subId = \`sub-\${Date.now()}\`;
         const newSub = {
            id: subId,
            email: normalizedEmail,
            date: new Date().toISOString().split("T")[0],
            source: source || "Website",
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
         };
         await setDoc(doc(db, "subscribers", subId), newSub);
      }
      
      const emailResp = await sendSubscriptionEmail(normalizedEmail);
      if (emailResp.error) {
        throw new Error(emailResp.error.message);
      }
      
      res.json({ status: "pending", email: normalizedEmail });
    } catch (err) {
      console.error("[Subscribe Start Error]", err);
      res.status(500).json({ error: "We couldn't send the email. Please try again." });
    }
  });

  app.post("/api/subscribe/resend", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Invalid email" });
      const normalizedEmail = email.trim().toLowerCase();
      
      const emailResp = await sendSubscriptionEmail(normalizedEmail);
      if (emailResp.error) {
        throw new Error(emailResp.error.message);
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("[Subscribe Resend Error]", err);
      res.status(500).json({ error: "We couldn't send the email. Please try again." });
    }
  });

  app.post("/api/subscribe/complete", async (req, res) => {
    try {
      const { email, stateOfResidence, organisation } = req.body;
      if (!email) return res.status(400).json({ error: "Invalid email" });
      if (!stateOfResidence) return res.status(400).json({ error: "Please select your State of Residence." });
      if (!organisation) return res.status(400).json({ error: "Please enter your Organisation." });
      
      const normalizedEmail = email.trim().toLowerCase();
      
      const q = query(collection(db, "subscribers"), where("email", "==", normalizedEmail));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        return res.status(404).json({ error: "Subscriber not found. Please start again." });
      }
      
      const docSnap = snap.docs[0];
      const data = docSnap.data();
      
      if (data.status === "subscribed") {
         return res.json({ status: "already_subscribed" });
      }
      
      await updateDoc(doc(db, "subscribers", docSnap.id), {
        stateOfResidence,
        organisation,
        status: "subscribed",
        subscribedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Add to Resend Contacts
      try {
        await resend.contacts.create({
          email: normalizedEmail,
          unsubscribed: false,
          audienceId: process.env.RESEND_AUDIENCE_ID || "" // Ideally configurable if needed, but Resend creates contacts in the default audience if missing
        });
      } catch (e) {
        console.error("Failed to add to Resend contacts, but subscription completed locally", e);
        // Ignore so we don't fail the user if Resend contact fails (maybe it already exists)
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("[Subscribe Complete Error]", err);
      res.status(500).json({ error: "We couldn't complete your subscription. Please try again." });
    }
  });
`;

serverCode = serverCode.replace('  // Vite middleware setup', resendRoutes + '\n  // Vite middleware setup');

fs.writeFileSync('server.ts', serverCode);
