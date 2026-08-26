const fs = require('fs');
let code = fs.readFileSync('src/components/NewsletterForm.tsx', 'utf8');

const t1 = `<div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                  <button
                    onClick={() => { setMessage(null); setStep("complete_profile"); }}
                    style={{ padding: "12px", background: "#a8863c", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", width: "100%" }}
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    style={{ padding: "12px", background: "transparent", color: "#a8863c", border: "1px solid #a8863c", borderRadius: "4px", fontWeight: "bold", cursor: (resendCooldown > 0 || loading) ? "not-allowed" : "pointer", width: "100%" }}
                  >
                    {resendCooldown > 0 ? \`Resend Email (\${resendCooldown}s)\` : (loading ? "Sending..." : "Resend Email")}
                  </button>
                </div>
              </div>
            )}
            
            {step === "complete_profile" && (
              <form onSubmit={handleCompleteProfile}>`;

const r1 = `<div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    style={{ padding: "12px", background: "#a8863c", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: (resendCooldown > 0 || loading) ? "not-allowed" : "pointer", width: "100%" }}
                  >
                    {resendCooldown > 0 ? \`Resend Email (\${resendCooldown}s)\` : (loading ? "Sending..." : "Resend Email")}
                  </button>
                </div>
              </div>
            )}
            
            {step === "complete_profile" && (
              <form onSubmit={handleCompleteProfile}>`;

code = code.replace(t1, r1);

// Now remove complete_profile and success blocks.

const s1 = code.indexOf(`{step === "complete_profile" && (`);
const s2 = code.indexOf(`)}
          </div>
        </div>
      )}
    </>
  );
}`);

code = code.substring(0, s1) + `)}
          </div>
        </div>
      )}
    </>
  );
}`;


fs.writeFileSync('src/components/NewsletterForm.tsx', code);
