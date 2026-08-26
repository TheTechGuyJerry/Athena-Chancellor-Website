const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
  const crypto = require("crypto");
  const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Osita Chidoka <newsletter@updates.ositachidoka.com>";
  const SITE_URL = process.env.SITE_URL || "https://ositachidoka.com";

  const sendSubscriptionEmail = async (email, token) => {
    const confirmationUrl = \`\${SITE_URL}/subscribe/continue?token=\${token}\`;

    return resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Confirm Your Subscription",
      html: \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #0f172a; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center; }
            .brand { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #a8863c; font-weight: 700; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 24px; font-family: Georgia, serif; }
            .text { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
            .btn { display: inline-block; background-color: #a8863c; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: 32px; }
            .btn-text { color: #ffffff; text-decoration: none; }
            .fallback { font-size: 14px; color: #64748b; margin-bottom: 12px; }
            .fallback-link { font-size: 14px; color: #3b82f6; word-break: break-all; margin-bottom: 40px; display: block; }
            .footer-line { border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px; }
            .footer-text { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0; }
            .footer-brand { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">OSITA CHIDOKA</div>
            <h1 class="title">Confirm Your Subscription</h1>
            <p class="text">Thank you for subscribing to updates from Osita Chidoka.<br><br>Please confirm your email address and continue the subscription process by clicking the button below. This link will expire in 24 hours.</p>
            <a href="\${confirmationUrl}" class="btn" style="color: #ffffff;"><span class="btn-text">Confirm Email &amp; Continue</span></a>
            <p class="fallback">If the button does not work, copy and paste the link below into your browser:</p>
            <a href="\${confirmationUrl}" class="fallback-link">\${confirmationUrl}</a>
            <hr class="footer-line" />
            <p class="footer-text">If you did not request this subscription, you can safely ignore this email.</p>
            <div class="footer-brand">Osita Chidoka<br>ositachidoka.com</div>
          </div>
        </body>
        </html>
      \`
    });
  };

  app.post("/api/subscribe/start", rateLimitMiddleware, async (req, res) => {
    try {
      const { email, source } = req.body;
      if (!email || typeof email !== 'string') return res.status(400).json({ error: "Invalid email" });
      
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes("@")) {
          return res.status(400).json({ error: "Invalid email" });
      }
      
      const q = query(collection(db, "subscribers"), where("email", "==", normalizedEmail));
      const snap = await getDocs(q);
      
      let subId = "";
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      if (!snap.empty) {
         const docSnap = snap.docs[0];
         const data = docSnap.data();
         if (data.status === "subscribed") {
             return res.json({ status: "already_subscribed" });
         }
         subId = docSnap.id;
         await updateDoc(doc(db, "subscribers", subId), {
           source: source || data.source || "Website",
           confirmationToken: token,
           confirmationTokenExpiresAt: tokenExpiry,
           emailConfirmed: false,
           updatedAt: serverTimestamp()
         });
      } else {
         subId = \`sub-\${Date.now()}\`;
         const newSub = {
            id: subId,
            email: normalizedEmail,
            date: new Date().toISOString().split("T")[0],
            source: source || "Website",
            status: "pending",
            confirmationToken: token,
            confirmationTokenExpiresAt: tokenExpiry,
            emailConfirmed: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
         };
         await setDoc(doc(db, "subscribers", subId), newSub);
      }
      
      const emailResp = await sendSubscriptionEmail(normalizedEmail, token);
      if (emailResp.error) {
        throw new Error(emailResp.error.message);
      }
      
      res.json({ status: "pending", email: normalizedEmail });
    } catch (err) {
      console.error("[Subscribe Start Error]", err);
      res.status(500).json({ error: "We couldn't send the email. Please try again." });
    }
  });

  app.post("/api/subscribe/resend", rateLimitMiddleware, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Invalid email" });
      const normalizedEmail = email.trim().toLowerCase();
      
      const q = query(collection(db, "subscribers"), where("email", "==", normalizedEmail));
      const snap = await getDocs(q);
      if (snap.empty) return res.status(404).json({ error: "Subscriber not found" });
      
      const docSnap = snap.docs[0];
      if (docSnap.data().status === "subscribed") {
        return res.json({ status: "already_subscribed" });
      }
      
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await updateDoc(doc(db, "subscribers", docSnap.id), {
        confirmationToken: token,
        confirmationTokenExpiresAt: tokenExpiry,
        emailConfirmed: false,
        updatedAt: serverTimestamp()
      });
      
      const emailResp = await sendSubscriptionEmail(normalizedEmail, token);
      if (emailResp.error) {
        throw new Error(emailResp.error.message);
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("[Subscribe Resend Error]", err);
      res.status(500).json({ error: "We couldn't send the email. Please try again." });
    }
  });

  app.post("/api/subscribe/validate", rateLimitMiddleware, async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: "Missing token" });

      const q = query(collection(db, "subscribers"), where("confirmationToken", "==", token));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        return res.status(400).json({ error: "Invalid or already used token." });
      }

      const docSnap = snap.docs[0];
      const data = docSnap.data();

      // Check expiry
      if (new Date(data.confirmationTokenExpiresAt).getTime() < Date.now()) {
        return res.status(400).json({ error: "Token expired." });
      }

      // Mark as confirmed and invalidate token so it can't be reused to reach this point again
      await updateDoc(doc(db, "subscribers", docSnap.id), {
        emailConfirmed: true,
        confirmationToken: "", // Invalidate
        updatedAt: serverTimestamp()
      });

      res.json({ success: true, email: data.email });
    } catch (err) {
      console.error("[Subscribe Validate Error]", err);
      res.status(500).json({ error: "Validation failed." });
    }
  });

  app.post("/api/subscribe/complete", rateLimitMiddleware, async (req, res) => {
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

      if (!data.emailConfirmed) {
         return res.status(403).json({ error: "Email not confirmed." });
      }
      
      await updateDoc(doc(db, "subscribers", docSnap.id), {
        stateOfResidence,
        organisation,
        status: "subscribed",
        subscribedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Add to Resend Contacts
      try {
        await resend.contacts.create({
          email: normalizedEmail,
          unsubscribed: false,
          audienceId: process.env.RESEND_AUDIENCE_ID || ""
        });
      } catch (e) {
        console.error("Failed to add to Resend contacts", e);
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("[Subscribe Complete Error]", err);
      res.status(500).json({ error: "We couldn't complete your subscription. Please try again." });
    }
  });
`;

code = code.replace(/const resend = new Resend.*\}\);/s, replacement.trim());

fs.writeFileSync('server.ts', code);
