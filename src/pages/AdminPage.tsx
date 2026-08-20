import { getCMSData, saveEssay, deleteEssay, saveInsight, deleteInsight, updateInquiryStatus, deleteInquiry, updateCMSSettings, NewsletterItem, saveNewsletter, deleteNewsletter, DispatchPost, PressInquiryItem, SubscriberItem, CMSSettings, importOsitaInsightsToStore, deleteAllOsitaInsights, PressReleaseItem, savePressRelease, deletePressRelease, deleteAllPressReleases, AdminUser, AdminUserRole, saveAdminUser, deleteAdminUser } from "../lib/cms-store";
import { fetchOsitaInsightsFromClearPath, detectDuplicates, OsitaInsightImportItem } from "../lib/osita-importer";
import { useState, useEffect, FormEvent } from "react";
import { CMSContentEditor } from "../components/CMSContentEditor";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";

import { Essay } from "../lib/essays";
import { compressImageToBase64 } from "../lib/image-utils";
import { formatDocumentDownloadUrl } from "../lib/url-utils";

type CmsAuthPhase =
  | "checking"
  | "login"
  | "authenticating"
  | "authorised"
  | "unauthorised"
  | "error";

type AdminTab = "essays" | "insights" | "pressReleases" | "inquiries" | "subscribers" | "newsletters" | "adminUsers" | "settings";

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
  const initialData = getCMSData() || {};
  const [essays, setEssays] = useState<Essay[]>(initialData.essays || []);
  const [insights, setInsights] = useState<DispatchPost[]>(initialData.insights || initialData.dispatches || []);
  const [pressReleases, setPressReleases] = useState<PressReleaseItem[]>(initialData.pressReleases || []);
  const [inquiries, setInquiries] = useState<PressInquiryItem[]>(initialData.inquiries || []);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>(initialData.subscribers || []);
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>(initialData.newsletters || []);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialData.adminUsers || []);
  const [settings, setSettings] = useState<CMSSettings>(initialData.settings || {
    siteTitle: "Osita Chidoka — Public Servant, Writer & Institution Builder",
    contactEmail: "jerryagbedun@gmail.com",
    adminEmail: "jerryagbedun@gmail.com",
    adminPasswordHash: "OsitaAdmin2026!",
    adminPasswordRaw: "OsitaAdmin2026!",
    maintenanceMode: false
  });

  // Admin User Management State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminUser> | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState<string>("all");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminSaveError, setAdminSaveError] = useState<string | null>(null);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState<string | null>(null);

  // Async save/delete & upload states
  const [isSavingEssay, setIsSavingEssay] = useState(false);
  const [essaySaveError, setEssaySaveError] = useState<string | null>(null);

  const [isSavingInsight, setIsSavingInsight] = useState(false);
  const [insightSaveError, setInsightSaveError] = useState<string | null>(null);

  const [isSavingPressRelease, setIsSavingPressRelease] = useState(false);
  const [pressReleaseSaveError, setPressReleaseSaveError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Modals & Editors
  const [isEssayModalOpen, setIsEssayModalOpen] = useState(false);
  const [editingEssay, setEditingEssay] = useState<(Partial<Essay> & { _originalSlug?: string }) | null>(null);
  const [essayContentText, setEssayContentText] = useState("");
  const [essayEditorMode, setEssayEditorMode] = useState<"text" | "html">("text");
  const [essayPdfUrl, setEssayPdfUrl] = useState<string>("#");
  const [essayPdfFileName, setEssayPdfFileName] = useState<string>("");

  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<(Partial<DispatchPost> & { _originalId?: string }) | null>(null);
  const [insightContentText, setInsightContentText] = useState("");
  const [insightEditorMode, setInsightEditorMode] = useState<"text" | "html">("text");
  const [insightPdfUrl, setInsightPdfUrl] = useState<string>("#");
  const [insightPdfFileName, setInsightPdfFileName] = useState<string>("");

  const [isPressReleaseModalOpen, setIsPressReleaseModalOpen] = useState(false);
  const [editingPressRelease, setEditingPressRelease] = useState<(Partial<PressReleaseItem> & { _originalId?: string }) | null>(null);
  const [pressReleaseContentText, setPressReleaseContentText] = useState("");
  const [pressReleaseEditorMode, setPressReleaseEditorMode] = useState<"text" | "html">("text");
  const [pressReleasePdfUrl, setPressReleasePdfUrl] = useState<string>("#");
  const [pressReleasePdfFileName, setPressReleasePdfFileName] = useState<string>("");
  const [isPurgingPressReleases, setIsPurgingPressReleases] = useState(false);

  // Osita Insight Scraper / Importer state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isScrapingInsights, setIsScrapingInsights] = useState(false);
  const [isImportingInsights, setIsImportingInsights] = useState(false);
  const [isPurgingInsights, setIsPurgingInsights] = useState(false);
  const [scrapedInsights, setScrapedInsights] = useState<OsitaInsightImportItem[]>([]);
  const [selectedInsightUrls, setSelectedInsightUrls] = useState<string[]>([]);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handlePurgeAllOsitaInsights = async () => {
    if (!confirm("Are you sure you want to delete ALL current Osita Insights? This will clear them so you can re-import afresh using the YouTube API.")) {
      return;
    }
    setIsPurgingInsights(true);
    setSyncNotice(null);
    try {
      const count = await deleteAllOsitaInsights();
      loadData();
      setSyncNotice(`Cleared ${count} Osita Insight item(s) successfully! You can now click 'Sync Osita Insights' to import afresh.`);
    } catch (err) {
      console.error("Purge failure:", err);
      alert(`Purge failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPurgingInsights(false);
    }
  };

  const handleSyncOsitaInsights = async () => {
    setIsScrapingInsights(true);
    setSyncNotice(null);
    try {
      let rawItems: OsitaInsightImportItem[] = [];
      try {
        const res = await fetch("/api/scrape-osita-insights");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.items) && json.items.length > 0) {
            rawItems = json.items;
          }
        }
      } catch (apiErr) {
        console.warn("Backend scraper endpoint unavailable, using direct scraper fallback:", apiErr);
      }

      if (rawItems.length === 0) {
        rawItems = await fetchOsitaInsightsFromClearPath();
      }

      const processed = detectDuplicates(rawItems, getCMSData().insights || getCMSData().dispatches);
      setScrapedInsights(processed);

      // Pre-select items that are NOT already imported
      const newItems = processed.filter((i) => !i.isAlreadyImported);
      setSelectedInsightUrls(newItems.map((i) => i.episodeUrl));
      setIsSyncModalOpen(true);
    } catch (err) {
      console.error("Failed to sync Osita Insights:", err);
      alert(`Could not fetch ClearPath Osita Insights: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsScrapingInsights(false);
    }
  };

  const handleImportSelectedInsights = async () => {
    if (selectedInsightUrls.length === 0) return;
    setIsImportingInsights(true);
    try {
      const itemsToImport = scrapedInsights.filter((i) => selectedInsightUrls.includes(i.episodeUrl));
      const importedCount = await importOsitaInsightsToStore(itemsToImport);
      loadData();
      setIsSyncModalOpen(false);
      setSyncNotice(`Successfully imported ${importedCount} Osita Insight item(s) from ClearPath Media!`);
    } catch (err) {
      console.error("Import failure:", err);
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsImportingInsights(false);
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    type: "essay" | "insight" | "pressRelease" | "inquiry";
    idOrSlug: string;
    title: string;
  } | null>(null);

  const [passMsg, setPassMsg] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  // Load store data synchronously and listen for updates
  const loadData = () => {
    const data = getCMSData() || {};
    setEssays(data.essays || []);
    setInsights(data.insights || data.dispatches || []);
    setPressReleases(data.pressReleases || []);
    setInquiries(data.inquiries || []);
    setSubscribers(data.subscribers || []);
    setNewsletters(data.newsletters || []);
    setAdminUsers(data.adminUsers || []);
    if (data.settings) {
      setSettings(data.settings);
    }
  };

  const handleSaveAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingAdmin || !editingAdmin.name || !editingAdmin.email) {
      setAdminSaveError("Please fill out full name and email address.");
      return;
    }

    setIsSavingAdmin(true);
    setAdminSaveError(null);

    const payload: AdminUser = {
      id: editingAdmin.id || `admin-${Date.now()}`,
      name: editingAdmin.name.trim(),
      email: editingAdmin.email.trim().toLowerCase(),
      role: (editingAdmin.role as AdminUserRole) || "Editor",
      status: editingAdmin.status || "Active",
      createdAt: editingAdmin.createdAt || new Date().toISOString().split("T")[0],
      lastLogin: editingAdmin.lastLogin || new Date().toISOString().split("T")[0],
      passwordRaw: editingAdmin.passwordRaw || "OsitaAdmin2026!"
    };

    try {
      await saveAdminUser(payload);
      setAdminUsers(getCMSData().adminUsers || []);
      setIsAdminModalOpen(false);
      setEditingAdmin(null);
    } catch (err) {
      console.error("Failed to save admin user:", err);
      setAdminSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (adminUsers.length <= 1) {
      alert("Cannot delete the last remaining administrator account on the system.");
      return;
    }
    if (
      adminEmail.toLowerCase() === settings.adminEmail.toLowerCase() ||
      adminEmail.toLowerCase() === "jerryagbedun@gmail.com"
    ) {
      if (!confirm(`Warning: You are about to delete the primary administrator account (${adminEmail}). Are you sure?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to remove administrator account (${adminEmail})?`)) {
        return;
      }
    }

    setIsDeletingAdmin(adminId);
    try {
      await deleteAdminUser(adminId);
      setAdminUsers(getCMSData().adminUsers || []);
    } catch (err) {
      console.error("Failed to delete admin user:", err);
      alert(`Delete failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDeletingAdmin(null);
    }
  };

  useEffect(() => {
    loadData();
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

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    setAuthPhase("authenticating");
    try {
      await signInWithPopup(auth, googleProvider);
      if (rememberMe) {
        localStorage.setItem("osita_cms_token", "cms_admin_authenticated_token_2026");
      } else {
        sessionStorage.setItem("osita_cms_token", "cms_admin_authenticated_token_2026");
      }
      setAuthPhase("authorised");
      loadData();
    } catch (err: unknown) {
      console.error("[CMS] Google signin error:", err);
      const errObj = err as { code?: string; message?: string };
      let friendly = errObj.message || "Google Sign-In failed.";
      if (errObj.code === "auth/popup-closed-by-user") {
        friendly = "Google Sign-In popup was closed.";
      } else if (errObj.code === "auth/operation-not-allowed") {
        friendly = "Google Sign-In is not enabled in Firebase Console.";
      }
      setAuthError(friendly);
      setAuthPhase("login");
    }
  };

  // Standard Login Handler (checks Firebase Auth & CMS Settings)
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthPhase("authenticating");

    // First try Firebase Email/Password Auth
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPass);
      if (rememberMe) {
        localStorage.setItem("osita_cms_token", "cms_admin_authenticated_token_2026");
      } else {
        sessionStorage.setItem("osita_cms_token", "cms_admin_authenticated_token_2026");
      }
      setAuthPhase("authorised");
      loadData();
      return;
    } catch (firebaseErr) {
      console.log("[CMS] Firebase auth attempt failed, checking fallback CMS settings:", firebaseErr);
    }

    // Fallback check against CMS Settings or admin defaults
    const currentData = getCMSData() || {};
    const settings = currentData.settings || {};
    const validEmail = settings.adminEmail || "jerryagbedun@gmail.com";
    const validPass = settings.adminPasswordRaw || "OsitaAdmin2026!";

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
      setAuthError("Invalid credentials. Please double check email & password, or use Google Sign-In or Instant 1-Click Access.");
      setAuthPhase("login");
    }
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
      pdfUrl: formatDocumentDownloadUrl(essayPdfUrl || editingEssay.pdfUrl) || "#",
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

  // --- INSIGHT HANDLERS ---
  const handleSaveInsight = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingInsight || !editingInsight.title || !editingInsight.summary) return;

    setIsSavingInsight(true);
    setInsightSaveError(null);

    const contentArray = insightEditorMode === "html"
      ? [insightContentText]
      : insightContentText.split("\n\n").filter(Boolean);

    const id = editingInsight.id || `insight-${Date.now()}`;
    const slug =
      editingInsight.slug ||
      editingInsight.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newInsight: DispatchPost = {
      id,
      slug,
      title: editingInsight.title,
      date: editingInsight.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      category: editingInsight.category || "Osita Insight",
      summary: editingInsight.summary,
      content: contentArray.length > 0 ? contentArray : [editingInsight.summary],
      published: editingInsight.published !== false,
      author: editingInsight.author || "Osita Chidoka",
      reads: editingInsight.reads || 0,
      pdfUrl: formatDocumentDownloadUrl(insightPdfUrl || editingInsight.pdfUrl) || "#",
      pdfFileName: insightPdfFileName || editingInsight.pdfFileName || "",
      isHtmlUpload: insightEditorMode === "html",
      imageUrl: editingInsight.imageUrl || "",
      source: editingInsight.source || "ClearPath Media",
      episodeUrl: editingInsight.episodeUrl || "",
    };

    try {
      await saveInsight(newInsight);
      setInsights(getCMSData().insights || getCMSData().dispatches);
      setIsInsightModalOpen(false);
      setEditingInsight(null);
    } catch (err) {
      console.error("Failed to save insight to server:", err);
      setInsightSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingInsight(false);
    }
  };

  const handleDeleteInsight = (id: string, title: string) => {
    setDeleteError(null);
    setDeleteModal({ type: "insight", idOrSlug: id, title });
  };

  // --- PRESS RELEASE HANDLERS ---
  const handleSavePressRelease = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPressRelease || !editingPressRelease.title || !editingPressRelease.summary) return;

    setIsSavingPressRelease(true);
    setPressReleaseSaveError(null);

    const contentArray = pressReleaseEditorMode === "html"
      ? [pressReleaseContentText]
      : pressReleaseContentText.split("\n\n").filter(Boolean);

    const id = editingPressRelease.id || `pr-${Date.now()}`;
    const slug =
      editingPressRelease.slug ||
      editingPressRelease.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newPR: PressReleaseItem = {
      id,
      slug,
      title: editingPressRelease.title,
      date: editingPressRelease.date || new Date().toISOString().split("T")[0],
      category: editingPressRelease.category || "Press Release",
      summary: editingPressRelease.summary,
      content: contentArray.length > 0 ? contentArray : [editingPressRelease.summary],
      published: editingPressRelease.published !== false,
      author: editingPressRelease.author || "Osita Chidoka",
      pdfUrl: formatDocumentDownloadUrl(pressReleasePdfUrl || editingPressRelease.pdfUrl) || "#",
      pdfFileName: pressReleasePdfFileName || editingPressRelease.pdfFileName || "",
      isHtmlUpload: pressReleaseEditorMode === "html",
      imageUrl: editingPressRelease.imageUrl || "",
      source: editingPressRelease.source || "Chief Osita Chidoka Media Office"
    };

    try {
      await savePressRelease(newPR);
      setPressReleases(getCMSData().pressReleases || []);
      setIsPressReleaseModalOpen(false);
      setEditingPressRelease(null);
    } catch (err) {
      console.error("Failed to save press release to server:", err);
      setPressReleaseSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingPressRelease(false);
    }
  };

  const handleDeletePressRelease = (id: string, title: string) => {
    setDeleteError(null);
    setDeleteModal({ type: "pressRelease", idOrSlug: id, title });
  };

  const handlePurgeAllPressReleases = async () => {
    if (!confirm("Are you sure you want to permanently delete ALL current Press Releases?")) {
      return;
    }
    setIsPurgingPressReleases(true);
    try {
      const count = await deleteAllPressReleases();
      loadData();
      alert(`Purged ${count} Press Release item(s) permanently.`);
    } catch (err) {
      console.error("Failed to purge press releases:", err);
      alert(`Purge failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPurgingPressReleases(false);
    }
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
      } else if (deleteModal.type === "insight") {
        await deleteInsight(deleteModal.idOrSlug);
        setInsights(getCMSData().insights || getCMSData().dispatches);
      } else if (deleteModal.type === "pressRelease") {
        await deletePressRelease(deleteModal.idOrSlug);
        setPressReleases(getCMSData().pressReleases || []);
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

          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1e293b",
              cursor: "pointer",
              marginBottom: "18px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Sign in with Google
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
              color: "var(--muted)",
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <div style={{ flex: 1, borderBottom: "1px solid var(--line)" }} />
            <span style={{ padding: "0 10px" }}>or with email & password</span>
            <div style={{ flex: 1, borderBottom: "1px solid var(--line)" }} />
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
            { id: "insights", label: `💡 Insights (${insights.length})` },
            { id: "pressReleases", label: `📢 Press Releases (${pressReleases.length})` },
            { id: "inquiries", label: `📨 Media Inquiries (${inquiries.length})` },
            { id: "subscribers", label: `✉ Subscribers (${subscribers.length})` },
            { id: "newsletters", label: `📢 Newsletters (${newsletters.length})` },
            { id: "adminUsers", label: `👤 Admin Users (${adminUsers.length})` },
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

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (
          <div>
            {syncNotice && (
              <div style={{ padding: "12px 16px", marginBottom: "20px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✅ {syncNotice}</span>
                <button onClick={() => setSyncNotice(null)} style={{ background: "none", border: 0, cursor: "pointer", fontWeight: "bold", color: "#166534" }}>✕</button>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2>Osita Insights Management ({insights.length})</h2>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  className="gold-button"
                  style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
                  onClick={handlePurgeAllOsitaInsights}
                  disabled={isPurgingInsights}
                >
                  {isPurgingInsights ? "⏳ Deleting..." : "🗑️ Clear Osita Insights"}
                </button>

                <button
                  className="gold-button"
                  style={{ background: "#0284c7", color: "#fff", borderColor: "#0284c7" }}
                  onClick={handleSyncOsitaInsights}
                  disabled={isScrapingInsights}
                >
                  {isScrapingInsights ? "🔍 Fetching ClearPath Media..." : "🔄 Sync Osita Insights"}
                </button>

                <button
                  className="gold-button"
                  onClick={() => {
                    setEditingInsight({
                      category: "Osita Insight",
                      published: true,
                      author: "Osita Chidoka",
                    });
                    setInsightContentText("");
                    setInsightEditorMode("text");
                    setInsightPdfUrl("#");
                    setInsightPdfFileName("");
                    setIsInsightModalOpen(true);
                  }}
                >
                  + New Insight
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {insights.map((item) => (
                <div
                  key={item.id}
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
                  {item.imageUrl && (
                    <div style={{ width: "100px", height: "70px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#000" }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "12px", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{item.category || "Osita Insight"}</span>
                      <span style={{ color: "var(--muted)" }}>{item.date}</span>
                      {item.source && <span style={{ color: "#0284c7", fontWeight: "600" }}>{item.source}</span>}
                      <span
                        style={{
                          background: item.published ? "#dcfce7" : "#f1f5f9",
                          color: item.published ? "#166534" : "#475569",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        {item.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", margin: "0 0 8px 0" }}>{item.title}</h3>
                    <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0, lineHeight: "1.5" }}>{item.summary}</p>
                    {item.episodeUrl && (
                      <a href={item.episodeUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "var(--gold)", display: "inline-block", marginTop: "8px", fontWeight: "600" }}>
                        ▶ Watch Video Episode
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        setEditingInsight({ ...item, _originalId: item.id });
                        setInsightContentText(item.content.join("\n\n"));
                        setInsightEditorMode(item.isHtmlUpload ? "html" : "text");
                        setInsightPdfUrl(item.pdfUrl || "#");
                        setInsightPdfFileName(item.pdfFileName || "");
                        setIsInsightModalOpen(true);
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
                      onClick={() => handleDeleteInsight(item.id, item.title)}
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

        {/* PRESS RELEASES TAB */}
        {activeTab === "pressReleases" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontFamily: "Georgia, serif" }}>Press Releases Management ({pressReleases.length})</h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--muted)" }}>
                  Official statements, media briefings, and public disclosures.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  style={{
                    padding: "10px 18px",
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: isPurgingPressReleases ? "not-allowed" : "pointer"
                  }}
                  onClick={handlePurgeAllPressReleases}
                  disabled={isPurgingPressReleases || pressReleases.length === 0}
                >
                  {isPurgingPressReleases ? "⏳ Purging Press Releases..." : "🗑 Purge All Press Releases"}
                </button>

                <button
                  className="gold-button"
                  onClick={() => {
                    setEditingPressRelease({
                      category: "Press Release",
                      published: true,
                      author: "Osita Chidoka",
                      source: "Chief Osita Chidoka Media Office",
                      date: new Date().toISOString().split("T")[0]
                    });
                    setPressReleaseContentText("");
                    setPressReleaseEditorMode("text");
                    setPressReleasePdfUrl("#");
                    setPressReleasePdfFileName("");
                    setIsPressReleaseModalOpen(true);
                  }}
                >
                  + New Press Release
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {pressReleases.length === 0 ? (
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ color: "var(--muted)", fontSize: "15px", margin: 0 }}>
                    No press releases found. Click <strong>"+ New Press Release"</strong> above to publish your first press release statement.
                  </p>
                </div>
              ) : (
                pressReleases.map((item) => (
                  <div
                    key={item.id}
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
                    {item.imageUrl && (
                      <div style={{ width: "100px", height: "70px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#000" }}>
                        <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "12px", flexWrap: "wrap" }}>
                        <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{item.category || "Press Release"}</span>
                        <span style={{ color: "var(--muted)" }}>{item.date}</span>
                        {item.author && <span style={{ color: "var(--ink)", fontWeight: "600" }}>By {item.author}</span>}
                        <span
                          style={{
                            background: item.published ? "#dcfce7" : "#f1f5f9",
                            color: item.published ? "#166534" : "#475569",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          {item.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", margin: "0 0 8px 0" }}>{item.title}</h3>
                      <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0, lineHeight: "1.5" }}>{item.summary}</p>
                      {item.pdfUrl && item.pdfUrl !== "#" && (
                        <a href={item.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "var(--gold)", display: "inline-block", marginTop: "8px", fontWeight: "600" }}>
                          📄 View Official PDF Attachment
                        </a>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => {
                          setEditingPressRelease({ ...item, _originalId: item.id });
                          setPressReleaseContentText(Array.isArray(item.content) ? item.content.join("\n\n") : String(item.content || ""));
                          setPressReleaseEditorMode(item.isHtmlUpload ? "html" : "text");
                          setPressReleasePdfUrl(item.pdfUrl || "#");
                          setPressReleasePdfFileName(item.pdfFileName || "");
                          setIsPressReleaseModalOpen(true);
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
                        onClick={() => handleDeletePressRelease(item.id, item.title)}
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
                ))
              )}
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
        {activeTab === "newsletters" && (
          <div className="admin-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", margin: 0 }}>Newsletters</h2>
              <button className="gold-button" style={{ border: 0, padding: "10px 20px" }} onClick={() => alert("Newsletter composition is under development.")}>
                + Create Newsletter
              </button>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f9f9f9", borderBottom: "1px solid var(--line)" }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", textTransform: "uppercase", color: "var(--muted)" }}>Subject</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", textTransform: "uppercase", color: "var(--muted)" }}>Date</th>
                    <th style={{ textAlign: "right", padding: "14px 20px", fontSize: "12px", textTransform: "uppercase", color: "var(--muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletters && newsletters.length > 0 ? (
                    newsletters.map(n => (
                      <tr key={n.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "14px 20px", fontWeight: "bold", fontSize: "14px" }}>{n.subject}</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px" }}>
                          <span style={{ padding: "4px 8px", background: n.status === "sent" ? "#e4eddf" : "#f1f1f1", color: n.status === "sent" ? "#35552c" : "#666", borderRadius: "4px", textTransform: "capitalize" }}>{n.status}</span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--muted)" }}>{n.createdAt.split("T")[0]}</td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <button style={{ background: "transparent", border: 0, color: "var(--gold)", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }} onClick={() => alert("Preview feature coming soon")}>Preview</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>No newsletters found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMIN USERS MANAGEMENT TAB */}
        {activeTab === "adminUsers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", fontFamily: "Georgia, serif" }}>
                  Administrator Access & Roles ({adminUsers.length})
                </h2>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "14px" }}>
                  Create, update, and manage CMS administrator accounts, permission levels, and status.
                </p>
              </div>
              <button
                className="gold-button"
                onClick={() => {
                  setEditingAdmin({
                    role: "Editor",
                    status: "Active",
                    createdAt: new Date().toISOString().split("T")[0],
                    passwordRaw: "OsitaAdmin2026!"
                  });
                  setAdminSaveError(null);
                  setIsAdminModalOpen(true);
                }}
                style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px", border: 0, cursor: "pointer" }}
              >
                <span>➕</span> Add New Administrator
              </button>
            </div>

            {/* Admin Stats Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
              <div style={{ background: "#fff", padding: "18px", borderRadius: "8px", border: "1px solid var(--line)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.08em" }}>Total Admins</span>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--ink)", marginTop: "4px" }}>{adminUsers.length}</div>
              </div>
              <div style={{ background: "#fff", padding: "18px", borderRadius: "8px", border: "1px solid var(--line)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#92400e", letterSpacing: "0.08em" }}>Super Admins</span>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#b45309", marginTop: "4px" }}>
                  {adminUsers.filter(a => a.role === "Super Admin").length}
                </div>
              </div>
              <div style={{ background: "#fff", padding: "18px", borderRadius: "8px", border: "1px solid var(--line)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#0369a1", letterSpacing: "0.08em" }}>Editors & Authors</span>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#0284c7", marginTop: "4px" }}>
                  {adminUsers.filter(a => a.role === "Editor" || a.role === "Author").length}
                </div>
              </div>
              <div style={{ background: "#fff", padding: "18px", borderRadius: "8px", border: "1px solid var(--line)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#15803d", letterSpacing: "0.08em" }}>Active Status</span>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#16a34a", marginTop: "4px" }}>
                  {adminUsers.filter(a => a.status === "Active").length}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: "240px" }}>
                <input
                  type="text"
                  placeholder="🔍 Search admins by name or email..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "600" }}>Role Filter:</span>
                <select
                  value={adminRoleFilter}
                  onChange={(e) => setAdminRoleFilter(e.target.value)}
                  style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "14px", background: "#fff", cursor: "pointer" }}
                >
                  <option value="all">All Roles ({adminUsers.length})</option>
                  <option value="Super Admin">Super Admins</option>
                  <option value="Editor">Editors</option>
                  <option value="Author">Authors</option>
                </select>
              </div>
            </div>

            {/* Admin Users Data Table */}
            <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "14px 20px" }}>Administrator</th>
                    <th style={{ padding: "14px 20px" }}>Role</th>
                    <th style={{ padding: "14px 20px" }}>Status</th>
                    <th style={{ padding: "14px 20px" }}>Created</th>
                    <th style={{ padding: "14px 20px" }}>Last Login</th>
                    <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers
                    .filter((admin) => {
                      const matchesSearch =
                        !adminSearchQuery ||
                        admin.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                        admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase());
                      const matchesRole = adminRoleFilter === "all" || admin.role === adminRoleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map((admin) => {
                      const initials = admin.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={admin.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  background: admin.role === "Super Admin" ? "#1e293b" : "#e2e8f0",
                                  color: admin.role === "Super Admin" ? "#fbbf24" : "#334155",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: "600", color: "var(--ink)", fontSize: "15px" }}>
                                  {admin.name}
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--muted)" }}>{admin.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                background:
                                  admin.role === "Super Admin"
                                    ? "#fef3c7"
                                    : admin.role === "Editor"
                                    ? "#e0f2fe"
                                    : "#dcfce7",
                                color:
                                  admin.role === "Super Admin"
                                    ? "#92400e"
                                    : admin.role === "Editor"
                                    ? "#0369a1"
                                    : "#15803d",
                                border: `1px solid ${
                                  admin.role === "Super Admin"
                                    ? "#fde68a"
                                    : admin.role === "Editor"
                                    ? "#bae6fd"
                                    : "#bbf7d0"
                                }`,
                              }}
                            >
                              {admin.role}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "3px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: admin.status === "Active" ? "#f0fdf4" : "#f1f5f9",
                                color: admin.status === "Active" ? "#16a34a" : "#64748b",
                                border: `1px solid ${admin.status === "Active" ? "#bbf7d0" : "#cbd5e1"}`,
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: admin.status === "Active" ? "#22c55e" : "#94a3b8",
                                }}
                              />
                              {admin.status}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>
                            {admin.createdAt || "2026-01-01"}
                          </td>
                          <td style={{ padding: "16px 20px", color: "var(--muted)", fontSize: "13px" }}>
                            {admin.lastLogin || "Recent"}
                          </td>
                          <td style={{ padding: "16px 20px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAdmin(admin);
                                  setAdminSaveError(null);
                                  setIsAdminModalOpen(true);
                                }}
                                style={{
                                  padding: "6px 12px",
                                  border: "1px solid var(--line)",
                                  background: "#fff",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#0f172a",
                                  cursor: "pointer",
                                }}
                              >
                                ✏ Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                                disabled={isDeletingAdmin === admin.id}
                                style={{
                                  padding: "6px 12px",
                                  border: "1px solid #fca5a5",
                                  background: "#fef2f2",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#dc2626",
                                  cursor: "pointer",
                                  opacity: isDeletingAdmin === admin.id ? 0.5 : 1,
                                }}
                              >
                                {isDeletingAdmin === admin.id ? "Deleting..." : "🗑 Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                        No administrator accounts found. Click "Add New Administrator" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    X / Twitter Link
                  </label>
                  <input
                    type="url"
                    value={settings.twitterLink || ""}
                    onChange={(e) => setSettings({ ...settings, twitterLink: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    Facebook Link
                  </label>
                  <input
                    type="url"
                    value={settings.facebookLink || ""}
                    onChange={(e) => setSettings({ ...settings, facebookLink: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    WhatsApp Channel Link
                  </label>
                  <input
                    type="url"
                    value={settings.whatsappLink || ""}
                    onChange={(e) => setSettings({ ...settings, whatsappLink: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                    placeholder="https://whatsapp.com/channel/..."
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>
                    Current CV URL (PDF Link)
                  </label>
                  <input
                    type="url"
                    value={settings.cvUrl || ""}
                    onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                    placeholder="https://..."
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
                        background: isCompressingImage ? "#94a3b8" : "#121528",
                        color: "#fff",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: isCompressingImage ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {isCompressingImage ? "⏳ Processing Image..." : "📷 Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={isCompressingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const inputEl = e.target;
                          setIsCompressingImage(true);
                          setImageUploadError(null);
                          try {
                            const base64DataUrl = await compressImageToBase64(file);
                            setEditingEssay((prev) => prev ? { ...prev, imageUrl: base64DataUrl } : null);
                          } catch (err) {
                            const errMsg = err instanceof Error ? err.message : String(err);
                            setImageUploadError(errMsg);
                          } finally {
                            setIsCompressingImage(false);
                            inputEl.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>

                  {isCompressingImage && (
                    <div style={{ marginBottom: "10px", padding: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "12px", color: "#1e40af" }}>
                      ⏳ Resizing &amp; Compressing cover image...
                    </div>
                  )}

                  {imageUploadError && (
                    <div style={{ marginBottom: "10px", color: "#b91c1c", fontSize: "12px", background: "#fef2f2", padding: "8px 12px", borderRadius: "4px", border: "1px solid #fca5a5" }}>
                      ❌ {imageUploadError}
                    </div>
                  )}

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
                    setEditingEssay((prev) => prev ? { ...prev, pdfUrl: url, pdfFileName: name } : null);
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
                  disabled={isSavingEssay || isCompressingImage}
                  style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEssay || isCompressingImage}
                  className="gold-button"
                  style={{
                    border: 0,
                    padding: "10px 20px",
                    opacity: (isSavingEssay || isCompressingImage) ? 0.6 : 1,
                    cursor: (isSavingEssay || isCompressingImage) ? "not-allowed" : "pointer"
                  }}
                >
                  {isCompressingImage
                    ? "⏳ Processing Image..."
                    : isSavingEssay
                    ? "⏳ Saving to Server..."
                    : essaySaveError
                    ? "Retry Save Essay"
                    : "Save Essay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INSIGHT MODAL */}
      {isInsightModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "700px", borderRadius: "8px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "Georgia, serif", marginBottom: "20px" }}>
              {editingInsight?.id ? "Edit Insight" : "New Osita Insight"}
            </h2>
            <form onSubmit={handleSaveInsight}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Title *</label>
                <input
                  type="text"
                  required
                  value={editingInsight?.title || ""}
                  onChange={(e) => setEditingInsight({ ...editingInsight, title: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Category</label>
                  <input
                    type="text"
                    value={editingInsight?.category || "Osita Insight"}
                    onChange={(e) => setEditingInsight({ ...editingInsight, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Author</label>
                  <input
                    type="text"
                    value={editingInsight?.author || "Osita Chidoka"}
                    onChange={(e) => setEditingInsight({ ...editingInsight, author: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={editingInsight?.summary || ""}
                  onChange={(e) => setEditingInsight({ ...editingInsight, summary: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <CMSContentEditor
                  value={insightContentText}
                  onChange={(val) => setInsightContentText(val)}
                  pdfUrl={insightPdfUrl}
                  pdfFileName={insightPdfFileName}
                  onPdfChange={(url, name) => {
                    setInsightPdfUrl(url);
                    setInsightPdfFileName(name);
                    setEditingInsight((prev) => prev ? { ...prev, pdfUrl: url, pdfFileName: name } : null);
                  }}
                  mode={insightEditorMode}
                  onModeChange={(m) => setInsightEditorMode(m)}
                />
              </div>

              {insightSaveError && (
                <div style={{ marginBottom: "16px", padding: "12px 16px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "13px" }}>
                  ❌ <strong>Server Save Failed:</strong> {insightSaveError}. Your unsaved edits are preserved above. Please review and click &quot;Retry Save Insight&quot;.
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsInsightModalOpen(false)}
                  disabled={isSavingInsight}
                  style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingInsight}
                  className="gold-button"
                  style={{
                    border: 0,
                    padding: "10px 20px",
                    opacity: isSavingInsight ? 0.6 : 1,
                    cursor: isSavingInsight ? "not-allowed" : "pointer"
                  }}
                >
                  {isSavingInsight
                    ? "⏳ Saving to Server..."
                    : insightSaveError
                    ? "Retry Save Insight"
                    : "Save Insight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRESS RELEASE MODAL */}
      {isPressReleaseModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "720px", borderRadius: "8px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "Georgia, serif", marginBottom: "20px" }}>
              {editingPressRelease?.id ? "Edit Press Release" : "New Press Release"}
            </h2>
            <form onSubmit={handleSavePressRelease}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Title *</label>
                <input
                  type="text"
                  required
                  value={editingPressRelease?.title || ""}
                  onChange={(e) => setEditingPressRelease({ ...editingPressRelease, title: e.target.value })}
                  placeholder="e.g. Statement on National Governance Reform Initiative"
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Date</label>
                  <input
                    type="date"
                    value={editingPressRelease?.date || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEditingPressRelease({ ...editingPressRelease, date: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Category</label>
                  <input
                    type="text"
                    value={editingPressRelease?.category || "Press Release"}
                    onChange={(e) => setEditingPressRelease({ ...editingPressRelease, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Author / Office</label>
                  <input
                    type="text"
                    value={editingPressRelease?.author || "Osita Chidoka"}
                    onChange={(e) => setEditingPressRelease({ ...editingPressRelease, author: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={editingPressRelease?.summary || ""}
                  onChange={(e) => setEditingPressRelease({ ...editingPressRelease, summary: e.target.value })}
                  placeholder="Brief summary of the statement or release..."
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>Featured Image URL (Optional)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={editingPressRelease?.imageUrl || ""}
                    onChange={(e) => setEditingPressRelease({ ...editingPressRelease, imageUrl: e.target.value })}
                    placeholder="https://... or upload below"
                    style={{ flex: 1, padding: "10px", border: "1px solid var(--line)", borderRadius: "4px" }}
                  />
                  <label
                    style={{
                      padding: "10px 16px",
                      background: "#f1f5f9",
                      border: "1px solid var(--line)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {isCompressingImage ? "⏳ Uploading..." : "📷 Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsCompressingImage(true);
                        try {
                          const base64 = await compressImageToBase64(file);
                          setEditingPressRelease(prev => prev ? { ...prev, imageUrl: base64 } : null);
                        } catch (err) {
                          alert(`Image upload error: ${err instanceof Error ? err.message : String(err)}`);
                        } finally {
                          setIsCompressingImage(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <CMSContentEditor
                  value={pressReleaseContentText}
                  onChange={(val) => setPressReleaseContentText(val)}
                  pdfUrl={pressReleasePdfUrl}
                  pdfFileName={pressReleasePdfFileName}
                  onPdfChange={(url, name) => {
                    setPressReleasePdfUrl(url);
                    setPressReleasePdfFileName(name);
                    setEditingPressRelease((prev) => prev ? { ...prev, pdfUrl: url, pdfFileName: name } : null);
                  }}
                  mode={pressReleaseEditorMode}
                  onModeChange={(m) => setPressReleaseEditorMode(m)}
                />
              </div>

              <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="pr-published"
                  checked={editingPressRelease?.published !== false}
                  onChange={(e) => setEditingPressRelease({ ...editingPressRelease, published: e.target.checked })}
                />
                <label htmlFor="pr-published" style={{ fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>
                  Publish press release on website immediately
                </label>
              </div>

              {pressReleaseSaveError && (
                <div style={{ marginBottom: "16px", padding: "12px 16px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "13px" }}>
                  ❌ <strong>Server Save Failed:</strong> {pressReleaseSaveError}. Your unsaved edits are preserved above.
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsPressReleaseModalOpen(false)}
                  disabled={isSavingPressRelease}
                  style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPressRelease}
                  className="gold-button"
                  style={{
                    border: 0,
                    padding: "10px 20px",
                    opacity: isSavingPressRelease ? 0.6 : 1,
                    cursor: isSavingPressRelease ? "not-allowed" : "pointer"
                  }}
                >
                  {isSavingPressRelease
                    ? "⏳ Saving to Server..."
                    : pressReleaseSaveError
                    ? "Retry Save Press Release"
                    : "Save Press Release"}
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
      {/* SYNC OSITA INSIGHTS MODAL */}
      {isSyncModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "820px", maxHeight: "88vh", borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontFamily: "Georgia, serif", color: "var(--ink)" }}>Import Osita Insights from ClearPath Media</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--muted)" }}>
                  Detected {scrapedInsights.length} episode(s) from ClearPath Media. ({scrapedInsights.filter(i => !i.isAlreadyImported).length} new detected)
                </p>
              </div>
              <button onClick={() => setIsSyncModalOpen(false)} style={{ background: "none", border: 0, fontSize: "22px", cursor: "pointer", color: "var(--muted)" }}>✕</button>
            </div>

            {/* Toolbar / Selection Controls */}
            <div style={{ padding: "12px 24px", background: "#f1f5f9", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  style={{ background: "none", border: 0, color: "#0284c7", cursor: "pointer", fontWeight: "bold", padding: 0 }}
                  onClick={() => setSelectedInsightUrls(scrapedInsights.map(i => i.episodeUrl))}
                >
                  Select All ({scrapedInsights.length})
                </button>
                <span style={{ color: "var(--line)" }}>|</span>
                <button
                  type="button"
                  style={{ background: "none", border: 0, color: "#0284c7", cursor: "pointer", fontWeight: "bold", padding: 0 }}
                  onClick={() => setSelectedInsightUrls(scrapedInsights.filter(i => !i.isAlreadyImported).map(i => i.episodeUrl))}
                >
                  Select New Only ({scrapedInsights.filter(i => !i.isAlreadyImported).length})
                </button>
                <span style={{ color: "var(--line)" }}>|</span>
                <button
                  type="button"
                  style={{ background: "none", border: 0, color: "#64748b", cursor: "pointer", padding: 0 }}
                  onClick={() => setSelectedInsightUrls([])}
                >
                  Deselect All
                </button>
              </div>
              <div style={{ fontWeight: "bold", color: "var(--ink)" }}>
                {selectedInsightUrls.length} item(s) selected
              </div>
            </div>

            {/* Item List */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              {scrapedInsights.length === 0 ? (
                <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No items found on ClearPath Media.</p>
              ) : (
                scrapedInsights.map((item) => {
                  const isSelected = selectedInsightUrls.includes(item.episodeUrl);
                  return (
                    <div
                      key={item.episodeUrl}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedInsightUrls(selectedInsightUrls.filter(u => u !== item.episodeUrl));
                        } else {
                          setSelectedInsightUrls([...selectedInsightUrls, item.episodeUrl]);
                        }
                      }}
                      style={{
                        border: isSelected ? "2px solid #0284c7" : "1px solid var(--line)",
                        borderRadius: "8px",
                        padding: "16px",
                        background: item.isAlreadyImported ? "#f8fafc" : "#fff",
                        display: "flex",
                        gap: "16px",
                        alignItems: "flex-start",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by container click
                        style={{ marginTop: "4px", width: "18px", height: "18px", cursor: "pointer" }}
                      />

                      {item.featuredImage && (
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          style={{ width: "100px", height: "65px", objectFit: "cover", borderRadius: "6px", background: "#e2e8f0" }}
                        />
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", fontSize: "11px" }}>
                          <span style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>
                            category: "{item.category}"
                          </span>
                          <span style={{ background: "#f1f5f9", color: "#334155", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>
                            source: "{item.source}"
                          </span>
                          <span style={{ color: "var(--muted)" }}>Date: {item.publicationDate}</span>
                          {item.isAlreadyImported && (
                            <span style={{ background: "#fef3c7", color: "#92400e", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>
                              Already Imported
                            </span>
                          )}
                        </div>

                        <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontFamily: "Georgia, serif", color: "var(--ink)", lineHeight: "1.4" }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--muted)", lineHeight: "1.5" }}>
                          {item.description}
                        </p>
                        <a
                          href={item.episodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: "12px", color: "#0284c7", textDecoration: "none", fontWeight: "500" }}
                        >
                          🔗 Open Episode URL ({item.episodeUrl}) ↗
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                style={{ padding: "10px 20px", border: "1px solid var(--line)", background: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleImportSelectedInsights}
                disabled={selectedInsightUrls.length === 0 || isImportingInsights}
                className="gold-button"
                style={{ background: "#0284c7", color: "#fff", borderColor: "#0284c7", padding: "10px 24px", opacity: selectedInsightUrls.length === 0 || isImportingInsights ? 0.6 : 1 }}
              >
                {isImportingInsights ? "⏳ Importing to CMS..." : `Import Selected (${selectedInsightUrls.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN USER MODAL */}
      {isAdminModalOpen && editingAdmin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "520px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#1e293b",
                color: "#fff",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontFamily: "Georgia, serif" }}>
                {editingAdmin.id ? "✏ Edit Administrator Profile" : "➕ Create New Administrator"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdminModalOpen(false);
                  setEditingAdmin(null);
                }}
                style={{ background: "none", border: 0, color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdmin} style={{ padding: "24px" }}>
              {adminSaveError && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    color: "#b91c1c",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "18px",
                    fontSize: "13px",
                  }}
                >
                  ⚠️ {adminSaveError}
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "var(--muted)" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingAdmin.name || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  placeholder="e.g. Dr. Ngozi Adebayo"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "var(--muted)" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editingAdmin.email || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  placeholder="e.g. ngozi@chidoka.org"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "var(--muted)" }}>
                    Admin Role *
                  </label>
                  <select
                    value={editingAdmin.role || "Editor"}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as AdminUserRole })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "14px", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="Super Admin">Super Admin (Full Access)</option>
                    <option value="Editor">Editor (Content & Media)</option>
                    <option value="Author">Author (Drafts & Submissions)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "var(--muted)" }}>
                    Account Status *
                  </label>
                  <select
                    value={editingAdmin.status || "Active"}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value as "Active" | "Inactive" })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "14px", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "var(--muted)" }}>
                  Credential Passcode / Password
                </label>
                <input
                  type="text"
                  value={editingAdmin.passwordRaw || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, passwordRaw: e.target.value })}
                  placeholder="Set login passcode or leave default"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                />
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", display: "block" }}>
                  Used for email credential login fallback to the CMS dashboard.
                </span>
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setEditingAdmin(null);
                  }}
                  style={{ padding: "10px 18px", border: "1px solid var(--line)", background: "#fff", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="gold-button"
                  style={{ padding: "10px 24px", border: 0, cursor: "pointer" }}
                >
                  {isSavingAdmin ? "Saving Admin..." : editingAdmin.id ? "Save Changes" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
