import { useState, useEffect } from "react";
import { essays as initialEssays, Essay } from "./essays";

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

export type SubscriberItem = {
  id: string;
  email: string;
  date: string;
  source: string;
};

export type CMSSettings = {
  siteTitle: string;
  contactEmail: string;
  adminEmail: string;
  adminPasswordHash: string;
  adminPasswordRaw: string;
  maintenanceMode: boolean;
};

export type CMSData = {
  essays: Essay[];
  dispatches: DispatchPost[];
  inquiries: PressInquiryItem[];
  subscribers: SubscriberItem[];
  settings: CMSSettings;
};

const initialDispatches: DispatchPost[] = [
  {
    id: "disp-1",
    slug: "moral-consensus-and-the-state",
    title: "Moral Consensus and the State: On Wole Soyinka's 92nd Birthday",
    date: "July 14, 2026",
    category: "Politics",
    summary: "Reflections on civic courage, institutional decay, and why political reform fails without a shared ethical baseline.",
    content: [
      "In my recent keynote address in Port Harcourt, I argued that constitutional amendments and legislative tweaks will fail to produce national renewal unless accompanied by a moral consensus.",
      "Power in Nigeria has become increasingly disconnected from public service. When citizens view the state purely as an extraction engine, civic duty collapses into private self-preservation.",
      "To rebuild Nigeria, we must construct local institutions that demonstrate visible integrity. Transparency is not merely an administrative procedure; it is a moral declaration."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 240
  },
  {
    id: "disp-2",
    slug: "mekaria-philosophy-in-action",
    title: "The Mekaria Philosophy: Reclaiming Excellence in Education",
    date: "June 28, 2026",
    category: "Youth",
    summary: "How our mentorship program is equipping 500 young leaders with technical skills, policy literacy, and executive discipline.",
    content: [
      "Through the Mekaria Mentorship Programme, we are testing a hypothesis: that young Nigerians, given rigorous training and moral clarity, can outperform institutional paralysis.",
      "Our fellows are currently developing open-data dashboards for local council budgets, analyzing transit logistics in Lagos, and drafting policy briefs for state assemblies.",
      "Excellence is a habit forged in discipline, not an accidental gift."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 185
  },
  {
    id: "disp-3",
    slug: "data-driven-regional-development",
    title: "Data-Driven Regional Governance in the South-East",
    date: "May 19, 2026",
    category: "Development",
    summary: "Moving beyond historical grievances to build concrete economic corridors, industrial parks, and digital infrastructure.",
    content: [
      "Grievance is a natural emotional response to historical unfairness, but it is a terrible foundation for economic planning.",
      "Our proposed South-East Economic Corridor focuses on three actionable metrics: power grid uptime in industrial clusters, port clearance efficiency, and software engineering talent production.",
      "When regional leaders lead with data, investors follow with capital."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 310
  },
  {
    id: "disp-4",
    slug: "modernizing-national-transport-systems",
    title: "Modernizing National Transit Logistics & Road Safety",
    date: "April 12, 2026",
    category: "Transport",
    summary: "Key lessons from FRSC intelligence systems applied to inter-state railway freight and urban traffic automation.",
    content: [
      "During my tenure as Corps Marshal of the FRSC, we pioneered technology-driven enforcement and real-time database management for vehicle licensing.",
      "Today, Nigeria's interstate transport network requires a similar digital leap — connecting rail freight corridors to seaport terminals with automated tracking.",
      "Safety and efficiency on national transit corridors are directly tied to economic productivity and investor confidence."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 215
  },
  {
    id: "disp-5",
    slug: "unlocking-sme-capital-and-innovation",
    title: "Unlocking SME Capital and Enterprise Innovation",
    date: "March 04, 2026",
    category: "Business",
    summary: "Strategic approaches to reducing regulatory bottlenecks and securing low-interest funding for African entrepreneurs.",
    content: [
      "Small and medium enterprises form the backbone of Nigeria's real economy, yet they face severe headwinds in credit access and multi-tier taxation.",
      "To unlock private enterprise, state governments must establish transparent collateral registries and streamlined business registration hubs.",
      "Empowering local business leaders is the fastest route to durable job creation across the nation."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 198
  },
  {
    id: "disp-6",
    slug: "preserving-heritage-inspiring-the-future",
    title: "Cultural Identity as an Anchor for Civic Virtue",
    date: "February 18, 2026",
    category: "Culture",
    summary: "Exploring how traditional values, civic philosophy, and cultural storytelling can guide modern African governance.",
    content: [
      "A nation without cultural memory quickly loses its moral compass in times of political turmoil.",
      "Our ancestral traditions emphasize communal accountability, respect for truth, and pride in honest labor — values that must be reinjected into public administration.",
      "Culture is not merely performance; it is the living philosophy that binds a society together."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 162
  },
  {
    id: "disp-7",
    slug: "principles-of-institutional-leadership",
    title: "Leadership Discipline: Execution vs Experience",
    date: "January 22, 2026",
    category: "Leadership",
    summary: "Why executive leadership requires a relentless focus on measurable delivery, institutional integrity, and courageous decision-making.",
    content: [
      "True leadership is judged not by the eloquence of speeches, but by the strength of the institutions left behind.",
      "Leaders must cultivate a culture of rigorous execution, clear accountability, and unyielding ethical standards across every level of public service.",
      "When leaders model personal discipline, institutions transform from bureaucratic bottlenecks into engines of public good."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 275
  }
];

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

const initialSubscribers: SubscriberItem[] = [
  { id: "sub-1", email: "dr.nwosu@unizik.edu.ng", date: "2026-07-02", source: "The Canon" },
  { id: "sub-2", email: "kemi.adebayo@policyhub.ng", date: "2026-07-10", source: "Blog" },
  { id: "sub-3", email: "j.obi@mekaria.org", date: "2026-07-22", source: "Header" }
];

const initialSettings: CMSSettings = {
  siteTitle: "Osita Chidoka — Public Servant, Writer & Institution Builder",
  contactEmail: "jerryagbedun@gmail.com",
  adminEmail: "jerryagbedun@gmail.com",
  adminPasswordHash: "OsitaAdmin2026!",
  adminPasswordRaw: "OsitaAdmin2026!",
  maintenanceMode: false
};

const STORAGE_KEY = "osita_cms_local_db_v5";

let inMemoryData: CMSData | null = null;

// --- INDEXEDDB ENGINE FOR LARGE ATTACHMENT PERSISTENCE ---
const IDB_NAME = "OsitaCMS_IDB_DB_v2";
const IDB_STORE = "cms_store";
const IDB_KEY = "osita_cms_root_data";

function openCMSDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        console.warn("IndexedDB open error:", e);
        resolve(null);
      };
    } catch (err) {
      console.warn("IndexedDB not supported or blocked:", err);
      resolve(null);
    }
  });
}

async function loadCMSDataFromIDB(): Promise<CMSData | null> {
  const db = await openCMSDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => resolve((req.result as CMSData) || null);
      req.onerror = () => resolve(null);
    } catch (e) {
      console.warn("IndexedDB load request failed:", e);
      resolve(null);
    }
  });
}

async function saveCMSDataToIDB(data: CMSData): Promise<void> {
  const db = await openCMSDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(data, IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = (e) => {
        console.warn("IndexedDB save request failed:", e);
        resolve();
      };
    } catch (e) {
      console.warn("IndexedDB transaction failed:", e);
      resolve();
    }
  });
}

let isIDBInitialized = false;
let isIDBLoading = false;

export function initCMSStoreFromIndexedDB(onLoaded?: (data: CMSData) => void) {
  if (typeof window === "undefined" || isIDBLoading) return;
  isIDBLoading = true;
  loadCMSDataFromIDB().then((dbData) => {
    isIDBLoading = false;
    isIDBInitialized = true;
    if (dbData && Array.isArray(dbData.essays) && dbData.essays.length > 0) {
      inMemoryData = dbData;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dbData));
      } catch {
        // ignore quota error for large session storage objects
      }
      window.dispatchEvent(new Event("osita_cms_updated"));
      if (onLoaded) onLoaded(dbData);
    }
  });
}

export function getCMSData(): CMSData {
  if (inMemoryData) {
    if (typeof window !== "undefined" && !isIDBInitialized && !isIDBLoading) {
      initCMSStoreFromIndexedDB();
    }
    return inMemoryData;
  }

  if (typeof window === "undefined") {
    return {
      essays: initialEssays,
      dispatches: initialDispatches,
      inquiries: initialInquiries,
      subscribers: initialSubscribers,
      settings: initialSettings
    };
  }

  if (!isIDBInitialized && !isIDBLoading) {
    initCMSStoreFromIndexedDB();
  }

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = sessionStorage.getItem(STORAGE_KEY);
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      const savedEssays: Essay[] = Array.isArray(parsed.essays) && parsed.essays.length > 0 ? parsed.essays : initialEssays;
      const savedDispatches: DispatchPost[] = Array.isArray(parsed.dispatches) && parsed.dispatches.length > 0 ? parsed.dispatches : initialDispatches;

      inMemoryData = {
        essays: savedEssays,
        dispatches: savedDispatches,
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : initialInquiries,
        subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : initialSubscribers,
        settings: { ...initialSettings, ...(parsed.settings || {}) }
      };
      return inMemoryData;
    }
  } catch (err) {
    console.error("Error reading CMS data from localStorage:", err);
  }

  const defaultData: CMSData = {
    essays: initialEssays,
    dispatches: initialDispatches,
    inquiries: initialInquiries,
    subscribers: initialSubscribers,
    settings: initialSettings
  };
  inMemoryData = defaultData;
  return defaultData;
}

export function saveCMSData(data: CMSData) {
  inMemoryData = data;
  if (typeof window !== "undefined") {
    // 1. Asynchronously persist full data to IndexedDB (unlimited storage for PDFs and attached images)
    saveCMSDataToIDB(data).catch((err) => console.warn("Failed saving to IndexedDB:", err));

    // 2. Synchronously update localStorage & sessionStorage with quota fallback
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } catch (err) {
      console.warn("Storage quota limit exceeded. Saving light dataset backup to localStorage while IndexedDB maintains full attachments.", err);
      try {
        const lightData: CMSData = {
          ...data,
          essays: data.essays.map((e) => ({
            ...e,
            imageUrl: e.imageUrl && e.imageUrl.length > 100000 ? "" : e.imageUrl,
            pdfUrl: e.pdfUrl && e.pdfUrl.length > 100000 ? "#" : e.pdfUrl,
          })),
          dispatches: data.dispatches.map((d) => ({
            ...d,
            imageUrl: d.imageUrl && d.imageUrl.length > 100000 ? "" : d.imageUrl,
            pdfUrl: d.pdfUrl && d.pdfUrl.length > 100000 ? "#" : d.pdfUrl,
          }))
        };
        const lightSerialized = JSON.stringify(lightData);
        localStorage.setItem(STORAGE_KEY, lightSerialized);
        sessionStorage.setItem(STORAGE_KEY, lightSerialized);
      } catch (innerErr) {
        console.warn("Could not write light backup to localStorage:", innerErr);
      }
    }

    // Dispatch global event so subscribers update immediately
    window.dispatchEvent(new Event("osita_cms_updated"));
  }
}

export function updateCMSEssays(newEssays: Essay[]) {
  const current = getCMSData();
  current.essays = newEssays;
  saveCMSData(current);
  return newEssays;
}

export function updateCMSDispatches(newDispatches: DispatchPost[]) {
  const current = getCMSData();
  current.dispatches = newDispatches;
  saveCMSData(current);
  return newDispatches;
}

export function addCMSInquiry(inquiry: Omit<PressInquiryItem, "id" | "date" | "status">) {
  const current = getCMSData();
  const newItem: PressInquiryItem = {
    ...inquiry,
    id: `inq-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    status: "New"
  };
  current.inquiries.unshift(newItem);
  saveCMSData(current);
  return newItem;
}

export function updateInquiryStatus(id: string, status: "New" | "Reviewed" | "Archived") {
  const current = getCMSData();
  const item = current.inquiries.find(i => i.id === id);
  if (item) {
    item.status = status;
    saveCMSData(current);
  }
  return current.inquiries;
}

export function deleteInquiry(id: string) {
  const current = getCMSData();
  current.inquiries = current.inquiries.filter(i => i.id !== id);
  saveCMSData(current);
  return current.inquiries;
}

export function addCMSSubscriber(email: string, source = "Website") {
  const current = getCMSData();
  const existing = current.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const newSub: SubscriberItem = {
    id: `sub-${Date.now()}`,
    email,
    date: new Date().toISOString().split("T")[0],
    source
  };
  current.subscribers.unshift(newSub);
  saveCMSData(current);
  return newSub;
}

export function useCMSData(): CMSData {
  const [data, setData] = useState<CMSData>(() => getCMSData());

  useEffect(() => {
    initCMSStoreFromIndexedDB((updated) => {
      setData({ ...updated });
    });

    const handleUpdate = () => {
      setData({ ...getCMSData() });
    };

    window.addEventListener("osita_cms_updated", handleUpdate);
    return () => window.removeEventListener("osita_cms_updated", handleUpdate);
  }, []);

  return data;
}

export function updateCMSSettings(newSettings: Partial<CMSSettings>) {
  const current = getCMSData();
  current.settings = { ...current.settings, ...newSettings };
  saveCMSData(current);
  return current.settings;
}
