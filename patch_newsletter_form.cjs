const fs = require('fs');
let code = fs.readFileSync('src/components/NewsletterForm.tsx', 'utf8');

// Replace everything from `<div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>` to the end of `step === "check_email"`
const replace1TargetStart = `<div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>`;
const replace1TargetEnd = `)}
            
            {step === "complete_profile" && (`;
const regex1 = new RegExp(replace1TargetStart.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&') + '[\\s\\S]*?' + replace1TargetEnd.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&'));

code = code.replace(regex1, `<div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
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
            
            {step === "complete_profile" && (`);

// Remove the `complete_profile` and `success` steps entirely from the modal because they are handled in the new route.
const replace2TargetStart = `{step === "complete_profile" && (`;
const replace2TargetEnd = `)}
          </div>
        </div>
      )}`;
const regex2 = new RegExp(replace2TargetStart.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&') + '[\\s\\S]*?' + replace2TargetEnd.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&'));

code = code.replace(regex2, `)}
          </div>
        </div>
      )}`);


fs.writeFileSync('src/components/NewsletterForm.tsx', code);
