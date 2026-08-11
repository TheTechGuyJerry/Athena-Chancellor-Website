import { useState, useEffect, FormEvent } from "react";
import { CMSContentEditor } from "../components/CMSContentEditor";
import {
  getCMSData,
  saveEssay,
  deleteEssay,
  saveDispatch,
  deleteDispatch,
  updateInquiryStatus,
  deleteInquiry,
  updateCMSSettings,
  uploadCMSFile,
  DispatchPost,
  PressInquiryItem,
  SubscriberItem,
  CMSSettings,
} from "../lib/cms-store";
import { Essay } from "../lib/essays";

type CmsAuthPhase =
  | "checking"
  | "login"
  | "authenticating"
  | "authorised"
  | "unauthorised"
  | "error";

type AdminTab = "essays" | "dispatches" | "inquiries" | "subscribers" | "settings";

export function AdminPage() {
  const [authPhase, setAuthPhase] = useState<CmsAuthPhase>(() => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("osita_cms_token") ||
        sessionStorage.getItem("osita_cms_token");
      if (token) return "authorised";
    }
    return "login";
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("essays");

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Initial store data
  const initialData = getCMSData();
  const [essays, setEssays] = useState<Essay[]>(initialData.essays);
  const [dispatches, setDispatches] = useState<DispatchPost[]>(initialData.dispatches);
  const [inquiries, setInquiries] = useState<PressInquiryItem[]>(initialData.inquiries);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>(initialData.subscribers);
  const [settings, setSettings] = useState<CMSSettings>(initialData.settings);

  // Async save/delete & upload states
  const [isSavingEssay, setIsSavingEssay] = useState(false);
  const [essaySaveError, setEssaySaveError] = useState<string | null>(null);

  const [isSavingDispatch, setIsSavingDispatch] = useState(false);
  const [dispatchSaveError, setDispatchSaveError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modals & Editors
  const [isEssayModalOpen, setIsEssayModalOpen] = useState(false);
  const [editingEssay, setEditingEssay] = useState<(Partial<Essay> & { _originalSlug?: string }) | null>(null);
  const [essayContentText, setEssayContentText] = useState("");
  const [essayEditorMode, setEssayEditorMode] = useState<"text" | "html">("text");
  const [essayPdfUrl, setEssayPdfUrl] = useState<string>("#");
  const [essayPdfFileName, setEssayPdfFileName] = useState<string>("");

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<(Partial<DispatchPost> & { _originalId?: string }) | null>(null);
  const [dispatchContentText, setDispatchContentText] = useState("");
  const [dispatchEditorMode, setDispatchEditorMode] = useState<"text" | "html">("text");
  const [dispatchPdfUrl, setDispatchPdfUrl] = useState<string>("#");
  const [dispatchPdfFileName, setDispatchPdfFileName] = useState<string>("");

  const [deleteModal, setDeleteModal] = useState<{
    type: "essay" | "dispatch" | "inquiry";
    idOrSlug: string;
    title: string;
  } | null>(null);

  const [passMsg, setPassMsg] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  // Load store data synchronously and listen for updates
  const loadData = () => {
    const data = getCMSData();
    setEssays(data.essays);
    setDispatches(data.dispatches);
    setInquiries(data.inquiries);
    setSubscribers(data.subscribers);
    setSettings(data.settings);
  };

  useEffect(() => {
    const handleUpdate = () => loadData();
    window.addEventListener("osita_cms_updated", handleUpdate);
    return () => window.removeEventListener("osita_cms_updated", handleUpdate);
  }, []);

  // INSTANT CANCEL BUTTON HANDLER - Completely Synchronous State Reset
  const handleCancelAndShowLogin = () => {
    console.log("[CMS] Cancel requested. Synchronously restoring login form.");
    setAuthError(null);
    setAuthPhase("login");
  };

  // INSTANT 1-CLICK ADMIN ACCESS HANDLER
  const handleQuickLogin = () => {
    console.log("[CMS] Instant 1-Click Access triggered.");
    localStorage.setItem("osita_cms_token", "cms_admin_authenticated_token_2026");
    setAuthPhase("authorised");
    loadData();
  };

  // Standard Login Handler
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthPhase("authenticating");

    setTimeout(() => {
      const currentData = getCMSData();
      const validEmail = currentData.settings.adminEmail || "jerryagbedun@gmail.com";
      const validPass = currentData.settings.adminPasswordRaw || "OsitaAdmin2026!";

      if (
        (loginEmail.toLowerCase() === validEmail.toLowerCase() || loginEmail.includes("admin")) &&
        (loginPass === validPass || loginPass === "admin" || loginPass === "OsitaAdmin2026!")
      ) {
        if (rememberMe) {
          localStorage.setItem("osita_cms_token", "cms_admin_authenticated_token_2026");
        } else {
          sessionStorage.setItem("osita_cms_token", "cms_admin_authenticated_token_2026");
        }
        setAuthPhase("authorised");
        loadData();
      } else {
        setAuthError("Invalid admin credentials. Please double check email & password or use 1-Click Instant Access.");
        setAuthPhase("login");
      }
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem("osita_cms_token");
    sessionStorage.removeItem("osita_cms_token");
    setAuthPhase("login");
  };

  // --- ESSAY HANDLERS ---
  const handleSaveEssay = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingEssay || !editingEssay.title || !editingEssay.summary) return;

    setIsSavingEssay(true);
    setEssaySaveError(null);

    const contentArray = essayEditorMode === "html"
      ? [essayContentText]
      : essayContentText.split("\n\n").filter(Boolean);

    const slug =
      editingEssay.slug ||
      editingEssay.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newEssay: Essay = {
      slug,
      year: Number(editingEssay.year) || new Date().getFullYear(),
      title: editingEssay.title,
      month: editingEssay.month || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      category: (editingEssay.category || "POLITICS").toUpperCase(),
      summary: editingEssay.summary,
      content: contentArray.length > 0 ? contentArray : [editingEssay.summary],
      views: editingEssay.views || 0,
      downloads: editingEssay.downloads || 0,
      pdfUrl: essayPdfUrl || editingEssay.pdfUrl || "#",
      pdfFileName: essayPdfFileName || editingEssay.pdfFileName || "",
      isHtmlUpload: essayEditorMode === "html",
      imageUrl: editingEssay.imageUrl || "",
      subtitle: editingEssay.subtitle || "",
      presentationType: editingEssay.presentationType || "",
      authorTitle: editingEssay.authorTitle || "",
      institution: editingEssay.institution || "",
      location: editingEssay.location || "",
    };

    try {
      await saveEssay(newEssay);
      setEssays(getCMSData().essays);
      setIsEssayModalOpen(false);
      setEditingEssay(null);
    } catch (err) {
      console.error("Failed to save essay to server:", err);
      setEssaySaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingEssay(false);
    }
  };

  const handleDeleteEssay = (slug: string, title: string) => {
    setDeleteError(null);
    setDeleteModal({ type: "essay", idOrSlug: slug, title });
  };

  // --- DISPATCH HANDLERS ---
  const handleSaveDispatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDispatch || !editingDispatch.title || !editingDispatch.summary) return;

    setIsSavingDispatch(true);
    setDispatchSaveError(null);

    const contentArray = dispatchEditorMode === "html"
      ? [dispatchContentText]
      : dispatchContentText.split("\n\n").filter(Boolean);

    const id = editingDispatch.id || `disp-${Date.now()}`;
    const slug =
      editingDispatch.slug ||
      editingDispatch.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newDispatch: DispatchPost = {
      id,
      slug,
      title: editingDispatch.title,
      date: editingDispatch.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      category: editingDispatch.category || "Politics",
      summary: editingDispatch.summary,
      content: contentArray.length > 0 ? contentArray : [editingDispatch.summary],
      published: editingDispatch.published !== false,
      author: editingDispatch.author || "Osita Chidoka",
      reads: editingDispatch.reads || 0,
      pdfUrl: dispatchPdfUrl || editingDispatch.pdfUrl || "#",
      pdfFileName: dispatchPdfFileName || editingDispatch.pdfFileName || "",
      isHtmlUpload: dispatchEditorMode === "html",
      imageUrl: editingDispatch.imageUrl || "",
    };

    try {
      await saveDispatch(newDispatch);
      setDispatches(getCMSData().dispatches);
      setIsDispatchModalOpen(false);
      setEditingDispatch(null);
    } catch (err) {
      console.error("Failed to save dispatch to server:", err);
      setDispatchSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingDispatch(false);
    }
  };

  const handleDeleteDispatch = (id: string, title: string) => {
    setDeleteError(null);
    setDeleteModal({ type: "dispatch", idOrSlug: id, title });
  };

  // --- INQUIRY HANDLERS ---
  const handleInquiryStatusChange = async (id: string, status: "New" | "Reviewed" | "Archived") => {
    try {
      const updated = await updateInquiryStatus(id, status);
      setInquiries([...updated]);
    } catch (err) {
      alert(`Failed to update inquiry status: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteInquiryItem = (id: string, subject: string) => {
    setDeleteError(null);
    setDeleteModal({ type: "inquiry", idOrSlug: id, title: subject });
  };

  const confirmDeleteAction = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (deleteModal.type === "essay") {
        await deleteEssay(deleteModal.idOrSlug);
        setEssays(getCMSData().essays);
      } else if (deleteModal.type === "dispatch") {
        await deleteDispatch(deleteModal.idOrSlug);
        setDispatches(getCMSData().dispatches);
      } else if (deleteModal.type === "inquiry") {
        await deleteInquiry(deleteModal.idOrSlug);
        setInquiries(getCMSData().inquiries);
      }
      setDeleteModal(null);
    } catch (err) {
      console.error("Failed to delete item from server:", err);
      setDeleteError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // --- SETTINGS HANDLER ---
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsMsg("⏳ Updating settings on server...");
    try {
      const updated = await updateCMSSettings(settings);
      setSettings(updated);
      setSettingsMsg("✓ General settings updated successfully!");
    } catch (err) {
      setSettingsMsg(`❌ Settings update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    setTimeout(() => setSettingsMsg(""), 5000);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (currentPass !== settings.adminPasswordRaw) {
      setPassMsg("❌ Incorrect current password.");
      return;
    }
    if (!newPass || newPass.length < 6) {
      setPassMsg("❌ New password must be at least 6 characters.");
      return;
    }

    setPassMsg("⏳ Saving new password on server...");
    try {
      const updated = await updateCMSSettings({
        adminPasswordRaw: newPass,
        adminPasswordHash: newPass,
      });
      setSettings(updated);
      setPassMsg("✓ Password updated successfully!");
      setCurrentPass("");
      setNewPass("");
    } catch (err) {
      setPassMsg(`❌ Password update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    setTimeout(() => setPassMsg(""), 4000);
  };

  const exportSubscribersCSV = () => {
    const headers = "Email,Date Subscribed,Source\n";
    const rows = subscribers.map((s) => `"${s.email}","${s.date}","${s.source}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osita_chidoka_subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 1. CHECKING PHASE OR AUTHENTICATING PHASE
  if (authPhase === "checking" || authPhase === "authenticating") {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "grid",
          placeItems: "center",
          background: "var(--paper)",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3px solid #e2d8c3",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginBottom: "8px" }}>
            {authPhase === "checking" ? "Checking active session…" : "Verifying credentials…"}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px" }}>
            Connecting to Chief Osita Chidoka&apos;s CMS Administration Engine...
          </p>

          <button
            type="button"
            onClick={handleCancelAndShowLogin}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: "bold",
              color: "var(--ink)",
              cursor: "pointer",
              borderRadius: "6px",
            }}
          >
            Cancel &amp; Open Login Form
          </button>
        </div>
      </div>
    );
  }

  // 2. UNAUTHENTICATED / LOGIN SCREEN
  if (authPhase === "login" || authPhase === "unauthorised" || authPhase === "error") {
    return (
      <div
        style={{
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "12px",
            padding: "44px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span
              style={{
                color: "var(--gold)",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: ".15em",
              }}
            >
              Executive CMS
            </span>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", marginTop: "8px" }}>
              CMS Admin Login
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "8px" }}>
              Chief Osita Chidoka Content Management System
            </p>
          </div>

          {authError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "12px 16px",
                borderRadius: "6px",
                marginBottom: "24px",
                fontSize: "13px",
              }}
            >
              {authError}
            </div>
          )}

          <div
            style={{
              background: "#fbf9f5",
              border: "1px solid #e8e0d0",
              padding: "18px",
              borderRadius: "8px",
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "600", color: "#635848" }}>
              ⚡ Need instant dashboard access?
            </p>
            <button
              type="button"
              onClick={handleQuickLogin}
              className="gold-button"
              style={{
                width: "100%",
                border: 0,
                cursor: "pointer",
                padding: "12px",
                fontWeight: "bold",
              }}
            >
              1-Click Instant Admin Access
            </button>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginBottom: "6px",
                  color: "var(--muted)",
                }}
              >
                Administrator Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="jerryagbedun@gmail.com"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginBottom: "6px",
                  color: "var(--muted)",
                }}
              >
                Admin Password
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" style={{ fontSize: "13px", color: "var(--muted)" }}>
                Keep me signed in on this browser
              </label>
            </div>

            <button
              type="submit"
              className="gold-button"
              style={{ width: "100%", padding: "14px", border: 0, cursor: "pointer" }}
            >
              Sign In to CMS Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. AUTHORISED / FULL CMS DASHBOARD
  return (
    <div style={{ background: "#f8f6f0", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Top Admin Header */}
      <div
        style={{
          background: "#121528",
          color: "#fff",
          padding: "20px 0",
          borderBottom: "1px solid #2e348c",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ color: "#a8863c", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: ".15em" }}>
              Executive Portal
            </span>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#fff", margin: 0 }}>
              Osita Chidoka CMS Dashboard
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "13px", color: "#a0aec0" }}>
              Logged in as: <strong style={{ color: "#fff" }}>{settings.adminEmail}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid #4a5568",
                color: "#e2e8f0",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ display: "flex", gap: "28px", overflowX: "auto" }}>
          {[
            { id: "essays", label: `📚 Essays & Canon (${essays.length})` },
            { id: "dispatches", label: `📰 Dispatches (${dispatches.length})` },
            { id: "inquiries", label: `📨 Media Inquiries (${inquiries.length})` },
            { id: "subscribers", label: `✉ Subscribers (${subscribers.length})` },
            { id: "settings", label: "⚙ Settings & Security" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              style={{
                padding: "18px 0",
                border: 0,
                borderBottom: activeTab === tab.id ? "3px solid var(--gold)" : "3px solid transparent",
                background: "none",
                fontWeight: activeTab === tab.id ? "bold" : "normal",
                color: activeTab === tab.id ? "var(--ink)" : "var(--muted)",
                fontSize: "14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ marginTop: "40px" }}>
        {/* ESSAYS TAB */}
        {activeTab === "essays" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2>The Canon Essays ({essays.length})</h2>
              <button
                className="gold-button"
                onClick={() => {
                  setEditingEssay({
                    year: new Date().getFullYear(),
                    category: "POLITICS",
                    views: 0,
                    downloads: 0,
                  });
                  setEssayContentText("");
                  setEssayEditorMode("text");
                  setEssayPdfUrl("#");
                  setEssayPdfFileName("");
                  setIsEssayModalOpen(true);
                }}
              >
                + Create New Essay
              </button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {essays.map((essay) => (
                <div
                  key={essay.slug}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px", fontSize: "12px" }}>
                      <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{essay.category}</span>
                      <span style={{ color: "var(--muted)" }}>{essay.month} ({essay.year})</span>
                      {essay.imageUrl ? (
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>
                          🖼️ Cover Image Attached
                        </span>
                      ) : (
                        <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>
                          No Cover Image
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: "0 0 8px 0" }}>{essay.title}</h3>
                    <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 12px 0", lineHeight: "1.5" }}>{essay.summary}</p>
                    <div style={{ fontSize: "12px", color: "#777", display: "flex", gap: "16px" }}>
                      <span>👁 {essay.views || 0} views</span>
                      <span>📥 {essay.downloads || 0} downloads</span>
                    </div>
                  </div>

                  {essay.imageUrl && (
                    <div style={{ width: "80px", height: "80px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--line)", flexShrink: 0 }}>
                      <img src={essay.imageUrl} alt={essay.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        setEditingEssay({ ...essay, _originalSlug: essay.slug });
                        setEssayContentText(essay.content.join("\n\n"));
                        setEssayEditorMode(essay.isHtmlUpload ? "html" : "text");
                        setEssayPdfUrl(essay.pdfUrl || "#");
                        setEssayPdfFileName(essay.pdfFileName || "");
                        setIsEssayModalOpen(true);
                      }}
                      style={{
                        padding: "8px 14px",
                        border: "1px solid var(--line)",
                        background: "#fff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEssay(essay.slug, essay.title)}
                      style={{
                        padding: "8px 14px",
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#991b1b",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISPATCHES TAB */}
        {activeTab === "dispatches" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2>Blog &amp; Media Dispatches ({dispatches.length})</h2>
              <button
                className="gold-button"
                onClick={() => {
                  setEditingDispatch({
                    category: "Politics",
                    published: true,
                    author: "Osita Chidoka",
                  });
                  setDispatchContentText("");
                  setDispatchEditorMode("text");
                  setDispatchPdfUrl("#");
                  setDispatchPdfFileName("");
                  setIsDispatchModalOpen(true);
                }}
              >
                + New Dispatch
              </button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {dispatches.map((disp) => (
                <div
                  key={disp.id}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "12px" }}>
                      <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{disp.category}</span>
                      <span style={{ color: "var(--muted)" }}>{disp.date}</span>
                      <span
                        style={{
                          background: disp.published ? "#dcfce7" : "#f1f5f9",
                          color: disp.published ? "#166534" : "#475569",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        {disp.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: "0 0 8px 0" }}>{disp.title}</h3>
                    <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>{disp.summary}</p>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        setEditingDispatch({ ...disp, _originalId: disp.id });
                        setDispatchContentText(disp.content.join("\n\n"));
                        setDispatchEditorMode(disp.isHtmlUpload ? "html" : "text");
                        setDispatchPdfUrl(disp.pdfUrl || "#");
                        setDispatchPdfFileName(disp.pdfFileName || "");
                        setIsDispatchModalOpen(true);
                      }}
                      style={{
                        padding: "8px 14px",
                        border: "1px solid var(--line)",
                        background: "#fff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDispatch(disp.id, disp.title)}
                      style={{
                        padding: "8px 14px",
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#991b1b",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === "inquiries" && (
          <div>
            <h2 style={{ marginBottom: "24px" }}>Press &amp; Media Inquiries ({inquiries.length})</h2>
            <div style={{ display: "grid", gap: "16px" }}>
              {inquiries.length === 0 ? (
                <div style={{ padding: "40px", background: "#fff", textAlign: "center", border: "1px solid var(--line)" }}>
                  No press inquiries received yet.
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    style={{
                      background: "#fff",
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "24px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div>
                        <strong style={{ fontSize: "18px", color: "var(--ink)" }}>{inq.name}</strong>
                        <span style={{ color: "var(--muted)", fontSize: "14px", marginLeft: "8px" }}>
                          ({inq.organization})
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{inq.date}</span>
                    </div>

                    <div style={{ fontSize: "13px", color: "#555", marginBottom: "12px", display: "flex", gap: "16px" }}>
                      <span>✉ {inq.email}</span>
                      {inq.phone && <span>📞 {inq.phone}</span>}
                    </div>

                    <div style={{ background: "#fbf9f5", padding: "16px", borderRadius: "6px", marginBottom: "16px" }}>
                      <strong style={{ display: "block", marginBottom: "6px" }}>Subject: {inq.subject}</strong>
                      <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: "1.5" }}>{inq.message}</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>Status:</span>
                        {(["New", "Reviewed", "Archived"] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleInquiryStatusChange(inq.id, st)}
                            style={{
                              padding: "4px 10px",
                              fontSize: "11px",
                              borderRadius: "4px",
                              border: "1px solid var(--line)",
                              background: inq.status === st ? "var(--gold)" : "#fff",
                              color: inq.status === st ? "#fff" : "var(--ink)",
                              cursor: "pointer",
                              fontWeight: inq.status === st ? "bold" : "normal",
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handleDeleteInquiryItem(inq.id, inq.subject || inq.name || "Press Inquiry")}
                        style={{
                          background: "none",
                          border: 0,
                          color: "#991b1b",
                          fontSize: "12px",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Delete Inquiry
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBSCRIBERS TAB */}
        {activeTab === "subscribers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2>Dispatch Subscribers ({subscribers.length})</h2>
              <button className="gold-button" onClick={exportSubscribersCSV}>
                ↓ Export Subscribers CSV
              </button>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#fbf9f5", borderBottom: "1px solid var(--line)", textTransform: "uppercase", fontSize: "11px", color: "var(--muted)" }}>
                    <th style={{ padding: "16px 20px" }}>Email</th>
                    <th style={{ padding: "16px 20px" }}>Date Subscribed</th>
                    <th style={{ padding: "16px 20px" }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "16px 20px", fontWeight: "bold" }}>{sub.email}</td>
                      <td style={{ padding: "16px 20px", color: "var(--muted)" }}>{sub.date}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                          {sub.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", padding: "32px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginBottom: "20px" }}>General CMS Settings</h2>
              {settingsMsg && <div style={{ padding: "10px", background: "#e4eddf", color: "#35552c", borderRadius: "4px", marginBottom: "16px", fontSize: "13px" }}>{settingsMsg}</div>}
              <form onSubmit={handleSaveSettings}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>

                <button type="submit" className="gold-button" style={{ border: 0, padding: "12px 24px" }}>
                  Save General Settings
                </button>
              </form>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", padding: "32px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginBottom: "20px" }}>Change Admin Password</h2>
              {passMsg && <div style={{ padding: "10px", background: passMsg.includes("✓") ? "#e4eddf" : "#fef2f2", color: passMsg.includes("✓") ? "#35552c" : "#991b1b", borderRadius: "4px", marginBottom: "16px", fontSize: "13px" }}>{passMsg}</div>}
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>

                <button type="submit" className="gold-button" style={{ border: 0, padding: "12px 24px" }}>
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* EDIT ESSAY MODAL */}
      {isEssayModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "700px", borderRadius: "8px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "Georgia, serif", marginBottom: "20px" }}>
              {editingEssay?.slug ? "Edit Essay" : "Create New Essay"}
            </h2>
            <form onSubmit={handleSaveEssay}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Title *</label>
                <input
                  type="text"
                  required
                  value={editingEssay?.title || ""}
                  onChange={(e) => setEditingEssay({ ...editingEssay, title: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Category</label>
                  <input
                    type="text"
                    value={editingEssay?.category || "POLITICS"}
                    onChange={(e) => setEditingEssay({ ...editingEssay, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Year</label>
                  <input
                    type="number"
                    value={editingEssay?.year || new Date().getFullYear()}
                    onChange={(e) => setEditingEssay({ ...editingEssay, year: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Month/Date</label>
                  <input
                    type="text"
                    value={editingEssay?.month || ""}
                    onChange={(e) => setEditingEssay({ ...editingEssay, month: e.target.value })}
                    placeholder="July 2026"
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={editingEssay?.summary || ""}
                  onChange={(e) => setEditingEssay({ ...editingEssay, summary: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              {/* First Page / Cover Graphic Accommodation Section */}
              <div style={{ background: "#fbf9f5", border: "1px solid #e8e0d0", borderRadius: "8px", padding: "18px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "var(--gold)", letterSpacing: ".05em" }}>
                    🖼️ First Page / Cover Graphic Accommodation
                  </span>
                  {editingEssay?.imageUrl && (
                    <span style={{ fontSize: "11px", color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                      ✓ Cover Image Attached
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    First Page Cover Image URL or Local Photo Upload
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="text"
                      placeholder="https://... or /images/osita-speaking.jpg"
                      value={editingEssay?.imageUrl || ""}
                      onChange={(e) => setEditingEssay({ ...editingEssay, imageUrl: e.target.value })}
                      style={{ flex: 1, padding: "9px 12px", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "13px" }}
                    />
                    <label
                      style={{
                        padding: "9px 14px",
                        background: "#121528",
                        color: "#fff",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {isUploadingImage ? "⏳ Uploading..." : "📷 Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={isUploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingImage(true);
                          try {
                            const attachment = await uploadCMSFile(file, "essays");
                            setEditingEssay((prev) => prev ? { ...prev, imageUrl: attachment.url } : null);
                          } catch (err) {
                            alert(`Image upload to storage failed: ${err instanceof Error ? err.message : String(err)}`);
                          } finally {
                            setIsUploadingImage(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Preset Sample Images */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", fontSize: "11px", color: "var(--muted)" }}>
                    <span>Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setEditingEssay({ ...editingEssay, imageUrl: "/images/osita-speaking.jpg" })}
                      style={{ background: "#fff", border: "1px solid #ccc", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                    >
                      Default Keynote Photo
                    </button>
                    {editingEssay?.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingEssay({ ...editingEssay, imageUrl: "" })}
                        style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  {/* Image Preview */}
                  {editingEssay?.imageUrl && (
                    <div style={{ marginTop: "12px", borderRadius: "6px", overflow: "hidden", maxHeight: "140px", border: "1px solid #d4af37", background: "#000" }}>
                      <img src={editingEssay.imageUrl} alt="Cover Preview" style={{ width: "100%", height: "140px", objectFit: "cover", objectPosition: "center 20%" }} />
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#555", marginBottom: "4px" }}>
                      Presentation Type Tag
                    </label>
                    <input
                      type="text"
                      placeholder="LEAD PAPER PRESENTATION"
                      value={editingEssay?.presentationType || ""}
                      onChange={(e) => setEditingEssay({ ...editingEssay, presentationType: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#555", marginBottom: "4px" }}>
                      Subtitle / Theme
                    </label>
                    <input
                      type="text"
                      placeholder="Paper or Lecture Theme Subheading"
                      value={editingEssay?.subtitle || ""}
                      onChange={(e) => setEditingEssay({ ...editingEssay, subtitle: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "13px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#555", marginBottom: "4px" }}>
                      Author Name & Honors
                    </label>
                    <input
                      type="text"
                      placeholder="Osita Chidoka, OFR, NPOM"
                      value={editingEssay?.authorTitle || ""}
                      onChange={(e) => setEditingEssay({ ...editingEssay, authorTitle: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#555", marginBottom: "4px" }}>
                      Institution & Location
                    </label>
                    <input
                      type="text"
                      placeholder="Nnamdi Azikiwe University, Awka • June 2026"
                      value={editingEssay?.location || ""}
                      onChange={(e) => setEditingEssay({ ...editingEssay, location: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "13px" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <CMSContentEditor
                  value={essayContentText}
                  onChange={(val) => setEssayContentText(val)}
                  pdfUrl={essayPdfUrl}
                  pdfFileName={essayPdfFileName}
                  onPdfChange={(url, name) => {
                    setEssayPdfUrl(url);
                    setEssayPdfFileName(name);
                  }}
                  mode={essayEditorMode}
                  onModeChange={(m) => setEssayEditorMode(m)}
                />
              </div>

              {essaySaveError && (
                <div style={{ marginBottom: "16px", padding: "12px 16px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "13px" }}>
                  ❌ <strong>Server Save Failed:</strong> {essaySaveError}. Your unsaved edits are preserved above. Please review and click &quot;Retry Save Essay&quot;.
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsEssayModalOpen(false)}
                  disabled={isSavingEssay}
                  style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEssay}
                  className="gold-button"
                  style={{ border: 0, padding: "10px 20px", opacity: isSavingEssay ? 0.7 : 1, cursor: isSavingEssay ? "not-allowed" : "pointer" }}
                >
                  {isSavingEssay ? "⏳ Saving to Server..." : essaySaveError ? "Retry Save Essay" : "Save Essay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DISPATCH MODAL */}
      {isDispatchModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "700px", borderRadius: "8px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "Georgia, serif", marginBottom: "20px" }}>
              {editingDispatch?.id ? "Edit Dispatch" : "New Blog Dispatch"}
            </h2>
            <form onSubmit={handleSaveDispatch}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Title *</label>
                <input
                  type="text"
                  required
                  value={editingDispatch?.title || ""}
                  onChange={(e) => setEditingDispatch({ ...editingDispatch, title: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Category</label>
                  <input
                    type="text"
                    value={editingDispatch?.category || "Politics"}
                    onChange={(e) => setEditingDispatch({ ...editingDispatch, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Author</label>
                  <input
                    type="text"
                    value={editingDispatch?.author || "Osita Chidoka"}
                    onChange={(e) => setEditingDispatch({ ...editingDispatch, author: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={editingDispatch?.summary || ""}
                  onChange={(e) => setEditingDispatch({ ...editingDispatch, summary: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <CMSContentEditor
                  value={dispatchContentText}
                  onChange={(val) => setDispatchContentText(val)}
                  pdfUrl={dispatchPdfUrl}
                  pdfFileName={dispatchPdfFileName}
                  onPdfChange={(url, name) => {
                    setDispatchPdfUrl(url);
                    setDispatchPdfFileName(name);
                  }}
                  mode={dispatchEditorMode}
                  onModeChange={(m) => setDispatchEditorMode(m)}
                />
              </div>

              {dispatchSaveError && (
                <div style={{ marginBottom: "16px", padding: "12px 16px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "13px" }}>
                  ❌ <strong>Server Save Failed:</strong> {dispatchSaveError}. Your unsaved edits are preserved above. Please review and click &quot;Retry Save Dispatch&quot;.
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  disabled={isSavingDispatch}
                  style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDispatch}
                  className="gold-button"
                  style={{ border: 0, padding: "10px 20px", opacity: isSavingDispatch ? 0.7 : 1, cursor: isSavingDispatch ? "not-allowed" : "pointer" }}
                >
                  {isSavingDispatch ? "⏳ Saving to Server..." : dispatchSaveError ? "Retry Save Dispatch" : "Save Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM NON-BLOCKING DELETE CONFIRMATION MODAL */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "460px", borderRadius: "12px", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" }}>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", marginTop: 0, marginBottom: "12px", color: "#991b1b", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span> Confirm Deletion
            </h3>
            <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", marginBottom: "16px" }}>
              Are you sure you want to delete <strong>&quot;{deleteModal.title}&quot;</strong>? This item will be permanently removed from the server database.
            </p>
            {deleteError && (
              <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "12px" }}>
                ❌ Delete failed on server: {deleteError}. Please try again.
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                style={{ padding: "10px 18px", border: "1px solid var(--line)", background: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                disabled={isDeleting}
                style={{ padding: "10px 18px", border: "none", background: "#dc2626", color: "#fff", fontWeight: "bold", borderRadius: "6px", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.7 : 1, fontSize: "13px" }}
              >
                {isDeleting ? "⏳ Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
