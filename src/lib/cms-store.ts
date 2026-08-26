import { essays as initialEssays, Essay } from "./essays";
import { formatDocumentDownloadUrl, slugify } from "./url-utils";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";

export type AttachmentMetadata = {
  id: string;
  filename: string;
  url: string;
  storagePath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export interface UploadProgressInfo {
  bytesTransferred: number;
  totalBytes: number;
  progressPercent: number;
  state: string;
}

export type DispatchPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string[];
  published: boolean;
  author: string;
  reads?: number;
  pdfUrl?: string;
  pdfFileName?: string;
  isHtmlUpload?: boolean;
  imageUrl?: string;
  source?: string;
  episodeUrl?: string;
  attachments?: AttachmentMetadata[];
};

export type PressReleaseItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string[];
  published: boolean;
  author: string;
  reads?: number;
  pdfUrl?: string;
  pdfFileName?: string;
  isHtmlUpload?: boolean;
  imageUrl?: string;
  source?: string;
  attachments?: AttachmentMetadata[];
};

export type PressInquiryItem = {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "Reviewed" | "Archived";
};

export type NewsletterItem = {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
};

export type SubscriberItem = {
  id: string;
  name?: string;
  email: string;
  date: string;
  source: string;
};

export type AdminUserRole = "Super Admin" | "Editor" | "Author";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: "Active" | "Inactive";
  createdAt: string;
  lastLogin?: string;
  passwordRaw?: string;
  avatarUrl?: string;
};

export type CMSSettings = {
  siteTitle: string;
  contactEmail: string;
  adminEmail: string;
  adminPasswordHash: string;
  adminPasswordRaw: string;
  maintenanceMode: boolean;
  twitterLink?: string;
  facebookLink?: string;
  whatsappLink?: string;
  cvUrl?: string;
};

export type CMSData = {
  essays: Essay[];
  insights: DispatchPost[];
  dispatches: DispatchPost[];
  pressReleases: PressReleaseItem[];
  inquiries: PressInquiryItem[];
  subscribers: SubscriberItem[];
  newsletters: NewsletterItem[];
  adminUsers: AdminUser[];
  settings: CMSSettings;
};

const initialDispatches: DispatchPost[] = [];
const initialInsights: DispatchPost[] = [];
const initialPressReleases: PressReleaseItem[] = [];

const initialInquiries: PressInquiryItem[] = [
  {
    id: "inq-1",
    name: "Amina Yusuf",
    organization: "Channels Television",
    email: "a.yusuf@channelstv.com",
    phone: "+234 803 123 4567",
    subject: "Interview Request: State of the Nation Address Reaction",
    message: "We would like to invite Chief Osita Chidoka for a live 20-minute studio segment on Politics Today regarding his Wole Soyinka Lecture paper.",
    date: "2026-07-28",
    status: "New"
  },
  {
    id: "inq-2",
    name: "Emeka Okonkwo",
    organization: "The Guardian Nigeria",
    email: "e.okonkwo@guardian.ng",
    phone: "+234 802 987 6543",
    subject: "Op-Ed Syndication Request",
    message: "Requesting permission to publish an excerpt of 'Governance as the Foundation for Africa's Future' in Sunday Guardian edition.",
    date: "2026-07-15",
    status: "Reviewed"
  }
];

const initialNewsletters: NewsletterItem[] = [];

const initialSubscribers: SubscriberItem[] = [
  { id: "sub-1", email: "dr.nwosu@unizik.edu.ng", date: "2026-07-02", source: "The Canon" },
  { id: "sub-2", email: "kemi.adebayo@policyhub.ng", date: "2026-07-10", source: "Blog" },
  { id: "sub-3", email: "j.obi@mekaria.org", date: "2026-07-22", source: "Header" }
];

const initialAdminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Jerry Agbedun",
    email: "jerryagbedun@gmail.com",
    role: "Super Admin",
    status: "Active",
    createdAt: "2026-01-01",
    lastLogin: "2026-08-20",
    passwordRaw: "OsitaAdmin2026!"
  },
  {
    id: "admin-2",
    name: "Chief Osita Chidoka",
    email: "osita@chidoka.org",
    role: "Super Admin",
    status: "Active",
    createdAt: "2026-01-01",
    lastLogin: "2026-08-15"
  }
];

const initialSettings: CMSSettings = {
  siteTitle: "Osita Chidoka — Public Servant, Writer & Institution Builder",
  contactEmail: "jerryagbedun@gmail.com",
  adminEmail: "jerryagbedun@gmail.com",
  adminPasswordHash: "OsitaAdmin2026!",
  adminPasswordRaw: "OsitaAdmin2026!",
  maintenanceMode: false
};

const CACHE_KEY = "osita_cms_cache_v2";

function loadCachedCMSData(): CMSData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.essays) &&
      (Array.isArray(parsed.insights) || Array.isArray(parsed.dispatches)) &&
      parsed.settings
    ) {
      const insightsList = parsed.insights || parsed.dispatches || [];
      const pressReleasesList = parsed.pressReleases || [];
      return {
        ...parsed,
        insights: insightsList,
        dispatches: insightsList,
        pressReleases: pressReleasesList
      } as CMSData;
    }
  } catch (err) {
    console.warn("[CMS Store] Failed to parse cached CMS data:", err);
  }
  return null;
}

function saveCachedCMSData(data: CMSData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("[CMS Store] Storage quota warning while caching, attempting lightweight save:", err);
    try {
      const lightweight = {
        ...data,
        essays: data.essays.map((e) => ({
          ...e,
          imageUrl: e.imageUrl && e.imageUrl.length > 50000 ? undefined : e.imageUrl
        })),
        insights: (data.insights || []).map((d) => ({
          ...d,
          imageUrl: d.imageUrl && d.imageUrl.length > 50000 ? undefined : d.imageUrl
        })),
        dispatches: (data.dispatches || []).map((d) => ({
          ...d,
          imageUrl: d.imageUrl && d.imageUrl.length > 50000 ? undefined : d.imageUrl
        })),
        pressReleases: (data.pressReleases || []).map((p) => ({
          ...p,
          imageUrl: p.imageUrl && p.imageUrl.length > 50000 ? undefined : p.imageUrl
        }))
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(lightweight));
    } catch (_) {
      // Ignore fallback storage quota error
    }
  }
}

const cachedInitialData = loadCachedCMSData();

let inMemoryData: CMSData = cachedInitialData || {
  essays: initialEssays,
  insights: initialInsights,
  dispatches: initialDispatches,
  pressReleases: initialPressReleases,
  inquiries: initialInquiries,
  subscribers: initialSubscribers,
  newsletters: initialNewsletters,
  adminUsers: initialAdminUsers,
  settings: initialSettings
};

let isInitializingPromise: Promise<CMSData> | null = null;
let isRealtimeListenerAttached = false;

function notifyCMSListeners() {
  saveCachedCMSData(inMemoryData);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("osita_cms_updated"));
  }
}

// 2. Initialize and Fetch Authoritative CMS Data from Firestore
export async function initCMSStore(): Promise<CMSData> {
  if (isInitializingPromise) {
    return isInitializingPromise;
  }

  isInitializingPromise = (async () => {
    try {
      // Setup Realtime Listeners once
      setupRealtimeListeners();

      // Fetch Essays
      const essaysSnap = await getDocs(collection(db, "essays"));
      let fetchedEssays: Essay[] = [];
      if (!essaysSnap.empty) {
        fetchedEssays = essaysSnap.docs.map(docSnap => docSnap.data() as Essay);
      } else {
        console.log("Firestore essays collection is empty. Migrating initial essays to backend...");
        for (const essay of initialEssays) {
          await setDoc(doc(db, "essays", essay.slug), essay);
        }
        fetchedEssays = [...initialEssays];
      }

      // Fetch Insights from 'insights' collection
      const insightsSnap = await getDocs(collection(db, "insights"));
      let fetchedInsights: DispatchPost[] = [];
      if (!insightsSnap.empty) {
        fetchedInsights = insightsSnap.docs.map(docSnap => docSnap.data() as DispatchPost);
      } else {
        fetchedInsights = [];
      }

      // Fetch Press Releases from 'press_releases' collection
      const pressReleasesSnap = await getDocs(collection(db, "press_releases"));
      let fetchedPressReleases: PressReleaseItem[] = [];
      if (!pressReleasesSnap.empty) {
        fetchedPressReleases = pressReleasesSnap.docs.map(docSnap => docSnap.data() as PressReleaseItem);
      } else {
        fetchedPressReleases = [];
      }

      // Fetch Inquiries
      const inquiriesSnap = await getDocs(collection(db, "inquiries"));
      let fetchedInquiries: PressInquiryItem[] = [];
      if (!inquiriesSnap.empty) {
        fetchedInquiries = inquiriesSnap.docs.map(docSnap => docSnap.data() as PressInquiryItem);
      } else {
        for (const inq of initialInquiries) {
          await setDoc(doc(db, "inquiries", inq.id), inq);
        }
        fetchedInquiries = [...initialInquiries];
      }

      // Fetch Subscribers
      const subscribersSnap = await getDocs(collection(db, "subscribers"));
      let fetchedSubscribers: SubscriberItem[] = [];
      let fetchedNewsletters: NewsletterItem[] = [];
      if (!subscribersSnap.empty) {
        fetchedSubscribers = subscribersSnap.docs.map(docSnap => docSnap.data() as SubscriberItem);
        inMemoryData.newsletters = fetchedNewsletters;
      } else {
        for (const sub of initialSubscribers) {
          await setDoc(doc(db, "subscribers", sub.id), sub);
        }
        fetchedSubscribers = [...initialSubscribers];
      }

      // Fetch Admin Users
      const adminUsersSnap = await getDocs(collection(db, "admin_users"));
      let fetchedAdminUsers: AdminUser[] = [];
      if (!adminUsersSnap.empty) {
        fetchedAdminUsers = adminUsersSnap.docs.map(docSnap => docSnap.data() as AdminUser);
      } else {
        for (const admin of initialAdminUsers) {
          await setDoc(doc(db, "admin_users", admin.id), admin);
        }
        fetchedAdminUsers = [...initialAdminUsers];
      }

      // Fetch Settings
      const settingsRef = doc(db, "settings", "global");
      const settingsSnap = await getDoc(settingsRef);
      let fetchedSettings: CMSSettings = initialSettings;
      if (settingsSnap.exists()) {
        fetchedSettings = { ...initialSettings, ...settingsSnap.data() } as CMSSettings;
      } else {
        await setDoc(settingsRef, initialSettings);
      }

      inMemoryData = {
        essays: fetchedEssays,
        insights: fetchedInsights,
        dispatches: fetchedInsights,
        pressReleases: fetchedPressReleases,
        inquiries: fetchedInquiries,
        subscribers: fetchedSubscribers,
        adminUsers: fetchedAdminUsers,
        settings: fetchedSettings,
        newsletters: fetchedNewsletters
      };

      notifyCMSListeners();
      return inMemoryData;
    } catch (err) {
      console.error("Error connecting to Firestore backend during CMS init:", err);
      return inMemoryData;
    }
  })();

  return isInitializingPromise;
}

// 3. Realtime Listeners
function setupRealtimeListeners() {
  if (isRealtimeListenerAttached || typeof window === "undefined") return;
  isRealtimeListenerAttached = true;

  try {
    onSnapshot(collection(db, "essays"), (snap) => {
      if (!snap.empty) {
        inMemoryData.essays = snap.docs.map(d => d.data() as Essay);
        notifyCMSListeners();
      }
    }, (err) => console.error("Realtime essays sync error:", err));

    onSnapshot(collection(db, "insights"), (snap) => {
      const items = snap.docs.map(d => d.data() as DispatchPost);
      inMemoryData.insights = items;
      inMemoryData.dispatches = items;
      notifyCMSListeners();
    }, (err) => console.error("Realtime insights sync error:", err));

    onSnapshot(collection(db, "press_releases"), (snap) => {
      const items = snap.docs.map(d => d.data() as PressReleaseItem);
      inMemoryData.pressReleases = items;
      notifyCMSListeners();
    }, (err) => console.error("Realtime press_releases sync error:", err));

    onSnapshot(collection(db, "inquiries"), (snap) => {
      inMemoryData.inquiries = snap.docs.map(d => d.data() as PressInquiryItem);
      notifyCMSListeners();
    }, (err) => console.error("Realtime inquiries sync error:", err));

    onSnapshot(collection(db, "subscribers"), (snap) => {
      inMemoryData.subscribers = snap.docs.map(d => d.data() as SubscriberItem);
      notifyCMSListeners();
    }, (err) => console.error("Realtime subscribers sync error:", err));

    onSnapshot(collection(db, "admin_users"), (snap) => {
      inMemoryData.adminUsers = snap.docs.map(d => d.data() as AdminUser);
      notifyCMSListeners();
    }, (err) => console.error("Realtime admin_users sync error:", err));

    onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        inMemoryData.settings = { ...initialSettings, ...snap.data() } as CMSSettings;
        notifyCMSListeners();
      }
    }, (err) => console.error("Realtime settings sync error:", err));
  } catch (e) {
    console.error("Could not bind Firestore realtime listeners:", e);
  }
}

// Automatically start background init on module load
if (typeof window !== "undefined") {
  initCMSStore().catch(e => console.error("Auto initCMSStore failed:", e));
}

// 4. Synchronous Read Wrapper
export function getCMSData(): CMSData {
  return inMemoryData;
}

// 5. Backend Persistence Operations (Async + Strict Error Handling)

export async function saveEssay(essay: Essay): Promise<void> {
  if (!essay.slug) {
    essay.slug = slugify(essay.title) || `essay-${Date.now()}`;
  }
  if (essay.pdfUrl && essay.pdfUrl !== "#") {
    essay.pdfUrl = formatDocumentDownloadUrl(essay.pdfUrl);
  }
  const cleanDoc = JSON.parse(JSON.stringify(essay));
  try {
    // Write to Firestore server FIRST
    await setDoc(doc(db, "essays", essay.slug), cleanDoc);
    
    const idx = inMemoryData.essays.findIndex(e => e.slug === essay.slug);
    if (idx >= 0) {
      inMemoryData.essays[idx] = cleanDoc;
    } else {
      inMemoryData.essays.unshift(cleanDoc);
    }
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend save failure for essay:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteEssay(slug: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "essays", slug));
    inMemoryData.essays = inMemoryData.essays.filter(e => e.slug !== slug);
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for essay:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function saveInsight(insight: DispatchPost): Promise<void> {
  if (!insight.id) {
    throw new Error("Insight ID is required.");
  }
  if (!insight.slug) {
    insight.slug = slugify(insight.title) || `osita-insight-${Date.now()}`;
  }
  if (insight.pdfUrl && insight.pdfUrl !== "#") {
    insight.pdfUrl = formatDocumentDownloadUrl(insight.pdfUrl);
  }
  const cleanDoc = JSON.parse(JSON.stringify(insight));
  try {
    await setDoc(doc(db, "insights", insight.id), cleanDoc);

    const idx = inMemoryData.insights.findIndex(d => d.id === insight.id);
    if (idx >= 0) {
      inMemoryData.insights[idx] = cleanDoc;
    } else {
      inMemoryData.insights.unshift(cleanDoc);
    }
    inMemoryData.dispatches = inMemoryData.insights;
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend save failure for insight:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteInsight(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "insights", id));
    inMemoryData.insights = inMemoryData.insights.filter(d => d.id !== id);
    inMemoryData.dispatches = inMemoryData.insights;
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for insight:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function saveDispatch(dispatch: DispatchPost): Promise<void> {
  return saveInsight(dispatch);
}

export async function deleteDispatch(id: string): Promise<void> {
  return deleteInsight(id);
}

export async function savePressRelease(pressRelease: PressReleaseItem): Promise<void> {
  if (!pressRelease.id) {
    pressRelease.id = `pr-${Date.now()}`;
  }
  if (!pressRelease.slug) {
    pressRelease.slug = slugify(pressRelease.title) || `press-release-${Date.now()}`;
  }
  if (!pressRelease.category) {
    pressRelease.category = "Press Release";
  }
  if (pressRelease.pdfUrl && pressRelease.pdfUrl !== "#") {
    pressRelease.pdfUrl = formatDocumentDownloadUrl(pressRelease.pdfUrl);
  }
  const cleanDoc = JSON.parse(JSON.stringify(pressRelease));
  try {
    await setDoc(doc(db, "press_releases", pressRelease.id), cleanDoc);

    const idx = inMemoryData.pressReleases.findIndex(p => p.id === pressRelease.id);
    if (idx >= 0) {
      inMemoryData.pressReleases[idx] = cleanDoc;
    } else {
      inMemoryData.pressReleases.unshift(cleanDoc);
    }
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend save failure for press release:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deletePressRelease(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "press_releases", id));
    inMemoryData.pressReleases = inMemoryData.pressReleases.filter(p => p.id !== id);
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for press release:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteAllPressReleases(): Promise<number> {
  let deletedCount = 0;

  try {
    const snap = await getDocs(collection(db, "press_releases"));
    for (const docSnap of snap.docs) {
      await deleteDoc(doc(db, "press_releases", docSnap.id));
      deletedCount++;
    }
  } catch (err) {
    console.warn("Direct Firestore press_releases collection cleanup error:", err);
  }

  inMemoryData.pressReleases = [];
  notifyCMSListeners();

  return deletedCount;
}

export async function importOsitaInsightsToStore(
  items: Array<{
    title: string;
    description: string;
    publicationDate: string;
    featuredImage: string;
    episodeUrl: string;
    category: "Osita Insight";
    source: "ClearPath Media";
  }>
): Promise<number> {
  let savedCount = 0;

  for (const item of items) {
    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    const id = `insight-${slug.substring(0, 40)}`;

    const newPost: DispatchPost = {
      id,
      slug: slug || `osita-insight-${Date.now()}`,
      title: item.title,
      date: item.publicationDate || new Date().toISOString().split("T")[0],
      category: "Osita Insight",
      summary: item.description,
      content: item.description.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0),
      published: true,
      author: "Osita Chidoka",
      source: "ClearPath Media",
      episodeUrl: item.episodeUrl,
      imageUrl: item.featuredImage,
      pdfUrl: item.episodeUrl,
    };

    await saveInsight(newPost);
    savedCount++;
  }

  return savedCount;
}

export async function deleteAllOsitaInsights(): Promise<number> {
  let deletedCount = 0;

  try {
    const insightsSnap = await getDocs(collection(db, "insights"));
    for (const docSnap of insightsSnap.docs) {
      await deleteDoc(doc(db, "insights", docSnap.id));
      deletedCount++;
    }
  } catch (err) {
    console.warn("Direct Firestore insights collection cleanup error:", err);
  }

  try {
    const dispatchesSnap = await getDocs(collection(db, "dispatches"));
    for (const docSnap of dispatchesSnap.docs) {
      await deleteDoc(doc(db, "dispatches", docSnap.id));
    }
  } catch (err) {
    console.warn("Direct Firestore dispatches cleanup error:", err);
  }

  inMemoryData.insights = [];
  inMemoryData.dispatches = [];
  notifyCMSListeners();

  return deletedCount;
}

export async function addCMSInquiry(inquiry: Omit<PressInquiryItem, "id" | "date" | "status">): Promise<PressInquiryItem> {
  const newItem: PressInquiryItem = {
    ...inquiry,
    id: `inq-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    status: "New"
  };
  try {
    await setDoc(doc(db, "inquiries", newItem.id), newItem);
    inMemoryData.inquiries.unshift(newItem);
    notifyCMSListeners();
    return newItem;
  } catch (err) {
    console.error("Backend save failure for inquiry:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function updateInquiryStatus(id: string, status: "New" | "Reviewed" | "Archived"): Promise<PressInquiryItem[]> {
  const item = inMemoryData.inquiries.find(i => i.id === id);
  if (item) {
    const updated = { ...item, status };
    try {
      await setDoc(doc(db, "inquiries", id), updated);
      item.status = status;
      notifyCMSListeners();
    } catch (err) {
      console.error("Backend update failure for inquiry:", err);
      throw new Error(`Server update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return inMemoryData.inquiries;
}

export async function deleteInquiry(id: string): Promise<PressInquiryItem[]> {
  try {
    await deleteDoc(doc(db, "inquiries", id));
    inMemoryData.inquiries = inMemoryData.inquiries.filter(i => i.id !== id);
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for inquiry:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  return inMemoryData.inquiries;
}

export async function addCMSSubscriber(email: string, name: string = "", source = "Website"): Promise<SubscriberItem> {
  const existing = inMemoryData.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("You are already subscribed.");
  }

  const newSub: SubscriberItem = {
    id: `sub-${Date.now()}`,
    name,
    email,
    date: new Date().toISOString().split("T")[0],
    source
  };
  try {
    await setDoc(doc(db, "subscribers", newSub.id), newSub);
    inMemoryData.subscribers.unshift(newSub);
    notifyCMSListeners();
    return newSub;
  } catch (err) {
    console.error("Backend save failure for subscriber:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function updateCMSSettings(newSettings: Partial<CMSSettings>): Promise<CMSSettings> {
  const merged = { ...inMemoryData.settings, ...newSettings };
  try {
    await setDoc(doc(db, "settings", "global"), merged);
    inMemoryData.settings = merged;
    notifyCMSListeners();
    return merged;
  } catch (err) {
    console.error("Backend save failure for settings:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Legacy wrappers for compatibility
export function updateCMSEssays(newEssays: Essay[]) {
  inMemoryData.essays = newEssays;
  notifyCMSListeners();
  return newEssays;
}

export function updateCMSDispatches(newDispatches: DispatchPost[]) {
  inMemoryData.dispatches = newDispatches;
  notifyCMSListeners();
  return newDispatches;
}


export async function saveNewsletter(newsletter: Partial<NewsletterItem>): Promise<NewsletterItem> {
  const isNew = !newsletter.id;
  const newNL: NewsletterItem = {
    id: newsletter.id || `nl-${Date.now()}`,
    subject: newsletter.subject || "Untitled Newsletter",
    content: newsletter.content || "",
    status: newsletter.status || 'draft',
    createdAt: newsletter.createdAt || new Date().toISOString(),
    scheduledFor: newsletter.scheduledFor,
    sentAt: newsletter.sentAt
  };

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (db) {
      await setDoc(doc(db, "osita_newsletters", newNL.id), newNL);
    }
  } catch (err) {
    console.warn("Backend unavailable, saving newsletter to memory.");
  }

  const existingIndex = inMemoryData.newsletters.findIndex(n => n.id === newNL.id);
  if (existingIndex >= 0) {
    inMemoryData.newsletters[existingIndex] = newNL;
  } else {
    inMemoryData.newsletters.push(newNL);
  }
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("osita_cms_updated"));
  }
  return newNL;
}

export async function deleteNewsletter(id: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (db) {
      await deleteDoc(doc(db, "osita_newsletters", id));
    }
  } catch (err) {
    console.warn("Backend unavailable, deleting newsletter from memory.");
  }

  inMemoryData.newsletters = inMemoryData.newsletters.filter(n => n.id !== id);
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("osita_cms_updated"));
  }
}

export async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch'): Promise<void> {
  try {
    const { doc, updateDoc, increment } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    
    if (!db) return;

    if (type === 'essay') {
      const docRef = doc(db, "osita_essays", id);
      await updateDoc(docRef, { downloads: increment(1) });
    } else {
      const docRef = doc(db, "osita_dispatches", id);
      await updateDoc(docRef, { downloads: increment(1) });
    }
  } catch (error) {
    console.error("Failed to increment download count", error);
  }
}

export async function saveAdminUser(admin: AdminUser): Promise<AdminUser> {
  if (!admin.id) {
    admin.id = `admin-${Date.now()}`;
  }
  if (!admin.createdAt) {
    admin.createdAt = new Date().toISOString().split("T")[0];
  }
  const cleanDoc = JSON.parse(JSON.stringify(admin));
  try {
    await setDoc(doc(db, "admin_users", admin.id), cleanDoc);
    if (!inMemoryData.adminUsers) inMemoryData.adminUsers = [];
    const idx = inMemoryData.adminUsers.findIndex((a) => a.id === admin.id);
    if (idx >= 0) {
      inMemoryData.adminUsers[idx] = cleanDoc;
    } else {
      inMemoryData.adminUsers.unshift(cleanDoc);
    }
    notifyCMSListeners();
    return cleanDoc;
  } catch (err) {
    console.error("Backend save failure for admin user:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteAdminUser(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "admin_users", id));
    if (inMemoryData.adminUsers) {
      inMemoryData.adminUsers = inMemoryData.adminUsers.filter((a) => a.id !== id);
    }
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for admin user:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
